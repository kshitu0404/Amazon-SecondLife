import React from 'react';
import prisma from '@/lib/prisma';
import { Leaf, HeartHandshake, PackageOpen, Users, Globe2, Sparkles, Box, ArrowRight, CheckCircle2, TrendingUp, Search, BadgeCheck } from 'lucide-react';
import NgoNovaWrapper from './NgoNovaWrapper';

export const revalidate = 0; // Dynamic rendering

export default async function NgoPortal() {
  // Fetch Analytics
  const [totalDonations, ngos, requests, donations] = await Promise.all([
    prisma.donation.count(),
    prisma.ngo.findMany(),
    prisma.ngoRequest.findMany({ include: { ngo: true }, orderBy: { createdAt: 'desc' } }),
    prisma.donation.findMany({ include: { ngo: true }, orderBy: { createdAt: 'desc' }, take: 50 })
  ]);

  const totalCo2 = donations.reduce((acc, d) => acc + (d.co2SavedKg || 0), 0);
  const totalPeople = donations.reduce((acc, d) => acc + (d.peopleImpacted || 0), 0);
  const totalWaste = donations.reduce((acc, d) => acc + (d.wasteDivertedKg || 0), 0);

  // Group requests by category for Demand Analytics
  const demandByCategory = requests.reduce((acc, req) => {
    if (req.status === 'Open') {
      acc[req.itemCategory] = (acc[req.itemCategory] || 0) + req.quantityNeeded;
    }
    return acc;
  }, {} as Record<string, number>);

  const topDemand = Object.entries(demandByCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="min-h-screen honeycomb-bg pb-20">
      <NgoNovaWrapper />
      {/* Header - Styled like Concierge */}
      <div className="bg-[#FADD57] text-slate-900 pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-sm">
              <Globe2 className="w-6 h-6 text-[#FADD57]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Social Impact Intelligence</h1>
          </div>
          <p className="text-xl text-slate-800 font-bold leading-relaxed max-w-2xl">
            Transparent tracking of Amazon surplus converted into real-world impact. {totalDonations} donations routed to {ngos.length} communities so far.
          </p>
        </div>
      </div>

      {/* Main Content - Styled like Concierge */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-8 relative z-10">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">Total Donations</div>
            <div className="text-2xl font-black text-slate-900">{totalDonations}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">NGOs Supported</div>
            <div className="text-2xl font-black text-purple-600">{ngos.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">People Impacted</div>
            <div className="text-2xl font-black text-sky-600">{totalPeople}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">CO₂ Diverted</div>
            <div className="text-2xl font-black text-emerald-600">{Math.round(totalCo2)} kg</div>
          </div>
        </div>

        {/* Actionable Insights / Smart Match Engine */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-[#007185]" /> Smart Matching Opportunities
          </h2>
          
          {requests.filter(r => r.status === 'Open').slice(0, 3).map((req, idx) => {
            const colors = ["emerald", "sky", "purple"];
            const color = colors[idx % colors.length];
            
            return (
              <div key={req.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-slate-300">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start md:items-center gap-4">
                    <div className={`p-3 rounded-xl shrink-0 ${
                      color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-500' :
                      color === 'sky' ? 'bg-sky-50 border-sky-100 text-sky-500' :
                      'bg-purple-50 border-purple-100 text-purple-500'
                    } border`}>
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-extrabold text-slate-900 text-lg">{req.ngo.name}</h3>
                        {req.urgency === 'High' && (
                          <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            Urgent Request
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          color === 'sky' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          Needs {req.quantityNeeded} {req.itemCategory}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 font-medium flex items-center gap-3">
                        <span>{req.ngo.location}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{req.ngo.focusArea}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 md:w-auto w-full justify-end">
                    <button className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734] px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
                      Fulfill Match
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mt-8">
          {/* Top Demand Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              <h2 className="font-extrabold text-slate-800">Live NGO Demand</h2>
            </div>
            <div className="space-y-4">
              {topDemand.map(([category, count]) => {
                const max = topDemand[0][1];
                const width = `${Math.max(10, (count / max) * 100)}%`;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-700">{category}</span>
                      <span className="text-slate-500">{count} requested</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-slate-800 h-full rounded-full" style={{ width }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Donations Table (Condensed) */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 border-b border-slate-200/60 p-5">
              <h2 className="font-extrabold text-slate-800 flex items-center gap-2">
                <Box className="w-5 h-5 text-slate-700" /> Lifecycle Feed
              </h2>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto max-h-64">
              {donations.slice(0, 5).map(don => (
                <div key={don.id} className="flex justify-between items-center pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-sm truncate max-w-[200px]">{don.itemName}</span>
                    <span className="text-xs text-slate-500 font-medium">{don.category} • {don.source}</span>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-1 ${
                      don.status === 'Distributed' ? 'bg-emerald-100 text-emerald-700' :
                      don.status === 'Delivered' ? 'bg-sky-100 text-sky-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {don.status}
                    </span>
                    {don.ngo?.name && (
                      <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{don.ngo.name}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
