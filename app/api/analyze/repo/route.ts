import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GitHubAnalyzer, analyzeGitHubRepo } from '@/lib/github-analyzer';
import { generateSpec, generateShareId } from '@/lib/spec-generator';
import { AnalyzeResponse, ERROR_MESSAGES, AnalyzeErrorCode } from '@/types/analyzer';

// Request validation schema
const analyzeRequestSchema = z.object({
  repoUrl: z.string().min(1, 'Repository URL is required'),
  options: z
    .object({
      includeApiDocs: z.boolean().optional().default(true),
      includeArchitectureDiagram: z.boolean().optional().default(true),
      analysisDepth: z.enum(['standard', 'deep']).optional().default('standard'),
    })
    .optional()
    .default({}),
});

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = analyzeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          errorCode: 'INVALID_URL' as AnalyzeErrorCode,
        },
        { status: 400 }
      );
    }

    const { repoUrl } = validationResult.data;

    // Parse the repository URL
    let parsedUrl;
    try {
      parsedUrl = GitHubAnalyzer.parseRepoUrl(repoUrl);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.INVALID_URL,
          errorCode: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    // Create analyzer and validate repository
    const analyzer = new GitHubAnalyzer(parsedUrl.owner, parsedUrl.repo);
    const validation = await analyzer.validateRepo();

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES[validation.error!],
          errorCode: validation.error,
        },
        { status: validation.error === 'RATE_LIMITED' ? 429 : 400 }
      );
    }

    // Perform full analysis
    console.log(`Analyzing repository: ${parsedUrl.owner}/${parsedUrl.repo}`);
    const analysisData = await analyzeGitHubRepo(repoUrl);

    // Generate specification using Claude
    console.log('Generating specification...');
    const spec = await generateSpec(analysisData);

    // Generate share ID
    const shareId = generateShareId();
    spec.shareId = shareId;

    // TODO: Store spec in database for sharing
    // await storeSpec(shareId, spec);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev';

    return NextResponse.json({
      success: true,
      specId: shareId,
      spec,
      shareUrl: `${appUrl}/spec/${shareId}`,
    });
  } catch (error) {
    console.error('Analysis error:', error);

    // Handle specific error types
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.RATE_LIMITED,
          errorCode: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return NextResponse.json(
        {
          success: false,
          error: ERROR_MESSAGES.REPO_NOT_FOUND,
          errorCode: 'REPO_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: ERROR_MESSAGES.ANALYSIS_FAILED,
        errorCode: 'ANALYSIS_FAILED',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check API status
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    message: 'Repository Analyzer API is running',
    endpoints: {
      analyze: 'POST /api/analyze/repo',
    },
  });
}
