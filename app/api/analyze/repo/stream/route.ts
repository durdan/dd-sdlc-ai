import { NextRequest } from 'next/server';
import { GitHubAnalyzer, analyzeGitHubRepo } from '@/lib/github-analyzer';
import { streamSpec, generateShareId } from '@/lib/spec-generator';
import { ERROR_MESSAGES } from '@/types/analyzer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Parse request
        const body = await request.json();
        const { repoUrl } = body;

        if (!repoUrl) {
          sendEvent('error', { error: 'Repository URL is required' });
          controller.close();
          return;
        }

        // Parse URL
        let parsedUrl;
        try {
          parsedUrl = GitHubAnalyzer.parseRepoUrl(repoUrl);
        } catch {
          sendEvent('error', { error: ERROR_MESSAGES.INVALID_URL });
          controller.close();
          return;
        }

        // Step 1: Validate repository
        sendEvent('progress', { step: 'fetching_metadata', label: 'Fetching repository metadata', percent: 10 });

        const analyzer = new GitHubAnalyzer(parsedUrl.owner, parsedUrl.repo);
        const validation = await analyzer.validateRepo();

        if (!validation.valid) {
          sendEvent('error', { error: ERROR_MESSAGES[validation.error!], errorCode: validation.error });
          controller.close();
          return;
        }

        // Step 2: Analyze structure
        sendEvent('progress', { step: 'analyzing_structure', label: 'Analyzing directory structure', percent: 30 });

        // Step 3: Read files
        sendEvent('progress', { step: 'reading_files', label: 'Reading key configuration files', percent: 50 });

        // Perform full analysis
        const analysisData = await analyzeGitHubRepo(repoUrl);

        // Step 4: Generate spec
        sendEvent('progress', { step: 'analyzing_architecture', label: 'Analyzing architecture patterns', percent: 70 });

        // Step 5: Stream spec generation
        sendEvent('progress', { step: 'generating_spec', label: 'Generating specification', percent: 85 });

        let fullContent = '';

        // Stream the spec generation
        for await (const chunk of streamSpec(analysisData)) {
          if (chunk.type === 'content') {
            fullContent += chunk.data;
            sendEvent('content', { text: chunk.data });
          } else if (chunk.type === 'done') {
            sendEvent('progress', { step: 'complete', label: 'Complete', percent: 100 });
          }
        }

        // Send final result
        const shareId = generateShareId();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev';

        sendEvent('complete', {
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

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        sendEvent('error', {
          error: error instanceof Error ? error.message : 'Analysis failed',
          errorCode: 'ANALYSIS_FAILED',
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
