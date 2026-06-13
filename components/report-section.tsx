'use client';

import React from 'react';

interface ReportSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: 'default' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

const accentMap = {
  default: { border: 'border-slate-200',  header: 'bg-slate-50  text-slate-800', icon: 'text-slate-500' },
  emerald: { border: 'border-emerald-200', header: 'bg-emerald-50 text-emerald-900', icon: 'text-emerald-600' },
  amber:   { border: 'border-amber-200',   header: 'bg-amber-50   text-amber-900',   icon: 'text-amber-600' },
  rose:    { border: 'border-rose-200',    header: 'bg-rose-50    text-rose-900',    icon: 'text-rose-600' },
  sky:     { border: 'border-sky-200',     header: 'bg-sky-50     text-sky-900',     icon: 'text-sky-600' },
  violet:  { border: 'border-violet-200',  header: 'bg-violet-50  text-violet-900',  icon: 'text-violet-600' },
};

export default function ReportSection({
  title,
  icon,
  children,
  accent = 'default',
}: ReportSectionProps) {
  const a = accentMap[accent];
  return (
    <div className={`border ${a.border} rounded-xl overflow-hidden shadow-sm`}>
      <div className={`${a.header} px-4 py-3 flex items-center gap-2 border-b ${a.border}`}>
        {icon && <span className={`shrink-0 ${a.icon}`}>{icon}</span>}
        <h3 className="text-xs font-extrabold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="bg-white p-4">{children}</div>
    </div>
  );
}
