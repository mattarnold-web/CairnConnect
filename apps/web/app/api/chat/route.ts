import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are Cairn, the AI assistant for Cairn Connect — the outdoor activity platform that helps adventurers discover trails, find local businesses, and connect with adventure partners.

Your expertise covers:
- Trail recommendations based on difficulty, activity type, distance, and conditions
- Trip planning advice for outdoor destinations
- Safety tips, gear recommendations, and Leave No Trace principles
- Local knowledge about outdoor regions and businesses
- Weather and seasonal considerations for outdoor activities
- Activity-specific advice for mountain biking, hiking, trail running, rock climbing, kayaking, skiing, snowboarding, camping, fishing, surfing, sailing, and more

Platform features you can reference:
- Trip Planner: Multi-day itinerary builder with trail and activity scheduling
- Trail Quiz: Personalized trail recommendations based on preferences
- Activity Board: Community posts for finding adventure partners, sharing permits
- Record: GPS activity tracking with elevation and distance stats
- Explore: Interactive map with business and trail search across 13 regions

Supported regions include: Moab (Utah), Bend (Oregon), Boulder (Colorado), Sedona (Arizona), Lake Tahoe (California), Park City (Utah), Jackson Hole (Wyoming), Asheville (North Carolina), Chattanooga (Tennessee), Bellingham (Washington), Whistler (British Columbia), Queenstown (New Zealand), and Chamonix (France).

Keep responses concise, friendly, and action-oriented. When suggesting trails or activities, mention difficulty level and key stats when relevant. Always prioritize safety.`;

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { messages: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const client = new Anthropic({ apiKey });

  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: body.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
}
