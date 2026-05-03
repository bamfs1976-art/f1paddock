import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';
import type { ChatMessage } from '../types';

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  fullScreen?: boolean;
}

const SUGGESTIONS = [
  'Who leads the 2026 championship?',
  'Explain the 2026 aero regulations',
  'Preview the next race weekend',
  'Compare Norris and Leclerc this season',
];

export default function AIChat({ open, onOpen, onClose, fullScreen }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const submit = async (text: string) => {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const history = next.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChatMessage(text, history.slice(0, -1));
      if (res?.response) {
        setMessages((m) => [...m, { role: 'assistant', content: res.response, timestamp: Date.now() }]);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (e) {
      const msg = (e as Error).message === 'RATE_LIMITED'
        ? 'Paddock AI is busy. Try again in a moment.'
        : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  if (!open) {
    return (
      <button
        onClick={onOpen}
        className="hidden md:flex fixed bottom-6 right-6 z-40 bg-racing text-white p-4 rounded-full shadow-lg btn-press items-center gap-2"
        aria-label="Open Paddock AI chat"
      >
        <MessageSquare size={18} aria-hidden="true" />
        <span className="font-mono text-xs">PADDOCK AI</span>
      </button>
    );
  }

  const wrapperClass = fullScreen
    ? 'fixed inset-0 z-50 bg-paper flex flex-col'
    : 'fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-paper border-l-2 border-ink flex flex-col shadow-2xl';

  return (
    <AnimatePresence>
      <motion.div
        initial={fullScreen ? { y: '100%' } : { x: '100%' }}
        animate={fullScreen ? { y: 0 } : { x: 0 }}
        exit={fullScreen ? { y: '100%' } : { x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={wrapperClass}
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-title"
      >
        <header className="flex items-center justify-between px-4 py-3 border-b border-ink-3 bg-paper-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-racing rounded-full pulse-dot" aria-hidden="true" />
            <h3 id="chat-title" className="font-serif text-lg">Paddock AI</h3>
          </div>
          <button onClick={onClose} className="p-2 btn-press" aria-label="Close chat">
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div>
              <div className="label-mono mb-3">SUGGESTED QUESTIONS</div>
              <div className="space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="w-full text-left p-3 border border-ink-3 bg-paper-2 hover:border-racing text-sm btn-press"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-paper-3 border border-ink-3 text-ink'
                    : 'bg-paper-2 border-l-2 border-racing text-ink'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-paper-2 border-l-2 border-racing px-4 py-3 flex gap-1.5" aria-label="Paddock AI is typing">
                <span className="typing-dot w-2 h-2 bg-ink-2 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-ink-2 rounded-full" />
                <span className="typing-dot w-2 h-2 bg-ink-2 rounded-full" />
              </div>
            </div>
          )}
          {error && (
            <div className="text-xs text-racing border border-racing/50 p-2" role="alert">{error}</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-ink-3 p-3 flex gap-2 bg-paper-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Formula 1…"
            className="flex-1 bg-paper border border-ink-3 px-3 py-2 text-sm focus:border-racing"
            aria-label="Chat message"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-racing text-white px-4 py-2 btn-press disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
