'use client';

import React from 'react';

interface ScoreMetricProps {
  label: string;
  score: number;         // 0–100
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  colorOverride?: string; // Tailwind color class for the fill
}

function getScoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-teal-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-rose-600';
}

function getBarColor(score: number): string {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-teal-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 55) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Critical';
}

const sizeMap = {
  sm: { number: 'text-2xl', label: 'text-[10px]', grade: 'text-[10px]' },
  md: { number: 'text-4xl', label: 'text-xs',     grade: 'text-xs' },
  lg: { number: 'text-5xl', label: 'text-sm',     grade: 'text-sm' },
};

export default function ScoreMetric({
  label,
  score,
  size = 'md',
  showBar = true,
  colorOverride,
}: ScoreMetricProps) {
  const sz = sizeMap[size];
  const colorClass = colorOverride || getScoreColor(score);
  const barClass = colorOverride || getBarColor(score);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`${sz.number} font-black tabular-nums leading-none ${colorClass}`}>
        {score}
        <span className="text-lg font-bold opacity-60">%</span>
      </span>

      <span className={`${sz.grade} font-bold uppercase tracking-wider ${colorClass}`}>
        {getScoreLabel(score)}
      </span>

      <span className={`${sz.label} text-slate-500 font-semibold text-center leading-tight`}>
        {label}
      </span>

      {showBar && (
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mt-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${barClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
