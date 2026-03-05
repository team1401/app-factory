const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '25kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const LLM_URL = process.env.LLM_URL || 'http://100.87.41.76:8000/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'qwen3-32b';

const SYSTEM_PROMPT = `/no_think

You are the writing room for a satirical 24-hour cable news network called Daily Drama Network (DDN).

Task: Transform a user's personal situation into a FUNNY, SHARABLE fake TV news segment.
Tone: absurdly serious, theatrical, witty. Roast lightly, never cruel.

Return ONLY valid JSON with this exact shape:
{
  "urgency": "BREAKING" | "DEVELOPING" | "JUST IN" | "LIVE",
  "headline": "max 90 chars",
  "subheadline": "max 140 chars",
  "importance": 1-10,
  "anchorIntro": "2-3 punchy sentences",
  "fieldReport": "2-3 sentences from a field reporter",
  "panel": [
    {"name":"Name","title":"Role","take":"1-2 sentence hot take","bias":"chaos|logic|petty"},
    {"name":"Name","title":"Role","take":"1-2 sentence hot take","bias":"chaos|logic|petty"},
    {"name":"Name","title":"Role","take":"1-2 sentence hot take","bias":"chaos|logic|petty"}
  ],
  "ticker": ["8-12 short ticker items, each max 70 chars"],
  "publicAdvisory": "1 sentence public guidance"
}

Rules:
- Make this feel like a real cable news parody package.
- Be specific to the user's story details.
- No profanity, hate, or explicit sexual content.
- Keep it screenshot-worthy and memeable.
- importance: 1=barely news, 10=national emotional emergency.
- ticker items should be varied (some factual, some ridiculous).
- Return only JSON, no markdown.`;

function cleanText(s, max = 200) {
  return String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function fallbackPackage(drama, vibe = 'Messy') {
  const short = cleanText(drama, 120);
  return {
    urgency: 'BREAKING',
    headline: `${vibe.toUpperCase()} SITUATION ESCALATES IN REAL TIME`,
    subheadline: cleanText(short || 'Sources confirm this could have been an email.', 140),
    importance: 7,
    anchorIntro:
      'Good evening. We are monitoring a rapidly evolving personal situation with major emotional market volatility. Sources say everyone involved had options and chose chaos anyway.',
    fieldReport:
      'I am standing live at the scene of several unread messages and one suspiciously delayed reply. Witnesses report a dramatic mix of overthinking, poor timing, and avoidable escalation.',
    panel: [
      {
        name: 'Rita Spinwell',
        title: 'Senior Chaos Correspondent',
        take: 'At this stage, the narrative is outpacing the facts, but the vibes are deeply concerning.',
        bias: 'chaos'
      },
      {
        name: 'Cal Norton',
        title: 'Data-Driven Reality Analyst',
        take: 'If people had communicated one level more clearly, this likely never makes primetime.',
        bias: 'logic'
      },
      {
        name: 'Lexi Blaze',
        title: 'Petty Affairs Contributor',
        take: 'Respectfully, we are all pretending to be surprised by outcomes everyone predicted.',
        bias: 'petty'
      }
    ],
    ticker: [
      'BREAKING: Tone interpreted differently by all parties',
      'UPDATE: Group chat remains oddly quiet',
      'ANALYSTS: “This was preventable by Thursday”',
      'EYEWITNESS: “I knew it was bad at the second emoji”',
      'MARKETS: Emotional futures close mixed',
      'OFFICIALS URGE hydration and restraint',
      'DEVELOPING: Draft message enters third revision',
      'LOCAL: One friend said “don’t do it” and was ignored'
    ],
    publicAdvisory: 'Officials advise sleeping on major replies and avoiding paragraph-length texts after midnight.'
  };
}

app.post('/api/broadcast', async (req, res) => {
  const { drama, vibe } = req.body || {};

  if (!drama || typeof drama !== 'string') {
    return res.status(400).json({ error: 'Missing drama field.' });
  }

  const trimmed = drama.trim();

  if (trimmed.length < 12) {
    return res.status(400).json({ error: 'Give us a little more detail (minimum 12 characters).' });
  }

  if (trimmed.length > 1200) {
    return res.status(400).json({ error: 'Keep it under 1200 characters so our anchors can breathe.' });
  }

  try {
    const response = await fetch(`${LLM_URL}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Vibe level: ${cleanText(vibe || 'Messy', 20)}\nSituation: ${trimmed}` }
        ],
        temperature: 0.95,
        max_tokens: 1400,
        stream: false
      }),
      signal: AbortSignal.timeout(45000)
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('LLM error:', response.status, errText.slice(0, 240));
      throw new Error(`LLM responded with ${response.status}`);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';

    const stripped = raw
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/^[\s\S]*?(\{)/m, '{')
      .trim();

    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in model output.');

    const parsed = JSON.parse(jsonMatch[0]);

    const urgencySet = new Set(['BREAKING', 'DEVELOPING', 'JUST IN', 'LIVE']);
    const biasSet = new Set(['chaos', 'logic', 'petty']);

    const result = {
      urgency: urgencySet.has(parsed.urgency) ? parsed.urgency : 'BREAKING',
      headline: cleanText(parsed.headline, 90) || 'BREAKING: PERSONAL DRAMA HITS THE NEWS CYCLE',
      subheadline: cleanText(parsed.subheadline, 140) || cleanText(trimmed, 140),
      importance: Math.max(1, Math.min(10, parseInt(parsed.importance) || 6)),
      anchorIntro: cleanText(parsed.anchorIntro, 420),
      fieldReport: cleanText(parsed.fieldReport, 420),
      panel: Array.isArray(parsed.panel)
        ? parsed.panel.slice(0, 3).map((p, i) => ({
            name: cleanText(p?.name, 40) || `Panelist ${i + 1}`,
            title: cleanText(p?.title, 60) || 'Commentator',
            take: cleanText(p?.take, 220) || 'No comment at this time.',
            bias: biasSet.has(p?.bias) ? p.bias : ['chaos', 'logic', 'petty'][i % 3]
          }))
        : [],
      ticker: Array.isArray(parsed.ticker)
        ? parsed.ticker.slice(0, 12).map(item => cleanText(item, 70)).filter(Boolean)
        : [],
      publicAdvisory: cleanText(parsed.publicAdvisory, 220)
    };

    if (!result.panel.length || !result.ticker.length || !result.anchorIntro) {
      return res.json(fallbackPackage(trimmed, vibe));
    }

    if (!result.publicAdvisory) {
      result.publicAdvisory = 'Public advisory: pause before posting and verify your assumptions before escalation.';
    }

    res.json(result);
  } catch (err) {
    console.error('Broadcast generation failed:', err.message);
    if (err.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Newsroom timeout. Try again in a moment.' });
    }
    res.json(fallbackPackage(trimmed, vibe));
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'daily-drama-network', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3222;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Daily Drama Network running on http://0.0.0.0:${PORT}`);
  console.log(`LLM endpoint: ${LLM_URL} (model: ${LLM_MODEL})`);
});
