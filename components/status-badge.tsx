import React from 'react';
import { LifecycleStatus } from '@/lib/inspection';

interface StatusBadgeProps {
  status: LifecycleStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getBadgeStyle = (status: LifecycleStatus) => {
    switch (status) {
      case 'UPLOADED':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'INSPECTED':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'ROUTED':
        return 'bg-indigo-100 text-indigo-700 border-indigo-300';
      case 'LISTED':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'SOLD':
        return 'bg-green-100 text-green-700 border-green-400';
      case 'DONATED':
        return 'bg-violet-100 text-violet-700 border-violet-300';
      case 'RECYCLED':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'MANUAL_REVIEW':
        return 'bg-amber-100 text-amber-700 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getBadgeStyle(status)} ${className}`}>
      {status.replace('_', ' ')}
    </span>
  );
}
