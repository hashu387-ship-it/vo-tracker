import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import {
  commercialSummary,
  voStatusBreakdown,
  ipaSummary,
  variationOrders,
  formatCompact,
} from '@/lib/data/commercial';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Compact, grounded context for the commercial register (RAG-lite). */
function buildContext(): string {
  const s = commercialSummary;
  const vo = voStatusBreakdown()
    .map((r) => `- ${r.config.label}: ${r.count} VOs, ${formatCompact(r.value)}`)
    .join('\n');
  const ipa = ipaSummary();
  return [
    `Project: ${s.projectName} (${s.project}) — ${s.contractor} for ${s.client}. As of ${s.asOf}.`,
    `Original contract: ${formatCompact(s.originalContract)}; Revised: ${formatCompact(s.revisedContract)} (+${(s.variancePct * 100).toFixed(1)}%).`,
    `Work done: ${formatCompact(s.totalClaimedGross)} (${(s.workDonePct * 100).toFixed(1)}%); Balance: ${formatCompact(s.balanceGross)}.`,
    `Cash received: ${formatCompact(s.received)} (${(s.receivedPct * 100).toFixed(1)}%).`,
    `IPA statuses (excl VAT): Under Review ${formatCompact(ipa.statuses[0].value)}, Submitted on ACONEX ${formatCompact(ipa.statuses[1].value)}, Approved ${formatCompact(ipa.statuses[2].value)}, Received ${formatCompact(ipa.statuses[3].value)}.`,
    `Variation Orders (${variationOrders.length} total), by status:\n${vo}`,
    `Total submitted VO value: ${formatCompact(s.totalSubmittedVOValue)}.`,
  ].join('\n');
}

export async function POST(req: Request) {
  const { message } = (await req.json().catch(() => ({}))) as { message?: string };
  if (!message) return Response.json({ text: 'Please ask a question.' });

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      text:
        "The AI assistant isn't connected yet. Add an OPENAI_API_KEY environment variable in Vercel to enable Chat with Project (RAG). " +
        'Once set, you can ask things like "What is the total value of under-review VOs?"',
    });
  }

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system:
        'You are the VO Tracker commercial assistant for an HW2 MEP project. ' +
        'Answer ONLY using the data provided below. Be concise and use SAR figures. ' +
        'If the answer is not in the data, say so.\n\n' +
        buildContext(),
      prompt: message,
    });
    return Response.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'unknown error';
    return Response.json({ text: `AI request failed: ${msg}` });
  }
}
