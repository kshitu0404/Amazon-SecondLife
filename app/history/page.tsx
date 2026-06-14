'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, LayoutDashboard, PackageSearch } from 'lucide-react';
import { ProductJourney, LifecycleStatus } from '@/lib/inspection';
import HistoryCard from '@/components/history-card';

export default function HistoryPage() {
  const [journeys, setJourneys] = useState<ProductJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  
  const fetchJourneys = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inspections');
      const data = await res.json();
      if (data.success) {
        setJourneys(data.inspections);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourneys();
  }, []);

  const handleStatusChange = async (runId: string, newStatus: LifecycleStatus) => {
    try {
      const res = await fetch(`/api/inspections/${runId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchJourneys();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = journeys.filter(j => filter ? j.lifecycleStatus === filter : true);

  const stats = {
    total: journeys.length,
    sold: journeys.filter(j => j.lifecycleStatus === 'SOLD').length,
    donated: journeys.filter(j => j.lifecycleStatus === 'DONATED').length,
    recycled: journeys.filter(j => j.lifecycleStatus === 'RECYCLED').length,
  };

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider mb-1 inline-flex items-center gap-1">
              <LayoutDashboard className="w-3.5 h-3.5" /> Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Lifecycle History Dashboard
            </h1>
          </div>
          <button 
            onClick={fetchJourneys} 
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg transition text-xs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Insights Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-center">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Inspected</p>
            <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm text-center">
            <p className="text-xs font-bold text-green-700 uppercase">Items Sold</p>
            <p className="text-2xl font-black text-green-900">{stats.sold}</p>
          </div>
          <div className="bg-violet-50 border border-violet-200 p-4 rounded-xl shadow-sm text-center">
            <p className="text-xs font-bold text-violet-700 uppercase">Items Donated</p>
            <p className="text-2xl font-black text-violet-900">{stats.donated}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl shadow-sm text-center">
            <p className="text-xs font-bold text-orange-700 uppercase">Items Recycled</p>
            <p className="text-2xl font-black text-orange-900">{stats.recycled}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase mr-2">Filter by Status:</span>
          {['', 'INSPECTED', 'ROUTED', 'SOLD', 'DONATED', 'RECYCLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                filter === f ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f || 'All'}
            </button>
          ))}
        </div>

        {/* Cards */}
        {loading ? (
          <div className="py-12 flex justify-center"><RefreshCw className="w-8 h-8 text-slate-400 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-2 text-slate-500">
            <PackageSearch className="w-10 h-10 opacity-50" />
            <p className="text-sm font-bold">No product journeys found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(j => (
              <HistoryCard key={j.runId} journey={j} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
