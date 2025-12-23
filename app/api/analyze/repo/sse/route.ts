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

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const url = new URL(request.url);
  const repoUrl = url.searchParams.get('repo');

  if (!repoUrl) {
    return new Response(
      formatSSE('error', { error: 'Repository URL is required' }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(formatSSE(event, data)));
      };

      try {
        // Send connected event immediately
        send('connected', { message: 'Stream established', timestamp: Date.now() });

        // Parse URL
        let parsedUrl;
        try {
          parsedUrl = GitHubAnalyzer.parseRepoUrl(repoUrl);
        } catch {
          send('error', { error: ERROR_MESSAGES.INVALID_URL });
          controller.close();
          return;
        }

        // Step 1: Validate repository
        send('progress', { step: 'fetching_metadata', label: 'Fetching repository metadata', percent: 10 });

        const analyzer = new GitHubAnalyzer(parsedUrl.owner, parsedUrl.repo);
        const validation = await analyzer.validateRepo();

        if (!validation.valid) {
          send('error', { error: ERROR_MESSAGES[validation.error!], errorCode: validation.error });
          controller.close();
          return;
        }

        // Step 2: Analyze structure
        send('progress', { step: 'analyzing_structure', label: 'Analyzing directory structure', percent: 30 });

        // Step 3: Read files
        send('progress', { step: 'reading_files', label: 'Reading key configuration files', percent: 50 });

        // Perform full analysis
        const analysisData = await analyzeGitHubRepo(repoUrl);

        // Step 4: Generate spec
        send('progress', { step: 'analyzing_architecture', label: 'Analyzing architecture patterns', percent: 70 });

        // Step 5: Stream spec generation
        send('progress', { step: 'generating_spec', label: 'Generating specification', percent: 85 });

        let fullContent = '';

        // Stream the spec generation
        for await (const chunk of streamSpec(analysisData)) {
          if (chunk.type === 'content') {
            fullContent += chunk.data;
            send('content', { text: chunk.data });
          } else if (chunk.type === 'done') {
            send('progress', { step: 'complete', label: 'Complete', percent: 100 });
          }
        }

        // Send final result
        const shareId = generateShareId();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sdlc.dev';

        send('complete', {
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
        send('error', {
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
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
