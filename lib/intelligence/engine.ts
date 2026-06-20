// Local commercial intelligence engine.
//
// There is no external LLM key in this deployment, so the "AI assistant" is a
// deterministic natural-language engine that reasons over the real Payment
// Register & VO Log. It parses intent from a question and answers with grounded,
// computed facts — no hallucination, every number is traceable to the dataset.

import {
  commercialSummary,
  variationOrders,
  ipaPayments,
  payments,
  voStatusBreakdown,
  statusConfigOf,
  statusKeyOf,
  paymentState,
  forecastNet,
  formatSAR,
  formatCompact,
  formatPct,
  formatDateShort,
  VO_STATUS,
  type VORecord,
  type PaymentRecord,
  type VOStatusKey,
} from '@/lib/data/commercial';

export type ResultKind = 'text' | 'vo-list' | 'payment-list' | 'breakdown' | 'kpis' | 'report';

export interface AssistantResult {
  kind: ResultKind;
  title: string;
  text: string;
  vos?: VORecord[];
  paymentsList?: PaymentRecord[];
  breakdown?: { label: string; value: number; count?: number; hex: string }[];
  followups?: string[];
}

const value = (vo: VORecord) => vo.value ?? vo.rsgAssessment ?? vo.costProposal ?? 0;

/* ------------------------------------------------------------------ */
/*  Suggested prompts                                                 */
/* ------------------------------------------------------------------ */

export const SUGGESTED_PROMPTS: string[] = [
  'Give me a commercial status report',
  'What is pending with RSG?',
  'Show the largest variation orders',
  'How much cash have we received?',
  'Forecast the next payments',
  'What is the retention balance?',
  'Which VOs are awaiting a DVO?',
  'Summarise the advance payment recovery',
];

/* ------------------------------------------------------------------ */
/*  Entry point                                                       */
/* ------------------------------------------------------------------ */

export function ask(rawQuery: string): AssistantResult {
  const q = rawQuery.toLowerCase().trim();

  if (!q) return helpResult();
  if (/(^hi$|^hello|^hey|help|what can you|who are you)/.test(q)) return helpResult();

  // Specific VO lookup, e.g. "vo-22", "vo 22"
  const voMatch = q.match(/vo[\s-]?0*(\d{1,3})/);
  if (voMatch && !/largest|biggest|top|pending|approved|all|list|many|total/.test(q)) {
    const hit = findVO(voMatch[1]);
    if (hit) return voDetail(hit);
  }

  if (/(report|brief|status update|overview|summary of the project|executive)/.test(q)) {
    return reportResult();
  }
  if (/(forecast|predict|projection|next payment|upcoming|cash.?flow ahead)/.test(q)) {
    return forecastResult();
  }
  if (/(recommend|advise|risk|attention|action|what should|priorit|focus)/.test(q)) {
    return recommendationsResult();
  }
  if (/(retention)/.test(q)) return retentionResult();
  if (/(advance)/.test(q)) return advanceResult();
  if (/(contract value|contract sum|original contract|revised contract|variance|uplift)/.test(q)) {
    return contractResult();
  }
  if (/(received|cash|collected|paid|outstanding|owed|due)/.test(q) && /(payment|ipa|cash|money|sar|received|collected|outstanding|owed|due)/.test(q)) {
    return paymentsResult(q);
  }
  if (/(payment|ipa|invoice|certif)/.test(q)) return paymentsResult(q);
  if (/(work|progress|complete|done)/.test(q)) return progressResult();

  // VO status queries
  if (/(pending|awaiting|outstanding)/.test(q) || /(approved|dvo|issued|closed)/.test(q) || /\bvo/.test(q) || /variation/.test(q)) {
    return voStatusQuery(q);
  }

  if (/(largest|biggest|top|highest|major)/.test(q)) return topVOs(q);
  if (/(total|how many|count|number of)/.test(q)) return countsResult();

  // Fallback: free-text search across VO subjects
  return searchResult(rawQuery);
}

/* ------------------------------------------------------------------ */
/*  Handlers                                                          */
/* ------------------------------------------------------------------ */

