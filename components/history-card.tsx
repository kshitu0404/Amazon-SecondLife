import React from 'react';
import { ProductJourney, LifecycleStatus } from '@/lib/inspection';
import StatusBadge from './status-badge';
import Link from 'next/link';
import { ShieldCheck, Calendar, ArrowRight } from 'lucide-react';

interface HistoryCardProps {
  journey: ProductJourney;
  onStatusChange: (runId: string, newStatus: LifecycleStatus) => void;
}

export default function HistoryCard({ journey, onStatusChange }: HistoryCardProps) {
  const { runId, productName, category, lifecycleStatus, inspectionReport, createdAt, uploadedImages, routingResult } = journey;

  const dateStr = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const thumbnail = uploadedImages?.[0] || 'https://via.placeholder.com/150';
  const conditionScore = inspectionReport?.overall_condition_score || 0;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition hover:shadow-md">
      <div className="p-4 border-b border-slate-100 flex items-start gap-4">
        <div className="w-20 h-20 bg-slate-50 rounded-lg overflow-hidden border border-slate-100 shrink-0">
          <img src={thumbnail} alt={productName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{category}</span>
            <StatusBadge status={lifecycleStatus} />
          </div>
          <h3 className="text-sm font-extrabold text-slate-900 truncate mb-1" title={productName}>
            {productName}
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> {dateStr}
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#10b981]" /> Cond: {conditionScore}
            </span>
          </div>
        </div>
      </div>
      
      {routingResult && (
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700 flex justify-between">
          <span>AI Route:</span>
          <span className="uppercase text-amazon-orange-hover">{routingResult.route}</span>
        </div>
      )}

      <div className="p-4 bg-slate-50/50 flex flex-col gap-3">
        <div className="flex gap-2">
          <Link href={`/journey/${runId}`} className="flex-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition">
            View Journey
          </Link>
          <Link href={`/analysis?runId=${runId}`} className="flex-1 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center transition">
            Report
          </Link>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
          {['SOLD', 'DONATED', 'RECYCLED', 'ARCHIVED'].map(status => (
            <button
              key={status}
              onClick={() => onStatusChange(runId, status as LifecycleStatus)}
              className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 px-2 py-1 rounded"
              disabled={lifecycleStatus === status}
            >
              Mark {status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
