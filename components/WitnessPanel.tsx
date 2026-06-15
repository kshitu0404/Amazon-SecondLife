'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, UserCircle, ShieldCheck, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WitnessPanel({ product, onClose }: { product: any, onClose: () => void }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: `Hi! I'm the AI persona representing the previous owner of this ${product.name}. Ask me anything about my experience with it.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI response logic
    setTimeout(() => {
      let aiText = "It worked great for me, but I upgraded to a newer model.";
      const query = userMsg.text.toLowerCase();
      
      if (query.includes('battery')) {
        aiText = "Used for light browsing and coding. Battery health remained above 90 percent. No repairs done.";
      } else if (query.includes('scratch') || query.includes('condition')) {
        aiText = "I kept it in a case most of the time. There's a tiny scuff on the bottom left corner, but the screen is flawless.";
      } else if (query.includes('why') || query.includes('return')) {
        aiText = "I honestly just bought the wrong size. It didn't fit my setup, so I returned it immediately.";
      }

      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiText }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-8 right-8 w-80 bg-white border border-slate-200 shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden flex flex-col z-[100] h-96"
    >
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-start">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <UserCircle className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <h4 className="text-slate-900 font-bold text-sm flex items-center gap-1">
              Verified Persona <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </h4>
            <p className="text-xs text-slate-500">Powered by WitnessPanel AI</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
              m.sender === 'user' 
                ? 'bg-slate-900 text-white rounded-br-none' 
                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-sm">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the condition..."
            className="w-full bg-white text-slate-900 text-sm rounded-xl pl-4 pr-10 py-3 outline-none border border-slate-200 focus:border-slate-400 transition-colors shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
