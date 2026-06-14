import React from 'react';
import { StatusEvent } from '@/lib/inspection';
import { CheckCircle2, Circle } from 'lucide-react';

interface LifecycleTimelineProps {
  history: StatusEvent[];
}

export default function LifecycleTimeline({ history }: LifecycleTimelineProps) {
  // Sort history chronologically
  const sorted = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 mt-4 mb-4">
      {sorted.map((event, idx) => {
        const dateStr = new Date(event.timestamp).toLocaleString('en-US', {
          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
        const isLast = idx === sorted.length - 1;
        
        return (
          <div key={idx} className="relative">
            {/* Timeline dot */}
            <div className={`absolute -left-[35px] bg-white rounded-full p-1 border-2 ${
              isLast ? 'border-amazon-orange text-amazon-orange' : 'border-[#10b981] text-[#10b981]'
            }`}>
              {isLast ? <Circle className="w-3.5 h-3.5 fill-amazon-orange" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>
            
            <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm ${isLast ? 'ring-2 ring-amazon-orange/20 border-amazon-orange/50' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <span className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                  {event.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded">
                  {dateStr}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {event.note}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <span className="uppercase tracking-wider">Action by:</span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                  {event.actor}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
