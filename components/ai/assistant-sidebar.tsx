'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  Copy,
  Check,
  User,
  Square,
} from 'lucide-react';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { ask, SUGGESTED_PROMPTS, type AssistantResult } from '@/lib/intelligence/engine';
import {
  statusConfigOf,
  formatSAR,
  formatCompact,
  paymentState,
  PAYMENT_STATE_CONFIG,
  type VORecord,
  type PaymentRecord,
} from '@/lib/data/commercial';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  result?: AssistantResult;
}

let idSeq = 0;
const nextId = () => `m${++idSeq}`;

export function AssistantSidebar() {
  const { assistantOpen, setAssistantOpen, assistantSeed, clearSeed } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const send = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setInput('');
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }]);
    setThinking(true);
    // simulate a brief "thinking" beat for a natural feel
    window.setTimeout(() => {
      const result = ask(text);
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', result }]);
      setThinking(false);
    }, 420);
  }, []);

  // welcome message on first open
  useEffect(() => {
    if (assistantOpen && messages.length === 0) {
      setMessages([{ id: nextId(), role: 'assistant', result: ask('') }]);
    }
  }, [assistantOpen, messages.length]);

  // seeded query from command palette / quick actions
  useEffect(() => {
    if (assistantOpen && assistantSeed) {
      if (assistantSeed.trim()) send(assistantSeed);
      clearSeed();
    }
  }, [assistantOpen, assistantSeed, send, clearSeed]);

  // autoscroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  /* ---- Voice: speech-to-text ---- */
  const toggleMic = () => {
    if (typeof window === 'undefined') return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      send('Voice input is not supported in this browser.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recog = new SR();
    recog.lang = 'en-US';
    recog.interimResults = true;
    recog.continuous = false;
    recog.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setInput(transcript);
      if (e.results[0].isFinal) {
        setListening(false);
        send(transcript);
      }
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recognitionRef.current = recog;
    recog.start();
    setListening(true);
  };

  /* ---- Voice: text-to-speech ---- */
  const speak = (id: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#•]/g, '').replace(/\s+/g, ' ').trim();
    const u = new SpeechSynthesisUtterance(clean);
    u.rate = 1.04;
    u.onend = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(u);
  };

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  return (
    <AnimatePresence>
      {assistantOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAssistantOpen(false)}
            className="fixed inset-0 z-[90] bg-slate-950/30 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-0"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 z-[91] flex h-full w-full max-w-md flex-col border-l border-white/15 bg-white/85 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-zinc-950/90"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3.5 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse-glow rounded-xl bg-gradient-to-br from-rsg-navy to-sky-500 blur-md dark:from-rsg-gold dark:to-amber-500" />
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rsg-navy to-sky-500 dark:from-rsg-gold dark:to-amber-500">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Commercial AI</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · on-device analysis
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssistantOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto scrollbar-modern p-4">
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onSpeak={speak}
                  speakingId={speakingId}
                  onFollowup={send}
                />
              ))}
              {thinking && <ThinkingBubble />}
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTED_PROMPTS.slice(0, 4).map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="rounded-full border border-slate-200 bg-white/60 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-rsg-navy/40 hover:text-rsg-navy dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-rsg-gold/40 dark:hover:text-rsg-gold"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="border-t border-slate-200/70 p-3 dark:border-white/10"
            >
              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white/70 p-2 focus-within:border-rsg-navy/40 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-rsg-gold/40">
                <button
                  type="button"
                  onClick={toggleMic}
                  title="Voice input"
                  className={cn(
                    'rounded-xl p-2 transition-colors',
                    listening
                      ? 'animate-pulse bg-rose-500 text-white'
                      : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5',
                  )}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={listening ? 'Listening…' : 'Ask about payments, VOs, forecasts…'}
                  className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="rounded-xl bg-gradient-to-br from-rsg-navy to-sky-600 p-2 text-white transition-opacity disabled:opacity-40 dark:from-rsg-gold dark:to-amber-500 dark:text-zinc-900"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 px-1 text-center text-[10px] text-slate-400">
                Answers computed from the live Payment Register &amp; VO Log · not financial advice
              </p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Message rendering                                                 */
/* ------------------------------------------------------------------ */

