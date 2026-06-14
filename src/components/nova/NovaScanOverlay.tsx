'use client';

// components/nova/NovaScanOverlay.tsx
// Wraps a product image and animates Nova orbiting it during AI scanning.
//
// Usage:
//   <NovaScanOverlay isScanning={scanning}>
//     <img src={previewUrl} className="rounded-xl w-full" alt="Product" />
//   </NovaScanOverlay>

import { useEffect, useRef, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NovaBee from './NovaBee';

interface NovaScanOverlayProps {
  isScanning: boolean;
  children: ReactNode;
  /** Orbit X radius in px. Default: 130 */
  orbitX?: number;
  /** Orbit Y radius in px. Default: 75 */
  orbitY?: number;
}

export default function NovaScanOverlay({
  isScanning,
  children,
  orbitX = 130,
  orbitY = 75,
}: NovaScanOverlayProps) {
  const [beePos, setBeePos] = useState({ x: 0, y: 0 });
  const frameRef = useRef<number>(0);
  const angleRef = useRef<number>(0);

  useEffect(() => {
    if (!isScanning) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    const tick = () => {
      angleRef.current += 0.022;
      setBeePos({
        x: Math.cos(angleRef.current) * orbitX,
        y: Math.sin(angleRef.current) * orbitY,
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isScanning, orbitX, orbitY]);

  return (
    <div className="relative inline-block w-full">
      {/* Product image */}
      {children}

      {/* Scan overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            aria-label="Nova is scanning this product"
          >
            {/* Dim tint */}
            <div className="absolute inset-0 bg-black/10 rounded-xl" />

            {/* Cyan scan line */}
            <motion.div
              className="absolute left-0 right-0 h-0.5 bg-cyan-400 opacity-70"
              animate={{ top: ['5%', '95%', '5%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Corner bracket marks */}
            {[
              'top-2 left-2 border-t-2 border-l-2',
              'top-2 right-2 border-t-2 border-r-2',
              'bottom-2 left-2 border-b-2 border-l-2',
              'bottom-2 right-2 border-b-2 border-r-2',
            ].map((cls, i) => (
              <div key={i} className={`absolute w-5 h-5 border-cyan-400 rounded-sm ${cls}`} />
            ))}

            {/* Orbiting Nova */}
            <div
              className="absolute"
              style={{
                left: `calc(50% + ${beePos.x}px)`,
                top: `calc(50% + ${beePos.y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <NovaBee mood="scanning" size={44} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
