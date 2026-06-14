'use client';

// components/nova/NovaContext.tsx
// Global React Context for Nova.
// Wrap your root layout with <NovaProvider> and consume with useNova() anywhere.

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { NovaMood } from './NovaBee';

export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// ─── Public types ───────────────────────────────────────────────────────────

export interface NovaMessageOptions {
  /** Visual mood of the bee while this message is displayed. Defaults to 'happy'. */
  mood?: NovaMood;
  /** Auto-dismiss after this many ms. Pass 0 to keep indefinitely. Defaults to 5000. */
  duration?: number;
  /** If provided, triggers the Nectar Credits reward popup. */
  reward?: NovaReward;
}

export interface NovaReward {
  credits: number;
  reason?: string;
}

export interface NovaContextValue {
  mood: NovaMood;
  setMood: (mood: NovaMood) => void;
  message: string | null;
  setMessage: (msg: string | null) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  rewardPopup: NovaReward | null;
  isThinking: boolean;

  /** Show a speech bubble with optional mood + auto-dismiss. */
  nova: (msg: string, options?: NovaMessageOptions) => void;
  /** Enter thinking/scanning state while async work runs. */
  novaThink: (msg?: string) => void;
  /** Resolve thinking state and display a result message. */
  novaDone: (msg: string, options?: NovaMessageOptions) => void;
  /** Clear all Nova state immediately. */
  novaClear: () => void;

  // Chat State
  isChatOpen: boolean;
  setIsChatOpen: (v: boolean) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (msgs: ChatMessage[]) => void;
  appendChatMessage: (msg: ChatMessage) => void;
  currentProductContext: any | null;
  setCurrentProductContext: (product: any | null) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const NovaContext = createContext<NovaContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function NovaProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<NovaMood>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const [rewardPopup, setRewardPopup] = useState<NovaReward | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentProductContext, setCurrentProductContext] = useState<any | null>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nova_chat_history');
      if (saved) {
        setChatMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load chat history', e);
    }
  }, []);

  // Save chat history to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('nova_chat_history', JSON.stringify(chatMessages));
    } catch (e) {
      console.error('Failed to save chat history', e);
    }
  }, [chatMessages]);

  const appendChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  }, []);

  const nova = useCallback((msg: string, options: NovaMessageOptions = {}) => {
    const { mood: m = 'happy', duration = 5000, reward = null } = options;
    setMood(m);
    setMessage(msg);
    setIsThinking(false);
    if (reward) setRewardPopup(reward);
    if (duration > 0) {
      setTimeout(() => {
        setMessage(null);
        setMood('idle');
        if (reward) setRewardPopup(null);
      }, duration);
    }
  }, []);

  const novaThink = useCallback((msg = 'Thinking...') => {
    setMood('scanning');
    setMessage(msg);
    setIsThinking(true);
  }, []);

  const novaDone = useCallback((msg: string, options: NovaMessageOptions = {}) => {
    setIsThinking(false);
    nova(msg, options);
  }, [nova]);

  const novaClear = useCallback(() => {
    setMessage(null);
    setMood('idle');
    setIsThinking(false);
    setRewardPopup(null);
  }, []);

  return (
    <NovaContext.Provider value={{
      mood, setMood,
      message, setMessage,
      visible, setVisible,
      rewardPopup,
      isThinking,
      nova,
      novaThink,
      novaDone,
      novaClear,
      isChatOpen,
      setIsChatOpen,
      chatMessages,
      setChatMessages,
      appendChatMessage,
      currentProductContext,
      setCurrentProductContext
    }}>
      {children}
    </NovaContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useNova(): NovaContextValue {
  const ctx = useContext(NovaContext);
  if (!ctx) throw new Error('useNova() must be called inside <NovaProvider>.');
  return ctx;
}