function helpResult(): AssistantResult {
  const s = commercialSummary;
  return {
    kind: 'text',
    title: 'Commercial Intelligence Assistant',
    text: [
      `I'm your on-device commercial analyst for **${s.projectName}** (${s.project}).`,
      `Every answer is computed live from the Payment Register and VO Log — ${ipaPayments.length} interim applications and ${variationOrders.length} variation orders.`,
      '',
      'Ask me things like:',
      '• *“What is pending with RSG?”*',
      '• *“Show the largest variation orders”*',
      '• *“Forecast the next payments”*',
      '• *“Give me a commercial status report”*',
    ].join('\n'),
    followups: SUGGESTED_PROMPTS.slice(0, 4),
  };
}

function reportResult(): AssistantResult {
  return {
    kind: 'report',
    title: 'Commercial Status Report',
    text: generateReport(),
    followups: ['Forecast the next payments', 'What needs my attention?', 'Show the largest variation orders'],
  };
}

function voStatusQuery(q: string): AssistantResult {
  let key: VOStatusKey | null = null;
  if (/rsg\s*\/?\s*ffc|joint/.test(q)) key = 'PendingRSGFFC';
  else if (/with ffc|pending ffc|first fix/.test(q)) key = 'PendingFFC';
  else if (/with rsg|pending rsg|red sea/.test(q)) key = 'PendingRSG';
  else if (/awaiting dvo|pending dvo|approved/.test(q)) key = 'ApprovedPendingDVO';
  else if (/rr issued|reconcil/.test(q)) key = 'DVORRIssued';
  else if (/dvo issued|issued|closed/.test(q)) key = 'DVOIssued';

  if (key) {
    const list = variationOrders
      .filter((v) => statusKeyOf(v) === key)
      .sort((a, b) => Math.abs(value(b)) - Math.abs(value(a)));
    const total = list.reduce((n, v) => n + value(v), 0);
    const cfg = VO_STATUS[key];
    return {
      kind: 'vo-list',
      title: cfg.label,
      text: `**${list.length}** variation orders are *${cfg.label}*, carrying a net value of **${formatSAR(total)}**. ${cfg.description}`,
      vos: list,
      followups: ['Show the largest variation orders', 'What needs my attention?'],
    };
  }

  if (/pending|outstanding|awaiting/.test(q)) {
    const list = variationOrders
      .filter((v) => statusConfigOf(v).bucket === 'pending')
      .sort((a, b) => Math.abs(value(b)) - Math.abs(value(a)));
    const total = list.reduce((n, v) => n + value(v), 0);
    return {
      kind: 'vo-list',
      title: 'All Pending Variation Orders',
      text: `There are **${list.length}** variation orders awaiting action, worth **${formatSAR(total)}** in submitted value.`,
      vos: list,
      followups: ['What is pending with RSG?', 'What is pending with FFC?'],
    };
  }

  return countsResult();
}

function topVOs(q: string): AssistantResult {
  const positive = !/omit|omission|negative|deduct|saving|reduction/.test(q);
  const sorted = [...variationOrders].sort((a, b) =>
    positive ? value(b) - value(a) : value(a) - value(b),
  );
  const list = sorted.slice(0, 8);
  return {
    kind: 'vo-list',
    title: positive ? 'Largest Variation Orders' : 'Largest Deductions',
    text: positive
      ? `The highest-value variations on the project. The single largest is **${list[0]?.voNumber ?? '—'}** at **${formatSAR(value(list[0]))}**.`
      : `The largest cost savings / omissions logged against the contract.`,
    vos: list,
    followups: ['What is pending with RSG?', 'Give me a commercial status report'],
  };
}

function countsResult(): AssistantResult {
  const breakdown = voStatusBreakdown();
  const total = variationOrders.length;
  const totalValue = variationOrders.reduce((n, v) => n + value(v), 0);
  return {
    kind: 'breakdown',
    title: 'Variation Order Portfolio',
    text: `**${total}** variation orders are logged across ${breakdown.length} statuses, with a combined net value of **${formatSAR(totalValue)}** (submitted exposure ${formatCompact(commercialSummary.totalSubmittedVOValue)}).`,
    breakdown: breakdown.map((b) => ({ label: b.config.label, value: b.value, count: b.count, hex: b.config.hex })),
    followups: ['What is pending with RSG?', 'Show the largest variation orders'],
  };
}