function MessageBubble({
  message,
  onSpeak,
  speakingId,
  onFollowup,
}: {
  message: Message;
  onSpeak: (id: string, text: string) => void;
  speakingId: string | null;
  onFollowup: (q: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const r = message.result;
  const speakText = r ? `${r.title}. ${r.text}` : message.text ?? '';

  const copy = () => {
    navigator.clipboard?.writeText(r ? `${r.title}\n\n${stripMd(r.text)}` : message.text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
          isUser
            ? 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-zinc-300'
            : 'bg-gradient-to-br from-rsg-navy to-sky-500 text-white dark:from-rsg-gold dark:to-amber-500',
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn('min-w-0 max-w-[85%] space-y-2', isUser && 'flex flex-col items-end')}>
        {isUser ? (
          <div className="rounded-2xl rounded-tr-sm bg-rsg-navy px-3.5 py-2 text-sm text-white dark:bg-rsg-gold dark:text-zinc-900">
            {message.text}
          </div>
        ) : (
          <div className="w-full space-y-3 rounded-2xl rounded-tl-sm border border-slate-200/70 bg-white/70 px-3.5 py-3 dark:border-white/10 dark:bg-white/[0.03]">
            {r && (
              <>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{r.title}</p>
                <MarkdownLite text={r.text} />

                {r.vos && r.vos.length > 0 && <VoMiniList vos={r.vos} />}
                {r.paymentsList && r.paymentsList.length > 0 && <PaymentMiniList items={r.paymentsList} />}
                {r.breakdown && r.breakdown.length > 0 && <BreakdownBars items={r.breakdown} />}

                {r.followups && r.followups.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.followups.map((f) => (
                      <button
                        key={f}
                        onClick={() => onFollowup(f)}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] text-slate-500 transition-colors hover:border-rsg-navy/40 hover:text-rsg-navy dark:border-white/10 dark:text-zinc-400 dark:hover:border-rsg-gold/40 dark:hover:text-rsg-gold"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 pt-1">
                  <button
                    onClick={() => onSpeak(message.id, speakText)}
                    title="Read aloud"
                    className={cn(
                      'rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5',
                      speakingId === message.id && 'bg-rsg-navy/10 text-rsg-navy dark:bg-rsg-gold/10 dark:text-rsg-gold',
                    )}
                  >
                    {speakingId === message.id ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={copy}
                    title="Copy"
                    className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rsg-navy to-sky-500 text-white dark:from-rsg-gold dark:to-amber-500">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-slate-400"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

function VoMiniList({ vos }: { vos: VORecord[] }) {
  return (
    <div className="space-y-1.5">
      {vos.slice(0, 6).map((v) => {
        const cfg = statusConfigOf(v);
        const val = v.value ?? v.rsgAssessment ?? v.costProposal ?? 0;
        return (
          <div
            key={v.sno}
            className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/50 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/[0.02]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.hex }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-zinc-200">
                {v.voNumber ?? 'VO'} · {v.subject}
              </p>
              <p className="text-[10px] text-slate-400">{cfg.label}</p>
            </div>
            <span className={cn('shrink-0 text-xs font-semibold', val < 0 ? 'text-rose-500' : 'text-slate-700 dark:text-zinc-200')}>
              {formatCompact(val)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PaymentMiniList({ items }: { items: PaymentRecord[] }) {
  return (
    <div className="space-y-1.5">
      {items.slice(0, 6).map((p) => {
        const cfg = PAYMENT_STATE_CONFIG[paymentState(p)];
        return (
          <div
            key={p.no}
            className="flex items-center gap-2 rounded-lg border border-slate-200/70 bg-white/50 px-2.5 py-1.5 dark:border-white/5 dark:bg-white/[0.02]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: cfg.hex }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-slate-700 dark:text-zinc-200">{p.no}</p>
              <p className="truncate text-[10px] text-slate-400">{cfg.label}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-slate-700 dark:text-zinc-200">
              {formatCompact(p.net)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function BreakdownBars({ items }: { items: { label: string; value: number; count?: number; hex: string }[] }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.label} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-zinc-300">
              {i.label} {i.count != null && <span className="text-slate-400">· {i.count}</span>}
            </span>
            <span className="font-medium text-slate-700 dark:text-zinc-200">{formatCompact(i.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(Math.abs(i.value) / max) * 100}%` }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: i.hex }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* Minimal markdown: **bold**, headings (##/###), bullets (• or -) */
function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed text-slate-600 dark:text-zinc-300">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('### ')) {
          return <p key={i} className="pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{line.slice(4)}</p>;
        }
        if (line.startsWith('## ')) {
          return <p key={i} className="pt-1 text-sm font-bold text-slate-900 dark:text-white">{line.slice(3)}</p>;
        }
        const isBullet = line.startsWith('• ') || line.startsWith('- ');
        return (
          <p key={i} className={cn(isBullet && 'pl-3')}>
            {isBullet && <span className="text-rsg-navy dark:text-rsg-gold">• </span>}
            <Inline text={isBullet ? line.slice(2) : line} />
          </p>
        );
      })}
    </div>
  );
}

function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) {
          return <strong key={i} className="font-semibold text-slate-900 dark:text-white">{p.slice(2, -2)}</strong>;
        }
        if (p.startsWith('*') && p.endsWith('*')) {
          return <em key={i} className="text-slate-500">{p.slice(1, -1)}</em>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function stripMd(text: string): string {
  return text.replace(/\*\*/g, '').replace(/^#+\s/gm, '');
}
