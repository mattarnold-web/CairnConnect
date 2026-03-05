'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import { CairnLogo } from '@/components/ui/CairnLogo';
import { useRouter } from 'next/navigation';
import { useChat } from '@/lib/use-chat';
import type { PlatformAction } from '@/lib/chat-types';

const SUGGESTED_TOPICS = [
  {
    label: 'Plan a trip',
    prompt: 'Help me plan an outdoor adventure trip!',
  },
  {
    label: 'Find trails',
    prompt: 'Find me some great trails for intermediate hikers.',
  },
  {
    label: 'Gear advice',
    prompt: 'What essential gear should I bring for a day hike?',
  },
  {
    label: 'Track activity',
    prompt: 'I want to record a hike. How do I start?',
  },
];

/* --------------- Draggable FAB Hook --------------- */
function useDraggableFab() {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const fabStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  const getDefault = useCallback(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return {
      x: (typeof window !== 'undefined' ? window.innerWidth : 400) - 72,
      y:
        (typeof window !== 'undefined' ? window.innerHeight : 800) -
        (isMobile ? 140 : 72),
    };
  }, []);

  useEffect(() => {
    if (!position) setPosition(getDefault());
  }, [position, getDefault]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      hasMoved.current = false;
      dragStart.current = { x: e.clientX, y: e.clientY };
      fabStart.current = position ?? getDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position, getDefault],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasMoved.current = true;
      const newX = Math.max(
        8,
        Math.min(window.innerWidth - 64, fabStart.current.x + dx),
      );
      const newY = Math.max(
        8,
        Math.min(window.innerHeight - 64, fabStart.current.y + dy),
      );
      setPosition({ x: newX, y: newY });
    },
    [],
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return {
    position: position ?? getDefault(),
    fabRef,
    hasMoved,
    handlers: { onPointerDown, onPointerMove, onPointerUp },
  };
}

/* --------------- Action Button --------------- */
function ActionButton({
  action,
  onExecute,
}: {
  action: PlatformAction;
  onExecute: (action: PlatformAction) => void;
}) {
  return (
    <button
      onClick={() => onExecute(action)}
      className="flex items-center gap-1.5 rounded-lg border border-canopy/30 bg-canopy/10 px-2.5 py-1.5 text-xs font-medium text-canopy hover:bg-canopy/20 transition-colors"
    >
      <ArrowRight className="h-3 w-3" />
      {action.label}
    </button>
  );
}

/* --------------- Chat Panel --------------- */
export function ChatPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { messages, input, setInput, sendMessage, isStreaming, clearMessages } =
    useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { position, fabRef, hasMoved, handlers } = useDraggableFab();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const executeAction = useCallback(
    (action: PlatformAction) => {
      router.push(action.path);
      setIsOpen(false);
    },
    [router],
  );

  const handleFabClick = useCallback(() => {
    if (!hasMoved.current) {
      setIsOpen((o) => !o);
    }
  }, [hasMoved]);

  if (!mounted) return null;

  // Chat window position: anchored near FAB
  const chatStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 60,
    bottom: Math.max(16, window.innerHeight - position.y + 8),
    right: Math.max(16, window.innerWidth - position.x - 56),
  };

  return (
    <>
      {/* Draggable FAB */}
      <button
        ref={fabRef}
        onClick={handleFabClick}
        {...handlers}
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          zIndex: 61,
          touchAction: 'none',
        }}
        className="h-14 w-14 rounded-full bg-canopy shadow-lg shadow-canopy/30 flex items-center justify-center text-white hover:bg-canopy-dark transition-colors select-none cursor-grab active:cursor-grabbing group"
        aria-label={isOpen ? 'Close chat' : 'Open Cairn assistant'}
      >
        <GripVertical className="h-3 w-3 absolute top-1 right-1 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          style={chatStyle}
          className="w-[calc(100vw-2rem)] max-w-[380px] max-h-[520px] flex flex-col rounded-2xl border border-cairn-border bg-cairn-card shadow-2xl shadow-black/30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-cairn-border bg-cairn-elevated/50">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-canopy/15 flex items-center justify-center">
                <CairnLogo className="h-4 w-4 text-canopy" />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Cairn Assistant
                </h3>
                <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Powered by Claude &middot; Ask me anything
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 rounded-lg hover:bg-cairn-elevated transition-colors"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[360px]">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-center" style={{ color: 'var(--text-tertiary)' }}>
                  I can help with trails, trips, gear — or take you anywhere on the platform.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_TOPICS.map((topic) => (
                    <button
                      key={topic.label}
                      onClick={() => sendMessage(topic.prompt)}
                      className="rounded-lg border border-cairn-border bg-cairn-elevated/30 p-2 text-xs hover:border-canopy/30 transition-colors text-left"
                      style={{ color: 'var(--text-secondary)' }}
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
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-canopy/15 border border-canopy/20'
                          : 'bg-cairn-elevated border border-cairn-border'
                      }`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {msg.content || (
                        <span className="inline-flex gap-1">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-canopy/50 animate-bounce"
                            style={{ animationDelay: '0ms' }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-canopy/50 animate-bounce"
                            style={{ animationDelay: '150ms' }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-canopy/50 animate-bounce"
                            style={{ animationDelay: '300ms' }}
                          />
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {msg.actions.map((action, i) => (
                          <ActionButton
                            key={i}
                            action={action}
                            onExecute={executeAction}
                          />
                        ))}
                      </div>
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
              placeholder="Ask anything or say what you'd like to do..."
              className="flex-1 bg-transparent text-sm placeholder:opacity-40 outline-none"
              style={{ color: 'var(--text-primary)' }}
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
