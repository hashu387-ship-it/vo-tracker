import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export interface ParsedDraft {
  title: string;
  scope: string;
  timeline: string;
  costEstimate: number | null;
  suggestedType: string;
  confidence: number;
  demo?: boolean;
}

const PROMPT = `You are a senior quantity surveyor reviewing a construction document
(Site Instruction, RFI, or FIDIC contract snippet) for an MEP project.
Extract a draft Variation Order. Respond with STRICT JSON only, no prose:
{"title": string, "scope": string (<= 40 words), "timeline": string (e.g. "3 weeks" or "TBC"),
 "costEstimate": number|null (SAR, no separators), "suggestedType": "VO"|"RFP"|"Gen CORR",
 "confidence": number (0-1)}`;

/** Filename-derived fallback so the drag-drop flow is fully demoable without a key. */
function demoDraft(filename: string): ParsedDraft {
  const base = filename.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return {
    title: base ? base.slice(0, 80) : 'Untitled instruction',
    scope:
      'Demo extraction — connect OPENAI_API_KEY to auto-read the document scope, timeline and cost estimate from the uploaded PDF.',
    timeline: 'TBC',
    costEstimate: null,
    suggestedType: 'VO',
    confidence: 0,
    demo: true,
  };
}

function extractJson(text: string): ParsedDraft | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    return {
      title: String(j.title ?? 'Draft VO').slice(0, 120),
      scope: String(j.scope ?? ''),
      timeline: String(j.timeline ?? 'TBC'),
      costEstimate: typeof j.costEstimate === 'number' ? j.costEstimate : null,
      suggestedType: ['VO', 'RFP', 'Gen CORR'].includes(j.suggestedType) ? j.suggestedType : 'VO',
      confidence: typeof j.confidence === 'number' ? j.confidence : 0.6,
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: { filename?: string; mimeType?: string; dataBase64?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }
  const filename = body.filename ?? 'document';

  if (!process.env.OPENAI_API_KEY || !body.dataBase64) {
    return Response.json(demoDraft(filename));
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            {
              type: 'file',
              data: Buffer.from(body.dataBase64, 'base64'),
              mediaType: body.mimeType ?? 'application/pdf',
            },
          ],
        },
      ],
    });
    const parsed = extractJson(text);
    return Response.json(parsed ?? demoDraft(filename));
  } catch (e) {
    const draft = demoDraft(filename);
    draft.scope = `AI extraction failed (${e instanceof Error ? e.message : 'error'}). ` + draft.scope;
    return Response.json(draft);
  }
}
