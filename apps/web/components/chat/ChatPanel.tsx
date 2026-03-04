'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Mountain } from 'lucide-react';
import { useChat } from '@/lib/use-chat';

const SUGGESTED_TOPICS = [
  { label: 'Best trails in Moab', prompt: 'What are the best trails in Moab for intermediate mountain bikers?' },
  { label: 'Trip planning tips', prompt: 'Help me plan a 3-day outdoor trip. What should I consider?' },
  { label: 'Gear advice', prompt: 'What essential gear should I bring for a day hike in the mountains?' },
  { label: 'Trail safety', prompt: 'What are the most important trail safety tips for beginners?' },
];

export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, setInput, sendMessage, isStreaming, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-28 right-4 md:bottom-8 md:right-8 z-[60] h-14 w-14 rounded-full bg-canopy shadow-lg shadow-canopy/30 flex items-center justify-center text-white hover:bg-canopy-dark transition-all hover:scale-105"
        aria-label={isOpen ? 'Close chat' : 'Open chat assistant'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-44 right-4 md:bottom-24 md:right-8 z-[60] w-[calc(100vw-2rem)] max-w-[360px] max-h-[500px] flex flex-col rounded-2xl border border-cairn-border bg-cairn-card shadow-2xl shadow-black/30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cairn-border bg-cairn-elevated/50">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-canopy/15 flex items-center justify-center">
                <Mountain className="h-4 w-4 text-canopy" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Cairn Assistant</h3>
                <p className="text-[10px] text-slate-500">Powered by Claude</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-cairn-elevated transition-colors"
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[340px]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center">
                  Ask me about trails, trip planning, gear, or safety tips!
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => sendMessage(topic.prompt)}
                      className="rounded-lg border border-cairn-border bg-cairn-elevated/30 p-2 text-xs text-slate-400 hover:text-slate-200 hover:border-canopy/30 transition-colors text-left"
                    >
                      {topic.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-canopy/15 text-slate-200 border border-canopy/20'
                        : 'bg-cairn-elevated text-slate-300 border border-cairn-border'
                    }`}
                  >
                    {msg.content || (
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-cairn-border bg-cairn-elevated/30"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about trails, gear, safety..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 outline-none"
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-lg bg-canopy text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-canopy-dark transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
