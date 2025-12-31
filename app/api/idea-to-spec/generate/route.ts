import { NextRequest, NextResponse } from 'next/server';
import { getPromptForDiagram } from '@/lib/idea-to-spec/prompts';
import { DiagramType } from '@/lib/idea-to-spec/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// SSE event formatter
function formatSSE(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;

// Delay helper
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Check if error is retryable (rate limit or server error)
function isRetryableError(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const { idea, diagramType, context } = body as {
      idea: string;
      diagramType: DiagramType;
      context?: string;
    };

    if (!idea || !diagramType) {
      return NextResponse.json(
        { error: 'Missing required fields: idea and diagramType' },
        { status: 400 }
      );
    }

    const validTypes: DiagramType[] = ['mindmap', 'journey', 'usecase', 'architecture', 'c4', 'sequence', 'erd', 'flowchart'];
    if (!validTypes.includes(diagramType)) {
      return NextResponse.json(
        { error: `Invalid diagram type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Get the appropriate prompt
    const { system, user } = getPromptForDiagram(diagramType, idea, context);

    // Determine which AI provider to use
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json(
        { error: 'No AI API key configured' },
        { status: 500 }
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(formatSSE(event, data)));
        };

        try {
          send('start', { diagramType, message: `Generating ${diagramType} diagram...` });

          let generated = false;

          // Try OpenAI first if available (more reliable)
          if (openaiKey) {
            try {
              await streamFromOpenAI(openaiKey, system, user, send);
              generated = true;
            } catch (openaiError) {
              console.error('OpenAI generation failed:', openaiError);
              // Fall through to try Anthropic
            }
          }

          // Try Anthropic as fallback
          if (!generated && anthropicKey) {
            try {
              await streamFromAnthropic(anthropicKey, system, user, send);
              generated = true;
            } catch (anthropicError) {
              console.error('Anthropic generation failed:', anthropicError);
              throw anthropicError; // Throw if both failed
            }
          }

          if (!generated) {
            throw new Error('No AI provider available or all providers failed');
          }

          send('complete', { success: true });
        } catch (error) {
          console.error('Generation error:', error);
          send('error', { error: error instanceof Error ? error.message : 'Generation failed' });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function streamFromAnthropic(
  apiKey: string,
  system: string,
  user: string,
  send: (event: string, data: unknown) => void
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          stream: true,
          system,
          messages: [{ role: 'user', content: user }],
        }),
      });

      if (!response.ok) {
        if (isRetryableError(response.status) && attempt < MAX_RETRIES - 1) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
          console.log(`Anthropic rate limited (${response.status}), retrying in ${delayMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          send('retry', { attempt: attempt + 1, maxRetries: MAX_RETRIES, delayMs });
          await delay(delayMs);
          continue;
        }
        const error = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                send('chunk', { text: parsed.delta.text });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`Anthropic error, retrying in ${delayMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error('Anthropic API failed after retries');
}

async function streamFromOpenAI(
  apiKey: string,
  system: string,
  user: string,
  send: (event: string, data: unknown) => void
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          max_tokens: 4096,
          stream: true,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
      });

      if (!response.ok) {
        if (isRetryableError(response.status) && attempt < MAX_RETRIES - 1) {
          const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
          console.log(`OpenAI rate limited (${response.status}), retrying in ${delayMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
          send('retry', { attempt: attempt + 1, maxRetries: MAX_RETRIES, delayMs });
          await delay(delayMs);
          continue;
        }
        const error = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                send('chunk', { text: content });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
      return; // Success, exit retry loop
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        const delayMs = INITIAL_DELAY_MS * Math.pow(2, attempt);
        console.log(`OpenAI error, retrying in ${delayMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await delay(delayMs);
      }
    }
  }

  throw lastError || new Error('OpenAI API failed after retries');
}
