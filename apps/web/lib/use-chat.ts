'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, PlatformAction } from './chat-types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = (text ?? input).trim();
      if (!content || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-u`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setInput('');
      setIsStreaming(true);

      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          const errorText = await res.text().catch(() => 'Unknown error');
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: `Error: ${errorText}` }
                : m,
            ),
          );
          setIsStreaming(false);
          return;
        }

        const contentType = res.headers.get('Content-Type') || '';

        // JSON response = text + actions
        if (contentType.includes('application/json')) {
          const data = await res.json();
          const actions: PlatformAction[] = data.actions || [];
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: data.text || '', actions }
                : m,
            ),
          );
          setIsStreaming(false);
          return;
        }

        // Streaming text response
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const snapshot = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: snapshot } : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [input, isStreaming, messages],
  );

  const clearMessages = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, input, setInput, sendMessage, isStreaming, clearMessages };
}