function paymentsResult(q: string): AssistantResult {
  const s = commercialSummary;
  const received = ipaPayments.filter((p) => paymentState(p) === 'received');
  const inFlight = ipaPayments.filter((p) => paymentState(p) !== 'received');
  const inFlightValue = inFlight.reduce((n, p) => n + (p.net ?? 0), 0);

  if (/outstanding|owed|due|in.?flight|pipeline|not.*received/.test(q)) {
    return {
      kind: 'payment-list',
      title: 'Payments In Flight',
      text: `**${inFlight.length}** interim applications totalling **${formatSAR(inFlightValue)}** (net) are submitted but not yet received — from under review through approved-on-Aconex.`,
      paymentsList: inFlight,
      followups: ['How much cash have we received?', 'Forecast the next payments'],
    };
  }

  return {
    kind: 'payment-list',
    title: 'Payment Summary',
    text: [
      `**${formatSAR(s.received)}** received to date — **${formatPct(s.receivedPct)}** of the contract.`,
      `Gross certified stands at **${formatSAR(s.totalClaimedGross)}** (${formatPct(s.workDonePct)} complete) across ${ipaPayments.length} interim applications.`,
      `${received.length} IPAs are fully received; ${inFlight.length} remain in flight worth ${formatCompact(inFlightValue)} net.`,
    ].join('\n\n'),
    paymentsList: ipaPayments.slice(-6).reverse(),
    followups: ['Show payments in flight', 'Forecast the next payments', 'What is the retention balance?'],
  };
}

function forecastResult(): AssistantResult {
  const series = forecastNet(4);
  const projected = series.filter((p) => p.forecast);
  const sumForecast = projected.reduce((n, p) => n + p.net, 0);
  return {
    kind: 'text',
    title: 'Payment Forecast',
    text: [
      `Based on a least-squares trend over the last six certified applications, the next **${projected.length}** interim payments are projected at roughly **${formatSAR(sumForecast)}** net combined.`,
      projected.map((p, i) => `• Period ${i + 1}: ~${formatCompact(p.net)}`).join('\n'),
      `Remaining work to complete the contract is **${formatSAR(commercialSummary.balanceToComplete)}** (${formatPct(1 - commercialSummary.workDonePct)}).`,
    ].join('\n\n'),
    followups: ['How much cash have we received?', 'Give me a commercial status report'],
  };
}

function retentionResult(): AssistantResult {
  const s = commercialSummary;
  return {
    kind: 'text',
    title: 'Retention Position',
    text: [
      `Total retention held is **${formatSAR(s.totalRetention)}** at **${formatPct(s.retentionPct)}** of works.`,
      `**${formatSAR(s.retentionDeducted)}** has been deducted to date; the outstanding balance to be released is **${formatSAR(s.retentionBalance)}**.`,
    ].join('\n\n'),
    followups: ['Summarise the advance payment recovery', 'How much cash have we received?'],
  };
}

function advanceResult(): AssistantResult {
  const s = commercialSummary;
  return {
    kind: 'text',
    title: 'Advance Payment Recovery',
    text: [
      `The advance payment totalled **${formatSAR(s.totalAdvance)}** (**${formatPct(s.advancePct)}** of the original contract).`,
      `Recovery is effectively complete — **${formatSAR(s.advanceDeducted)}** has been recovered, leaving only **${formatSAR(s.advanceBalance)}** outstanding.`,
    ].join('\n\n'),
    followups: ['What is the retention balance?', 'Give me a commercial status report'],
  };
}

function contractResult(): AssistantResult {
  const s = commercialSummary;
  return {
    kind: 'kpis',
    title: 'Contract Value',
    text: [
      `Original contract: **${formatSAR(s.originalContract)}**.`,
      `Revised contract: **${formatSAR(s.revisedContract)}** — an uplift of **${formatPct(s.variancePct)}** driven by approved variations.`,
      `Total submitted VO exposure is **${formatSAR(s.totalSubmittedVOValue)}** across ${variationOrders.length} variations.`,
    ].join('\n\n'),
    followups: ['Show the largest variation orders', 'What is pending with RSG?'],
  };
}

function progressResult(): AssistantResult {
  const s = commercialSummary;
  return {
    kind: 'text',
    title: 'Work Progress',
    text: [
      `The project is **${formatPct(s.workDonePct)}** complete by value.`,
      `Gross certified: **${formatSAR(s.totalClaimedGross)}**. Balance to complete: **${formatSAR(s.balanceToComplete)}**.`,
      `Of the certified work, ${formatCompact(s.received)} is received, ${formatCompact(s.approvedAconex)} approved on Aconex, ${formatCompact(s.submittedAconex)} submitted, and ${formatCompact(s.underReview)} under review.`,
    ].join('\n\n'),
    followups: ['How much cash have we received?', 'Forecast the next payments'],
  };
}

