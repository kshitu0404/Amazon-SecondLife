'use client';

// components/nova/NovaOverlay.tsx
// Globally rendered floating Nova bee + animated speech bubble.
// Uses Framer Motion for all transitions.
//
// Place once inside your root layout:
//   <NovaProvider>
//     {children}
//     <NovaOverlay />
//   </NovaProvider>

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';
import { useNova } from './NovaContext';
import NovaBee from './NovaBee';
import NovaChat from './NovaChat';

// ─── Thinking dots ───────────────────────────────────────────────────────────

function ThinkingDots() {
  return (
    <span className="flex items-center gap-1 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"
          animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

// ─── Reward popup ────────────────────────────────────────────────────────────

function RewardPopup({ credits, reason }: { credits: number; reason?: string }) {
  return (
    <motion.div
      key="reward"
      initial={{ opacity: 0, y: 20, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
    >
      <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl shadow-xl px-5 py-4 text-center min-w-[180px]">
        <div className="text-2xl mb-1">🍯</div>
        <div className="text-slate-900 font-bold text-lg">+{credits} Nectar Credits</div>
        {reason && <div className="text-slate-600 text-xs mt-1">{reason}</div>}
      </div>
    </motion.div>
  );
}

// ─── Main overlay ─────────────────────────────────────────────────────────────

export default function NovaOverlay() {
  const { mood, message, visible, rewardPopup, isThinking, isChatOpen, setIsChatOpen } = useNova();

  // Smooth bobbing via spring on a sine wave
  const rawY = useMotionValue(0);
  const beeY = useSpring(rawY, { stiffness: 60, damping: 12 });
  const frameRef = useRef<number>(0);

  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.03;
      rawY.set(Math.sin(t) * 7);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [rawY]);

  if (!visible) return null;

  return (
    <div className="fixed z-50 right-6 bottom-6 flex items-end gap-6 pointer-events-none">
      
      {/* ── Left Column: Messages & Rewards ── */}
      <div className="flex flex-col items-end gap-4 pb-[20px] pointer-events-none">
        
        {/* ── Reward popup ── */}
        <AnimatePresence>
          {rewardPopup && (
            <div className="pointer-events-auto">
              <RewardPopup credits={rewardPopup.credits} reason={rewardPopup.reason} />
            </div>
          )}
        </AnimatePresence>

        {/* ── Speech bubble ── */}
        <AnimatePresence>
          {message && (
            <motion.div
              key="bubble"
              className="pointer-events-auto max-w-[280px]"
              initial={{ opacity: 0, x: 20, scale: 0.93 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            >
              <div className="relative bg-[#ffffff] border border-[#e2e8f0] rounded-2xl shadow-xl px-4 py-3">
                {/* Bubble tail pointing right */}
                <div
                  className="absolute bottom-[20px] right-[-9px] w-0 h-0"
                  style={{
                    borderTop: '9px solid transparent',
                    borderBottom: '9px solid transparent',
                    borderLeft: '9px solid #ffffff',
                  }}
                />
                <div
                  className="absolute bottom-[19px] right-[-11px] w-0 h-0 -z-10"
                  style={{
                    borderTop: '10px solid transparent',
                    borderBottom: '10px solid transparent',
                    borderLeft: '10px solid #e2e8f0',
                  }}
                />

                {/* Message content */}
                {isThinking ? (
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-800 leading-relaxed">{message}</p>
                    <ThinkingDots />
                  </div>
                ) : (
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Right Column: Nova Mascot ── */}
      <motion.div
        className="pointer-events-auto cursor-pointer select-none"
        style={{ y: beeY, filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.4))' }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsChatOpen(!isChatOpen)}
        title="Nova AI Chat"
        aria-label="Toggle Nova AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mood}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <NovaBee 
              mood={mood} 
              className="w-16 h-16 sm:w-24 sm:h-24 md:w-36 md:h-36 lg:w-[180px] lg:h-[180px] drop-shadow-2xl" 
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Nova Chat Drawer ── */}
      <AnimatePresence>
        {isChatOpen && <NovaChat />}
      </AnimatePresence>

    </div>
  );
}
