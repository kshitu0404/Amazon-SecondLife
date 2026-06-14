"use client";

import React from "react";
import Image from "next/image";

export type NovaMood = "idle" | "happy" | "excited" | "thinking" | "scanning" | "proud";

interface NovaBeeProps {
  mood?: NovaMood;
  size?: number | string;
  className?: string;
}

import idleImg from "../../../public/images/nova/idle.png";
import happyImg from "../../../public/images/nova/happy.png";
import excitedImg from "../../../public/images/nova/excited.png";
import thinkingImg from "../../../public/images/nova/thinking.png";
import scanningImg from "../../../public/images/nova/scanning.png";
import sadImg from "../../../public/images/nova/sad.png";

const moodImages: Record<string, any> = {
  idle: idleImg,
  happy: happyImg,
  excited: excitedImg,
  thinking: thinkingImg,
  scanning: scanningImg,
  sad: sadImg,
};

export default function NovaBee({ mood = "idle", size, className = "" }: NovaBeeProps) {
  // If mood is 'proud', fallback to 'happy' since proud.png doesn't exist
  const imageMood = mood === "proud" ? "happy" : mood;
  
  // Using standard next/image for optimization with static imports (auto-hashes for cache-busting)
  return (
    <div 
      className={`relative drop-shadow-xl pointer-events-none transition-all duration-300 ${className}`} 
      style={size ? { width: size, height: size } : undefined}
    >
      <Image 
        src={moodImages[imageMood] || idleImg} 
        alt={`Nova bee looking ${mood}`}
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
