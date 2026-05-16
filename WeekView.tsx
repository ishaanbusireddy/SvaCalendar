import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a smart calendar event parser. Given natural language text and the current date/time, extract structured event data.

Rules for date parsing:
- "next [weekday]" = that weekday in the FOLLOWING week (not this week)
- "this [weekday]" = that weekday in the current week
- "tomorrow" = today's date + 1 day
- "today" = today's date
- Weekday mentions without qualifier = the soonest upcoming instance

Rules for time parsing:
- Prefer 24h format in output (HH:MM)
- "noon" = 12:00, "midnight" = 00:00
- "4:20" without AM/PM = context-dependent (if it's a meeting, assume PM unless clearly morning)
- Default event duration: 60 minutes unless specified

Category inference:
- "meeting / sync / 1:1 / standup / review / debrief" → meeting
- "call / phone / zoom / hangouts" → call
- "class / lecture / section / lab / seminar / workshop" → class
- "lunch / dinner / coffee / hangout / party / drinks / catch up" → social
- "deadline / due / submit / turn in / finish / complete" → deadline
- "workout / gym / doctor / dentist / appointment / haircut" → personal
- anything else → other

Title rules:
- Concise (max 35 chars)
- Remove URLs, meeting links, and filler words
- Capitalize properly
- Include key people's names if mentioned (e.g., "IB Meeting – Ling Ling")

Summary:
- 1–2 punchy sentences describing what this event is and why it matters
- Natural, human tone

Color values per category:
- meeting: #8b5cf6
- call: #a78bfa
- class: #60a5fa
- social: #34d399
- deadline: #f87171
- personal: #fb923c
- other: #818cf8

Respond ONLY with a valid JSON object. No markdown fences. No extra text. Shape:
{
  "title": string,
  "date": "YYYY-MM-DD",
  "startTime": "HH:MM",
  "endTime": "HH:MM",
  "attendees": string[],
  "summary": string,
  "category": "meeting"|"call"|"class"|"social"|"deadline"|"personal"|"other",
  "color": string
}`

export async function POST(req: NextRequest) {
  try {
    const { text, today, apiKey } = await req.json()

    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    const key = apiKey || process.env.ANTHROPIC_API_KEY
    if (!key) {
      return NextResponse.json(
        { error: 'No API key. Add your Anthropic API key in the sidebar.' },
        { status: 401 }
      )
    }

    const client = new Anthropic({ apiKey: key })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Current date and time: ${today}\n\nEvent text: "${text}"`,
        },
      ],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const parsed = JSON.parse(raw)

    return NextResponse.json(parsed)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Parse failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
