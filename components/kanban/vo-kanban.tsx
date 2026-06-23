'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import {
  variationOrders,
  statusConfigOf,
  formatCompact,
  type VORecord,
} from '@/lib/data/commercial';
import type { ParsedDraft } from '@/app/api/ai/parse-document/route';

/* kanban columns */
const COLUMNS = [
  { id: 'draft', label: 'AI Drafts', hint: 'Parsed from documents' },
  { id: 'review', label: 'Submitted / Review', hint: 'Awaiting assessment' },
  { id: 'approved', label: 'Approved · Pending DVO', hint: 'Commercially agreed' },
  { id: 'issued', label: 'DVO Issued / Closed', hint: 'Committed to contract' },
  { id: 'parked', label: 'Not Eligible', hint: 'Assessed out' },
] as const;
type ColId = (typeof COLUMNS)[number]['id'];

const BUCKET_TO_COL: Record<string, ColId> = {
  pending: 'review',
  approved: 'approved',
  closed: 'issued',
  excluded: 'parked',
};

interface DraftCard extends ParsedDraft {
  id: string;
}

/** Tiny client-side hash for the "Verified" compliance badge (display only). */
function tag(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0').slice(0, 8).toUpperCase();
}

export function VoKanban() {
  const [overrides, setOverrides] = useState<Record<string, ColId>>({});
  const [drafts, setDrafts] = useState<DraftCard[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const seq = useRef(0);

  const colOfVo = (vo: VORecord): ColId =>
    overrides[`vo-${vo.sno}`] ?? BUCKET_TO_COL[statusConfigOf(vo).bucket] ?? 'review';
  const colOfDraft = (d: DraftCard): ColId => overrides[d.id] ?? 'draft';

  const onDropCard = (col: ColId) => {
    if (dragId) setOverrides((o) => ({ ...o, [dragId]: col }));
    setDragId(null);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setParsing(true);
    for (const file of Array.from(files)) {
      try {
        const dataBase64 = await new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result).split(',')[1] ?? '');
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const resp = await fetch('/api/ai/parse-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, mimeType: file.type, dataBase64 }),
        });
        const draft = (await resp.json()) as ParsedDraft;
        seq.current += 1;
        setDrafts((d) => [{ ...draft, id: `draft-${seq.current}` }, ...d]);
      } catch {
        /* ignore individual file errors */
      }
    }
    setParsing(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-bronze">
          AI Document Parsing
        </div>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Variation Order Kanban
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Drag a Site Instruction, RFI or FIDIC snippet onto the dropzone — the AI extracts the
          scope, timeline and cost estimate and seeds a Draft VO. Drag cards between stages.
        </p>
      </div>

      {/* dropzone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(e) => { e.preventDefault(); setDropActive(false); handleFiles(e.dataTransfer.files); }}
        className={
          'flex cursor-pointer items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-7 text-center transition-colors ' +
          (dropActive ? 'border-bronze bg-bronze/10' : 'border-border bg-card/50 hover:border-bronze/60')
        }
      >
        <input
          type="file"
          multiple
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {parsing ? (
          <><Loader2 className="h-5 w-5 animate-spin text-bronze" /> <span className="text-sm font-medium text-foreground">Extracting with AI…</span></>
        ) : (
          <><UploadCloud className="h-5 w-5 text-bronze" /> <span className="text-sm font-medium text-foreground">Drop PDF / image here, or click to upload an SI · RFI · FIDIC clause</span></>
        )}
      </label>

      {/* board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const vos = variationOrders.filter((v) => colOfVo(v) === col.id);
          const colDrafts = drafts.filter((d) => colOfDraft(d) === col.id);
          const count = vos.length + colDrafts.length;
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDropCard(col.id)}
              className="flex min-h-[120px] flex-col rounded-3xl border border-border/60 bg-card/40 p-3 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <div className="text-[13px] font-semibold text-foreground">{col.label}</div>
                  <div className="text-[10px] text-muted-foreground">{col.hint}</div>
                </div>
                <span className="rounded-full bg-bronze/12 px-2 py-0.5 text-[11px] font-bold text-bronze">
                  {count}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-2.5">
                <AnimatePresence initial={false}>
                  {colDrafts.map((d) => (
                    <motion.div
                      key={d.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      draggable
                      onDragStart={() => setDragId(d.id)}
                      className="cursor-grab rounded-2xl border border-bronze/40 bg-bronze/5 p-3 active:cursor-grabbing"
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-bronze">
                        <Sparkles className="h-3 w-3" /> AI Draft {d.demo ? '· demo' : `· ${Math.round(d.confidence * 100)}%`}
                      </div>
                      <div className="text-[13px] font-semibold text-foreground">{d.title}</div>
                      <p className="mt-1 line-clamp-3 text-[11.5px] leading-snug text-muted-foreground">{d.scope}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>⏱ {d.timeline}</span>
                        <span className="font-semibold text-foreground">{formatCompact(d.costEstimate)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {vos.map((v) => {
                  const cfg = statusConfigOf(v);
                  const id = `vo-${v.sno}`;
                  const verified = col.id === 'issued';
                  return (
                    <div
                      key={id}
                      draggable
                      onDragStart={() => setDragId(id)}
                      className="cursor-grab rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-shadow hover:shadow-liquid active:cursor-grabbing"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-bold text-foreground">{v.voNumber ?? `#${v.sno}`}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white"
                          style={{ background: cfg.hex }}
                        >
                          {cfg.short}
                        </span>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-[12px] leading-snug text-foreground/90">{v.subject}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-foreground">{formatCompact(v.value)}</span>
                        {verified && (
                          <span
                            title={`Audit hash ${tag(id + (v.dvoRef ?? ''))}`}
                            className="flex items-center gap-1 rounded-full bg-emerald-500/12 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400"
                          >
                            <ShieldCheck className="h-3 w-3" /> {tag(id + (v.dvoRef ?? ''))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
