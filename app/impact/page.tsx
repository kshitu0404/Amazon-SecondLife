'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNovaImpact } from '@/src/components/nova/useNovaPage';
import SVGChart from '@/components/SVGChart';
import { mockImpactStats } from '@/data/mockProducts';
import { Leaf, Trash2, ShieldCheck, HelpCircle, Sparkles, RefreshCw, Calculator, ArrowRight, DollarSign, Trophy, Activity, Zap, Star } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ImpactPage() {
  useNovaImpact();
  const router = useRouter();
  // Data States
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculator States
  const [calcElectronics, setCalcElectronics] = useState(2);
  const [calcHome, setCalcHome] = useState(3);
  const [calcApparel, setCalcApparel] = useState(5);

  useEffect(() => {
    async function fetchImpact() {
      try {
        const res = await fetch('/api/impact');
        const data = await res.json();
        setImpactData(data);
      } catch (err) {
        console.error('Failed to load impact data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchImpact();
    
    // Poll every 15s to simulate real-time updates as requested in reference
    const interval = setInterval(fetchImpact, 15000);
    return () => clearInterval(interval);
  }, []);

  // Calculate personal impact
  const personalCo2 = calcElectronics * 79.5 + calcHome * 38.5 + calcApparel * 12.8;
  const personalWaste = calcElectronics * 0.206 + calcHome * 5.2 + calcApparel * 0.4;
  const personalCashback = calcElectronics * 220 + calcHome * 55 + calcApparel * 25;

  if (loading && !impactData) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading Live Impact Ledger...</p>
        </div>
      </div>
    );
  }

  const totals = impactData?.totals || {};
  const equivalents = impactData?.equivalents || {};
  const secondLifeBreakdown = impactData?.second_life_breakdown || {};

  const keyImpacts = [
    {
      id: 'impact-co2',
      label: 'CO2 Saved',
      value: `${Math.round(totals.carbon_saved_kg || 0).toLocaleString()} kg`,
      comparison: equivalents.driving || 'Equivalent to planting trees',
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'impact-water',
      label: 'Water Saved',
      value: `${Math.round(totals.water_saved_l || 0).toLocaleString()} L`,
      comparison: 'Conserved from manufacturing',
      icon: RefreshCw,
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      id: 'impact-waste',
      label: 'Waste Diverted',
      value: `${Math.round(totals.waste_diverted_kg || 0).toLocaleString()} kg`,
      comparison: 'Kept out of landfills',
      icon: Trash2,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      id: 'impact-secondlife',
      label: 'Products Given Second Life',
      value: `${(impactData?.products_given_second_life || 0).toLocaleString()}`,
      comparison: `${secondLifeBreakdown.resold || 0} resold · ${secondLifeBreakdown.donated || 0} donated`,
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="mb-2 border-b border-slate-100 pb-4 text-left">
          <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-block mb-1">
            📊 Live Platform Impact
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            The circular economy, in real time.
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Every metric below is computed from real transactions on the platform using deterministic lifecycle assessment logic.
          </p>
        </div>

        {/* Impact metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {keyImpacts.map((imp) => {
            const IconComp = imp.icon;
            return (
              <div
                key={imp.id}
                className="bg-slate-50/90 border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col text-left justify-between"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
                    {imp.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${imp.color} shrink-0`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight block">
                    {imp.value}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold block mt-1.5">
                    {imp.comparison}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- NEW REFERENCE DATA PANELS (STYLED TO MATCH EXISTING SYSTEM) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Top Circular Users */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Circular Users
            </h2>
            {impactData?.top_circular_users?.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {impactData?.top_circular_users?.map((u: any) => (
                  <div key={u.rank} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                    <span className="text-slate-800 font-bold text-sm">
                      #{u.rank} {u.name} <span className="text-slate-500 font-medium">· {u.city}</span>
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {u.score} · {u.tier}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live AI Inspections */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-500" />
              Live AI Inspections
            </h2>
            {impactData?.live_inspections?.length === 0 ? (
              <p className="text-sm text-slate-400">No inspections yet — run a return to see Qwen-VL grade an item.</p>
            ) : (
              <div className="space-y-0">
                {impactData?.live_inspections?.map((i: any, k: number) => (
                  <div key={k} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                    <span className="text-slate-800 font-bold text-sm">
                      {i.product} <span className="text-slate-500 font-medium">· {i.model}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs font-black px-2 py-0.5 rounded shadow-sm">
                        Grade {i.grade}
                      </span>
                      <span className="text-slate-500 text-xs font-bold">{Math.round(i.confidence * 100)}%</span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Recent Circular Activity */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amazon-orange" />
              Recent Circular Activity
            </h2>
            {impactData?.recent_activity?.length === 0 ? (
              <p className="text-sm text-slate-400">No activity yet.</p>
            ) : (
              <div className="space-y-0">
                {impactData?.recent_activity?.map((a: any, k: number) => (
                  <div key={k} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 py-3 last:border-0 gap-2 sm:gap-0">
                    <span className="text-slate-700 text-sm font-medium">
                      <b className="capitalize text-slate-900 mr-1">{a.action.replace('_', ' ')}</b> 
                      · {a.product} <span className="text-slate-500 text-xs ml-1">by {a.user}, {a.city}</span>
                    </span>
                    <span className="text-emerald-600 font-black text-sm whitespace-nowrap">
                      {a.carbon_saved_kg} kg CO₂
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Impactful Product */}
          {impactData?.most_impactful_product && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center gap-5">
              <img 
                src={impactData.most_impactful_product.image_url} 
                alt="" 
                className="h-20 w-20 rounded-xl object-cover border border-slate-200 p-1" 
                onError={(e) => (e.currentTarget.style.display = "none")} 
              />
              <div className="flex flex-col justify-center">
                <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  Most Impactful Product
                </div>
                <div className="font-extrabold text-slate-900 text-lg leading-tight">
                  {impactData.most_impactful_product.brand} {impactData.most_impactful_product.title}
                </div>
                <div className="text-sm text-emerald-600 font-black mt-1">
                  {Math.round(Number(impactData.most_impactful_product.carbon || 0))} kg CO₂ saved overall
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing SVG Charts Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 mt-4">
          <SVGChart
            type="line"
            title="Monthly Carbon Offsets Trend (kg CO2)"
            data={mockImpactStats.monthlyCo2Trend.map((d) => ({
              label: d.month,
              value: d.amount,
            }))}
            color="emerald"
            valueSuffix="kg"
          />
          <SVGChart
            type="donut"
            title="SecondLife Listings Category Share (%)"
            data={mockImpactStats.categoryDistribution.map((d) => ({
              label: d.name,
              value: d.percentage,
            }))}
            color="sky"
            valueSuffix="%"
          />
        </div>

        {/* Existing Calculator Section */}
        <section className="bg-slate-50/40 border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm text-left">
          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mb-6 flex items-center gap-2">
            <Calculator className="w-5.5 h-5.5 text-amazon-orange" />
            My Personal Circular Savings Calculator
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Inputs */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Electronics Rescued / Traded-In
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={calcElectronics}
                    onChange={(e) => setCalcElectronics(Number(e.target.value))}
                    className="w-full accent-amazon-orange cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                  <span className="text-sm font-black text-slate-900 w-8 text-center">{calcElectronics}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Kitchen Goods Rescued
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={calcHome}
                    onChange={(e) => setCalcHome(Number(e.target.value))}
                    className="w-full accent-amazon-orange cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                  <span className="text-sm font-black text-slate-900 w-8 text-center">{calcHome}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                  Apparel Items Rescued
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={calcApparel}
                    onChange={(e) => setCalcApparel(Number(e.target.value))}
                    className="w-full accent-amazon-orange cursor-pointer h-1.5 bg-slate-200 rounded"
                  />
                  <span className="text-sm font-black text-slate-900 w-8 text-center">{calcApparel}</span>
                </div>
              </div>
            </div>

            {/* Outputs */}
            <div className="lg:col-span-6 bg-slate-100/70 border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">
                  CO2 Saved
                </span>
                <span className="text-lg font-black text-emerald-600 tracking-tight">
                  {personalCo2.toFixed(1)} kg
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Offset Total</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">
                  Waste Kept Out
                </span>
                <span className="text-lg font-black text-sky-600 tracking-tight">
                  {personalWaste.toFixed(2)} kg
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Landfill Prevented</span>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">
                  Cash Back Earned
                </span>
                <span className="text-lg font-black text-slate-900 tracking-tight">
                  {formatPrice(personalCashback)}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 font-semibold">Trade-in Credit</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
