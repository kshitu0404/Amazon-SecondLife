'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNova } from './useNovaPage'; // Ensure this exists, or import from NovaContext
import { useNova as useNovaCtx } from './NovaContext';
import { X, Minus, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';

const defaultQuickActions = [
  'Explain return decisions',
  'Find laptops under ₹30,000',
  'Show my product passport',
  'How much carbon did I save?',
  'Why was this item rated Good?'
];

export default function NovaChat() {
  const { isChatOpen, setIsChatOpen, chatMessages, setChatMessages, appendChatMessage, currentProductContext } = useNovaCtx();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<string[]>(defaultQuickActions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Append user message
    const newMsg = { role: 'user' as const, content: text };
    appendChatMessage(newMsg);
    setInput('');
    setIsTyping(true);
    setQuickActions([]);

    try {
      const response = await fetch('/api/nova-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, newMsg],
          currentProductContext
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      
      appendChatMessage({ role: 'assistant', content: data.reply });
      
      if (data.followUps && data.followUps.length > 0) {
        setQuickActions(data.followUps);
      } else {
        setQuickActions(defaultQuickActions.slice(0, 3));
      }
    } catch (err) {
      appendChatMessage({ role: 'assistant', content: "I'm having a little trouble connecting to my central servers right now. Can you please try asking again in a moment? 🐝" });
      setQuickActions(defaultQuickActions.slice(0, 3));
    } finally {
      setIsTyping(false);
    }
  };

  if (!isChatOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed bottom-6 right-24 sm:right-32 md:right-48 lg:right-[220px] w-[350px] max-w-[calc(100vw-6rem)] max-h-[600px] h-[70vh] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden pointer-events-auto"
    >
      {/* Header */}
      <div className="bg-amber-50 border-b border-amber-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white border border-amber-200 p-0.5">
            <Image src="/images/nova/happy.png" alt="Nova" fill className="object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1">Nova AI <Sparkles className="w-3 h-3 text-amber-500" /></h3>
            <p className="text-[10px] text-slate-500 font-medium">Amazon SecondLife Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsChatOpen(false)} className="p-1.5 hover:bg-amber-100 text-amber-800 rounded-lg transition">
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        
        {/* Welcome Message */}
        {chatMessages.length === 0 && (
          <div className="flex gap-3">
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1">
              <Image src="/images/nova/happy.png" alt="Nova" fill className="object-contain" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-800 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm">
              Hi! I'm Nova 🐝. I'm your AI platform copilot. I can help you search the marketplace, explain our sustainability impact, clarify return policies, or review product health cards. How can I assist you today?
            </div>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1">
                <Image src="/images/nova/happy.png" alt="Nova" fill className="object-contain" />
              </div>
            )}
            <div className={`p-3 rounded-2xl shadow-sm text-sm max-w-[85%] whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-amber-500 text-white rounded-tr-sm' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 mt-1">
              <Image src="/images/nova/scanning.png" alt="Nova Thinking" fill className="object-contain" />
            </div>
            <div className="bg-white border border-slate-200 text-slate-500 p-3 rounded-2xl rounded-tl-sm shadow-sm text-sm flex items-center gap-2 italic">
              Nova is thinking
              <span className="flex gap-0.5 mt-1">
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions (Above Input) */}
      {quickActions.length > 0 && !isTyping && (
        <div className="bg-slate-50 px-4 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
          {quickActions.map(action => (
            <button 
              key={action}
              onClick={() => handleSend(action)}
              className="shrink-0 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium transition shadow-sm whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-center gap-2"
        >
          <input 
            type="text" 
            placeholder="Ask Nova anything..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-amber-400 outline-none placeholder:text-slate-400 text-slate-800 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </motion.div>
  );
}
