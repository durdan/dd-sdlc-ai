import { NextRequest } from 'next/server';
import { GitHubAnalyzer, analyzeGitHubRepo } from '@/lib/github-analyzer';
import { streamSpec, generateShareId } from '@/lib/spec-generator';
import { ERROR_MESSAGES } from '@/types/analyzer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SSE event formatter
function formatSSE(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Async generator for streaming analysis
async function* analyzeRepoStream(repoUrl: string): AsyncGenerator<string> {
  // Immediately yield a connected event
  yield formatSSE('connected', { message: 'Stream established', timestamp: Date.now() });

  // Parse URL
  let parsedUrl;
  try {
    parsedUrl = GitHubAnalyzer.parseRepoUrl(repoUrl);
  } catch {
    yield formatSSE('error', { error: ERROR_MESSAGES.INVALID_URL });
    return;
  }

  // Step 1: Validate repository
  yield formatSSE('progress', { step: 'fetching_metadata', label: 'Fetching repository metadata', percent: 10 });

  const analyzer = new GitHubAnalyzer(parsedUrl.owner, parsedUrl.repo);
  const validation = await analyzer.validateRepo();

  if (!validation.valid) {
    yield formatSSE('error', { error: ERROR_MESSAGES[validation.error!], errorCode: validation.error });
    return;
  }

  // Step 2: Analyze structure
  yield formatSSE('progress', { step: 'analyzing_structure', label: 'Analyzing directory structure', percent: 30 });

  // Step 3: Read files
  yield formatSSE('progress', { step: 'reading_files', label: 'Reading key configuration files', percent: 50 });

  // Perform full analysis
  const analysisData = await analyzeGitHubRepo(repoUrl);

  // Step 4: Generate spec
  yield formatSSE('progress', { step: 'analyzing_architecture', label: 'Analyzing architecture patterns', percent: 70 });

  // Step 5: Stream spec generation
  yield formatSSE('progress', { step: 'generating_spec', label: 'Generating specification', percent: 85 });

  let fullContent = '';

  // Stream the spec generation
  for await (const chunk of streamSpec(analysisData)) {
    if (chunk.type === 'content') {
      fullContent += chunk.data;
      yield formatSSE('content', { text: chunk.data });
    } else if (chunk.type === 'done') {
      yield formatSSE('progress', { step: 'complete', label: 'Complete', percent: 100 });
    }
  }

  // Send final result
  const shareId = generateShareId();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev';

  yield formatSSE('complete', {
    success: true,
    specId: shareId,
    shareUrl: `${appUrl}/spec/${shareId}`,
    markdown: fullContent,
    metadata: {
      generatedAt: new Date().toISOString(),
      repoUrl: analysisData.info.html_url,
      repoOwner: analysisData.info.owner.login,
      repoName: analysisData.info.name,
    },
  });
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { repoUrl } = body;

    if (!repoUrl) {
      return new Response(
        formatSSE('error', { error: 'Repository URL is required' }),
        {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
          },
        }
      );
    }

    // Create a TransformStream to handle the conversion
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Start the analysis in the background
    (async () => {
      try {
        for await (const chunk of analyzeRepoStream(repoUrl)) {
          await writer.write(encoder.encode(chunk));
        }
      } catch (error) {
        console.error('Stream error:', error);
        await writer.write(
          encoder.encode(
            formatSSE('error', {
              error: error instanceof Error ? error.message : 'Analysis failed',
              errorCode: 'ANALYSIS_FAILED',
            })
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error('Request error:', error);
    return new Response(
      formatSSE('error', { error: 'Failed to process request' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'text/event-stream',
        },
      }
    );
  }
}
