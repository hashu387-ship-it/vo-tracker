'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { useProject } from './project-provider';

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Total value of under-review VOs?',
  'Summarise delay-impact VOs',
  'How much cash received to date?',
];

/**
 * Conversational "Chat with Project" (RAG) side panel. Posts to /api/ai/chat,
 * which grounds answers in the commercial register. Degrades gracefully with a
 * clear message when OPENAI_API_KEY is not configured.
 */
export function AiChatPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { project } = useProject();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', content: q }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, projectCode: project.code }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: 'assistant', content: data.text ?? 'No response.' }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'Network error — please try again.' }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => listRef.current?.scrollTo({ top: 1e9, behavior: 'smooth' }));
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[80] bg-charcoal/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="liquid-glass-strong fixed right-0 top-0 z-[81] flex h-full w-[420px] max-w-[92vw] flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bronze text-white shadow-bronze">
                  <Sparkles className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">Chat with Project</div>
                  <div className="text-[11px] text-muted-foreground">{project.name} · RAG</div>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ask anything about the commercial register — variations, payments, forecasts.
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="neu rounded-xl px-3.5 py-2.5 text-left text-[13px] text-foreground transition-transform hover:-translate-y-0.5"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      'max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ' +
                      (m.role === 'user'
                        ? 'bg-bronze text-white'
                        : 'liquid-glass text-foreground')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 border-t border-border/60 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the project…"
                className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-bronze/40"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-bronze text-white shadow-bronze disabled:opacity-50"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
