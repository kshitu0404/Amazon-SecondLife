'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Map, ArrowLeft, ShieldCheck, Box } from 'lucide-react';
import { ProductJourney } from '@/lib/inspection';
import LifecycleTimeline from '@/components/lifecycle-timeline';
import StatusBadge from '@/components/status-badge';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function JourneyPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [journey, setJourney] = useState<ProductJourney | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        const res = await fetch(`/api/inspections/${runId}`);
        const data = await res.json();
        if (data.success) {
          setJourney(data.journey);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJourney();
  }, [runId]);

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading product journey...</p>
        </div>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold">Journey not found.</div>
    );
  }

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <Link href="/history" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to History
            </Link>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider mb-1 inline-flex items-center gap-1">
              <Map className="w-3.5 h-3.5" /> Product Journey
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {journey.productName}
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <span className="text-xs font-extrabold text-slate-500 uppercase">Current Status</span>
            <StatusBadge status={journey.lifecycleStatus} />
          </div>
        </div>

        {/* Top Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex items-start gap-4">
            <div className="w-24 h-24 bg-white rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-sm">
              <img src={journey.uploadedImages[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{journey.category}</p>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                <span className="text-sm font-extrabold text-slate-900">
                  Cond. Score: {journey.inspectionReport.overall_condition_score}
                </span>
              </div>
              {journey.routingResult && (
                <div className="flex items-center gap-1">
                  <Box className="w-4 h-4 text-amazon-orange" />
                  <span className="text-sm font-extrabold text-slate-900">
                    Route: {journey.routingResult.route}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-amazon-secondary text-white rounded-xl p-5 border border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Final Outcome & Sustainability</h3>
            {['SOLD', 'DONATED', 'RECYCLED'].includes(journey.lifecycleStatus) ? (
              <p className="text-sm font-bold text-emerald-400 mb-3">
                Item successfully processed and circular cycle completed.
              </p>
            ) : (
              <p className="text-sm font-bold text-amber-400 mb-3">
                Journey in progress. Final outcome pending.
              </p>
            )}
            <div className="flex flex-col gap-1 text-xs">
              <span>CO2 Saved: {journey.inspectionReport.sustainability_impact.estimated_co2_saved}</span>
              <span>Waste Diverted: {journey.inspectionReport.sustainability_impact.estimated_waste_diverted}</span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-4">
          <h2 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-2">Lifecycle Timeline</h2>
          <div className="px-4">
            <LifecycleTimeline history={journey.statusHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}
