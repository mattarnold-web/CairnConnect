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

Platform features you can help with (use the provided tools to navigate users):
- Explore: Interactive map with business and trail search across 13 regions
- Search: Find specific trails and businesses
- Trip Planner: Multi-day itinerary builder with trail and activity scheduling
- Trail Quiz: Personalized trail recommendations based on preferences
- Activity Board: Community posts for finding adventure partners, sharing permits
- Record: GPS activity tracking with elevation and distance stats
- Climbing: Rock climbing routes and beta
- Profile: User profile and activity history
- Dashboard: Analytics, profile editor, subscription management
- Year in Review: Annual activity statistics and achievements
- Book: Marketplace for guided experiences and gear rentals
- Safety Center: Emergency contacts, location sharing, SOS
- Share Plans: Share trip plans with emergency contacts
- Permits: Manage recreation permits
- Challenges: Outdoor activity challenges and badges
- Reviews: Trail and business reviews
- Discover: Curated outdoor content and recommendations
- Trail Status: Real-time trail conditions
- Settings: App preferences, notifications, devices
- Subscription: Pro subscription management

Supported regions: Moab (Utah), Bend (Oregon), Boulder (Colorado), Sedona (Arizona), Lake Tahoe (California), Park City (Utah), Jackson Hole (Wyoming), Asheville (North Carolina), Chattanooga (Tennessee), Bellingham (Washington), Whistler (British Columbia), Queenstown (New Zealand), and Chamonix (France).

IMPORTANT: When a user wants to do something the platform can help with, USE the navigate_to tool to take them there. Be proactive about suggesting and triggering platform features. Keep text responses concise and action-oriented. Always prioritize safety.`;

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'navigate_to',
    description:
      'Navigate the user to a page on the Cairn Connect platform. Use this whenever the user wants to access a feature, view a page, or perform an action that maps to a platform page.',
    input_schema: {
      type: 'object' as const,
      properties: {
        page: {
          type: 'string',
          enum: [
            'explore',
            'search',
            'climbing',
            'board',
            'trip',
            'recommend',
            'record',
            'profile',
            'settings',
            'settings/notifications',
            'settings/preferences',
            'settings/devices',
            'dashboard',
            'dashboard/analytics',
            'dashboard/profile-editor',
            'dashboard/upgrade',
            'subscription',
            'safety',
            'permits',
            'challenges',
            'reviews',
            'discover',
            'trail-status',
            'year-review',
            'book',
            'share-plans',
          ],
          description: 'The platform page to navigate to.',
        },
        description: {
          type: 'string',
          description:
            'A short label describing this action, e.g. "Open Trip Planner" or "View Your Stats".',
        },
      },
      required: ['page', 'description'],
    },
  },
  {
    name: 'search_trails',
    description:
      'Search for trails on the platform. Navigates to the search page with a pre-filled query.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'The search query for finding trails.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'start_trip_planner',
    description:
      'Open the trip planner with an optional region pre-selected.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          description:
            'Optional region to pre-select, e.g. "Moab", "Bend", "Boulder".',
        },
      },
      required: [],
    },
  },
  {
    name: 'open_trail',
    description: 'Open a specific trail detail page by its slug.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: {
          type: 'string',
          description:
            'The trail slug, e.g. "slickrock-trail", "mount-sanitas".',
        },
        name: {
          type: 'string',
          description: 'The display name of the trail.',
        },
      },
      required: ['slug', 'name'],
    },
  },
];

interface PlatformAction {
  type: 'navigate' | 'search' | 'open_trail';
  path: string;
  label: string;
}

function processToolCall(
  name: string,
  input: Record<string, string>,
): PlatformAction {
  switch (name) {
    case 'navigate_to':
      return {
        type: 'navigate',
        path: `/${input.page}`,
        label: input.description || `Go to ${input.page}`,
      };
    case 'search_trails':
      return {
        type: 'search',
        path: `/search?q=${encodeURIComponent(input.query)}`,
        label: `Search: "${input.query}"`,
      };
    case 'start_trip_planner':
      return {
        type: 'navigate',
        path: input.region
          ? `/trip?region=${encodeURIComponent(input.region)}`
          : '/trip',
        label: input.region
          ? `Plan a trip to ${input.region}`
          : 'Open Trip Planner',
      };
    case 'open_trail':
      return {
        type: 'open_trail',
        path: `/trail/${input.slug}`,
        label: `View ${input.name || input.slug}`,
      };
    default:
      return { type: 'navigate', path: '/', label: 'Go Home' };
  }
}

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
  const apiMessages = body.messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // First call — may include tool use
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages: apiMessages,
  });

  const actions: PlatformAction[] = [];
  let textParts: string[] = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      textParts.push(block.text);
    } else if (block.type === 'tool_use') {
      actions.push(
        processToolCall(block.name, block.input as Record<string, string>),
      );
    }
  }

  // If Claude used tools, call again with tool results to get a complete text response
  if (response.stop_reason === 'tool_use') {
    const toolResults = response.content
      .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
      .map((toolBlock) => ({
        type: 'tool_result' as const,
        tool_use_id: toolBlock.id,
        content: `Action queued: ${processToolCall(toolBlock.name, toolBlock.input as Record<string, string>).label}`,
      }));

    const followUp = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: [
        ...apiMessages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user' as const, content: toolResults },
      ],
    });

    for (const block of followUp.content) {
      if (block.type === 'text') {
        textParts.push(block.text);
      } else if (block.type === 'tool_use') {
        actions.push(
          processToolCall(block.name, block.input as Record<string, string>),
        );
      }
    }
  }

  const text = textParts.join('\n');

  // If there are actions, return JSON with both text and actions
  if (actions.length > 0) {
    return new Response(
      JSON.stringify({ text, actions }),
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Chat-Actions': 'true',
        },
      },
    );
  }

  // No actions — stream the text for better UX
  const stream = await client.messages.stream({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
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