function recommendationsResult(): AssistantResult {
  const recs = recommendations();
  return {
    kind: 'text',
    title: 'What Needs Your Attention',
    text: recs.map((r) => `**${r.title}** — ${r.detail}`).join('\n\n'),
    followups: ['What is pending with RSG?', 'Show the largest variation orders'],
  };
}

function voDetail(vo: VORecord): AssistantResult {
  const cfg = statusConfigOf(vo);
  return {
    kind: 'vo-list',
    title: `${vo.voNumber ?? 'VO'} — ${cfg.label}`,
    text: [
      `**${vo.subject}**`,
      `Status: ${cfg.label}. Net value: **${formatSAR(value(vo))}** (cost proposal ${formatCompact(vo.costProposal)}, RSG assessment ${formatCompact(vo.rsgAssessment)}).`,
      vo.dateIn ? `Logged ${formatDateShort(vo.dateIn)}.` : '',
      vo.ffcRemarks ? `FFC: ${vo.ffcRemarks}` : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
    vos: [vo],
    followups: ['Show the largest variation orders', 'What is pending with RSG?'],
  };
}

function searchResult(query: string): AssistantResult {
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const scored = variationOrders
    .map((vo) => {
      const hay = `${vo.subject} ${vo.voNumber ?? ''} ${vo.assignedTo ?? ''} ${vo.type}`.toLowerCase();
      const score = terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);
      return { vo, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || Math.abs(value(b.vo)) - Math.abs(value(a.vo)))
    .slice(0, 8)
    .map((x) => x.vo);

  if (scored.length === 0) {
    return {
      kind: 'text',
      title: 'No direct match',
      text: `I couldn't find a variation order matching “${query}”. Try a VO number, a status (RSG, FFC, DVO), or ask for a status report.`,
      followups: SUGGESTED_PROMPTS.slice(0, 4),
    };
  }

  return {
    kind: 'vo-list',
    title: `Search · “${query}”`,
    text: `Found **${scored.length}** variation orders matching your query.`,
    vos: scored,
    followups: ['Show the largest variation orders', 'Give me a commercial status report'],
  };
}

/* ------------------------------------------------------------------ */
/*  Report + recommendations (also used standalone)                  */
/* ------------------------------------------------------------------ */

export interface Insight {
  title: string;
  detail: string;
  severity: 'info' | 'positive' | 'warning';
}

export function recommendations(): Insight[] {
  const out: Insight[] = [];
  const breakdown = voStatusBreakdown();

  const ffc = breakdown.find((b) => b.key === 'PendingFFC');
  if (ffc && ffc.count > 0) {
    out.push({
      title: `${ffc.count} VOs need First Fix action`,
      detail: `Worth ${formatCompact(ffc.value)}. These are blocked pending FFC and are the fastest wins to clear.`,
      severity: 'warning',
    });
  }

  const rsg = breakdown.find((b) => b.key === 'PendingRSG');
  if (rsg && rsg.count > 0) {
    out.push({
      title: `${rsg.count} VOs awaiting RSG assessment`,
      detail: `The largest pending bucket at ${formatCompact(rsg.value)} of submitted value — chase RSG for assessments to convert to approvals.`,
      severity: 'info',
    });
  }

  const approved = breakdown.find((b) => b.key === 'ApprovedPendingDVO');
  if (approved && approved.count > 0) {
    out.push({
      title: `${approved.count} approved VOs awaiting DVO`,
      detail: `${formatCompact(approved.value)} is agreed but not yet formalised. Raising the DVOs locks the value into the contract.`,
      severity: 'positive',
    });
  }

  const inFlight = ipaPayments.filter((p) => paymentState(p) !== 'received');
  if (inFlight.length > 0) {
    const v = inFlight.reduce((n, p) => n + (p.net ?? 0), 0);
    out.push({
      title: `${inFlight.length} interim payments in flight`,
      detail: `${formatCompact(v)} net submitted but not yet received. ${commercialSummary.underReview > 0 ? `${formatCompact(commercialSummary.underReview)} is still under review.` : ''}`,
      severity: 'info',
    });
  }

  out.push({
    title: `Project ${formatPct(commercialSummary.workDonePct)} complete`,
    detail: `${formatCompact(commercialSummary.balanceToComplete)} of work remains. Advance recovery and retention deduction are effectively complete.`,
    severity: 'positive',
  });

  return out;
}

export function generateReport(): string {
  const s = commercialSummary;
  const breakdown = voStatusBreakdown();
  const inFlight = ipaPayments.filter((p) => paymentState(p) !== 'received');
  const inFlightValue = inFlight.reduce((n, p) => n + (p.net ?? 0), 0);
  const topVO = [...variationOrders].sort((a, b) => value(b) - value(a))[0];

  return [
    `## ${s.projectName} — Commercial Status`,
    `*${s.project} · ${s.contractor} · ${s.client} · as of ${formatDateShort(s.asOf)}*`,
    '',
    `### Contract`,
    `- Original: **${formatSAR(s.originalContract)}** → Revised: **${formatSAR(s.revisedContract)}** (${formatPct(s.variancePct)} uplift).`,
    `- Work completed: **${formatPct(s.workDonePct)}** · gross certified **${formatSAR(s.totalClaimedGross)}** · balance ${formatCompact(s.balanceToComplete)}.`,
    '',
    `### Cash`,
    `- Received: **${formatSAR(s.received)}** (${formatPct(s.receivedPct)} of contract).`,
    `- In flight: **${formatSAR(inFlightValue)}** net across ${inFlight.length} interim applications.`,
    `- Advance recovered: ${formatCompact(s.advanceDeducted)} of ${formatCompact(s.totalAdvance)} · retention held ${formatCompact(s.totalRetention)}.`,
    '',
    `### Variation Orders (${variationOrders.length})`,
    ...breakdown.map((b) => `- ${b.config.label}: **${b.count}** · ${formatCompact(b.value)}`),
    `- Largest variation: ${topVO?.voNumber ?? '—'} — ${topVO?.subject ?? ''} (${formatCompact(value(topVO))}).`,
    '',
    `### Recommended focus`,
    ...recommendations().slice(0, 3).map((r) => `- ${r.title}: ${r.detail}`),
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/*  Global search (used by the command palette)                      */
/* ------------------------------------------------------------------ */

function findVO(num: string): VORecord | undefined {
  const target = `vo-${num.padStart(2, '0')}`;
  return (
    variationOrders.find((v) => (v.voNumber ?? '').toLowerCase().replace(/\s/g, '') === target) ??
    variationOrders.find((v) => (v.voNumber ?? '').toLowerCase().includes(num))
  );
}

export interface SearchHit {
  id: string;
  kind: 'vo' | 'payment';
  title: string;
  subtitle: string;
  value: number | null;
}

export function globalSearch(query: string, limit = 8): SearchHit[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const score = (hay: string) => terms.reduce((n, t) => (hay.includes(t) ? n + 1 : n), 0);

  const voHits: (SearchHit & { s: number })[] = variationOrders
    .map((v) => {
      const hay = `${v.voNumber ?? ''} ${v.subject} ${v.type} ${v.status} ${v.assignedTo ?? ''}`.toLowerCase();
      return {
        s: score(hay),
        id: `vo-${v.sno}`,
        kind: 'vo' as const,
        title: `${v.voNumber ?? 'VO'} · ${v.subject}`,
        subtitle: `${statusConfigOf(v).label} · ${formatCompact(value(v))}`,
        value: value(v),
      };
    })
    .filter((x) => x.s > 0);

  const payHits: (SearchHit & { s: number })[] = payments
    .map((p) => {
      const hay = `${p.no} ${p.description} ${p.approvalStatus} ${p.status}`.toLowerCase();
      return {
        s: score(hay),
        id: `pay-${p.no}`,
        kind: 'payment' as const,
        title: `${p.no} · ${p.description}`,
        subtitle: `${p.approvalStatus || p.status || 'Draft'} · ${formatCompact(p.net)}`,
        value: p.net,
      };
    })
    .filter((x) => x.s > 0);

  return [...voHits, ...payHits]
    .sort((a, b) => b.s - a.s || Math.abs(b.value ?? 0) - Math.abs(a.value ?? 0))
    .slice(0, limit)
    .map(({ s, ...rest }) => rest);
}
