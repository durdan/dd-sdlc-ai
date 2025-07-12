import { NextRequest, NextResponse } from 'next/server';
import { SlackService } from '@/lib/slack-service';
import crypto from 'crypto';

// Rate limiting
const commandCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5000; // 5 seconds

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Slack events API called');
    
    const body = await request.text();
    const timestamp = request.headers.get('X-Slack-Request-Timestamp');
    const signature = request.headers.get('X-Slack-Signature');
    
    console.log('📋 Request details:', {
      hasBody: !!body,
      hasTimestamp: !!timestamp,
      hasSignature: !!signature,
      bodyLength: body.length
    });

    // Parse request body
    let payload;
    try {
      // Check if it's JSON (interactions) or form-encoded (commands)
      if (body.startsWith('payload=')) {
        // Interactive component payload
        const decodedPayload = decodeURIComponent(body.replace('payload=', ''));
        payload = JSON.parse(decodedPayload);
      } else if (body.startsWith('{')) {
        // Direct JSON payload
        payload = JSON.parse(body);
      } else {
        // Form-encoded slash command
        payload = parseFormData(body);
      }
    } catch (error) {
      console.error('❌ Failed to parse request body:', error);
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    console.log('📊 Parsed payload type:', payload.type || payload.command || 'unknown');

    // Handle URL verification (Slack app setup)
    if (payload.type === 'url_verification') {
      console.log('🔗 URL verification request');
      return NextResponse.json({ challenge: payload.challenge });
    }

    // Verify request signature (security)
    if (!await verifySlackSignature(body, timestamp, signature)) {
      console.log('❌ Invalid Slack signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle different types of Slack events
    if (payload.command) {
      // Slash command
      return await handleSlashCommand(payload);
    } else if (payload.type === 'interactive_message' || payload.type === 'block_actions') {
      // Interactive component
      return await handleInteractiveComponent(payload);
    } else if (payload.type === 'event_callback') {
      // Event API (mentions, messages, etc.)
      return await handleEventCallback(payload);
    } else {
      console.log('❓ Unknown event type:', payload.type);
      return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error handling Slack event:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function handleSlashCommand(payload: any): Promise<NextResponse> {
  console.log(`🤖 Slash command: ${payload.command} from ${payload.user_name}`);
  
  try {
    // Rate limiting check
    const userKey = `${payload.user_id}-${payload.team_id}`;
    const lastCommand = commandCooldowns.get(userKey);
    
    if (lastCommand && Date.now() - lastCommand < COOLDOWN_MS) {
      return NextResponse.json({
        response_type: 'ephemeral',
        text: '⏱️ Please wait a moment before sending another command.'
      });
    }
    
    // Update cooldown
    commandCooldowns.set(userKey, Date.now());
    
    // Handle the command
    const response = await SlackService.handleSlashCommand(payload);
    
    console.log('✅ Command processed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error handling slash command:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ An error occurred while processing your command. Please try again.'
    });
  }
}

async function handleInteractiveComponent(payload: any): Promise<NextResponse> {
  console.log(`🔄 Interactive component: ${payload.type} from ${payload.user.username}`);
  
  try {
    // Handle the interaction
    const response = await SlackService.handleInteraction(payload);
    
    console.log('✅ Interaction processed successfully');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error handling interactive component:', error);
    return NextResponse.json({
      response_type: 'ephemeral',
      text: '❌ An error occurred while processing your interaction. Please try again.'
    });
  }
}

async function handleEventCallback(payload: any): Promise<NextResponse> {
  console.log(`📢 Event callback: ${payload.event?.type} from ${payload.team_id}`);
  
  try {
    const event = payload.event;
    
    // Handle different event types
    switch (event.type) {
      case 'app_mention':
        // Handle @mentions of the bot
        return await handleAppMention(event, payload);
      
      case 'message':
        // Handle direct messages
        return await handleDirectMessage(event, payload);
      
      default:
        console.log(`❓ Unhandled event type: ${event.type}`);
        return NextResponse.json({ ok: true });
    }
    
  } catch (error) {
    console.error('❌ Error handling event callback:', error);
    return NextResponse.json({ ok: true }); // Always return ok for events
  }
}

async function handleAppMention(event: any, payload: any): Promise<NextResponse> {
  console.log(`👋 App mention from ${event.user} in ${event.channel}`);
  
  try {
    // Extract command from mention text
    const text = event.text.replace(/<@[^>]+>/g, '').trim();
    
    if (text.toLowerCase().includes('help')) {
      // Send help message
      const helpResponse = await SlackService.handleSlashCommand({
        command: '/sdlc',
        text: 'help',
        user_id: event.user,
        team_id: payload.team_id,
        channel_id: event.channel,
        user_name: 'mentioned_user',
        team_domain: '',
        channel_name: '',
        response_url: '',
        trigger_id: '',
        token: ''
      });
      
      // Send response back to channel
      // TODO: Implement chat.postMessage API call
      console.log('📤 Help response prepared for mention');
    }
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Error handling app mention:', error);
    return NextResponse.json({ ok: true });
  }
}

async function handleDirectMessage(event: any, payload: any): Promise<NextResponse> {
  console.log(`💬 Direct message from ${event.user}`);
  
  try {
    // Handle direct messages to the bot
    // For now, just acknowledge
    console.log('📥 Direct message received, not processed yet');
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Error handling direct message:', error);
    return NextResponse.json({ ok: true });
  }
}

// Helper function to verify Slack signature
async function verifySlackSignature(
  body: string,
  timestamp: string | null,
  signature: string | null
): Promise<boolean> {
  try {
    // Skip verification in development if no signing secret is set
    if (process.env.NODE_ENV === 'development' && !process.env.SLACK_SIGNING_SECRET) {
      console.log('⚠️ Skipping signature verification in development');
      return true;
    }
    
    if (!timestamp || !signature) {
      console.log('❌ Missing timestamp or signature');
      return false;
    }
    
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    if (!signingSecret) {
      console.log('❌ No signing secret configured');
      return false;
    }
    
    // Check timestamp (should be within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp);
    
    if (Math.abs(now - requestTime) > 300) {
      console.log('❌ Request timestamp too old');
      return false;
    }
    
    // Calculate expected signature
    const baseString = `v0:${timestamp}:${body}`;
    const expectedSignature = `v0=${crypto
      .createHmac('sha256', signingSecret)
      .update(baseString)
      .digest('hex')}`;
    
    // Compare signatures
    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
    
    if (!isValid) {
      console.log('❌ Invalid signature');
      console.log('Expected:', expectedSignature);
      console.log('Received:', signature);
    }
    
    return isValid;
    
  } catch (error) {
    console.error('❌ Error verifying signature:', error);
    return false;
  }
}

// Helper function to parse form data
function parseFormData(body: string): any {
  const params = new URLSearchParams(body);
  const result: any = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// Health check endpoint
export async function GET(request: NextRequest) {
  console.log('🏥 Slack events API health check');
  
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      'POST /api/slack/events': 'Slack events webhook',
      'GET /api/slack/events': 'Health check'
    },
    features: {
      'slash_commands': true,
      'interactive_components': true,
      'event_subscriptions': true,
      'rate_limiting': true,
      'signature_verification': true
    }
  });
}

// Development helper - list recent events
export async function OPTIONS(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  
  return NextResponse.json({
    message: 'Slack Events API - Development Mode',
    recent_cooldowns: Array.from(commandCooldowns.entries()).map(([user, timestamp]) => ({
      user,
      lastCommand: new Date(timestamp).toISOString(),
      cooldownRemaining: Math.max(0, COOLDOWN_MS - (Date.now() - timestamp))
    })),
    environment: {
      has_signing_secret: !!process.env.SLACK_SIGNING_SECRET,
      node_env: process.env.NODE_ENV,
      app_url: process.env.NEXT_PUBLIC_APP_URL
    }
  });
}

// Cleanup old cooldowns periodically
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [user, timestamp] of commandCooldowns.entries()) {
      if (now - timestamp > COOLDOWN_MS * 2) {
        commandCooldowns.delete(user);
      }
    }
  }, 60000); // Clean up every minute
} 