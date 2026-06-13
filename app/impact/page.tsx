'use client';

import React, { useState } from 'react';
import SVGChart from '@/components/SVGChart';
import { mockImpactStats } from '@/data/mockProducts';
import { Leaf, Trash2, ShieldCheck, HelpCircle, Sparkles, RefreshCw, Calculator, ArrowRight, DollarSign } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function ImpactPage() {
  // Calculator States
  const [calcElectronics, setCalcElectronics] = useState(2);
  const [calcHome, setCalcHome] = useState(3);
  const [calcApparel, setCalcApparel] = useState(5);

  // Calculate personal impact
  const personalCo2 = calcElectronics * 79.5 + calcHome * 38.5 + calcApparel * 12.8;
  const personalWaste = calcElectronics * 0.206 + calcHome * 5.2 + calcApparel * 0.4;
  const personalCashback = calcElectronics * 220 + calcHome * 55 + calcApparel * 25;

  const keyImpacts = [
    {
      id: 'impact-co2',
      label: 'CO2 Saved',
      value: `${mockImpactStats.totalCo2SavedKg.toLocaleString()} kg`,
      comparison: 'Equivalent to planting 8,420 mature trees',
      icon: Leaf,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      id: 'impact-waste',
      label: 'Waste Diverted',
      value: `${mockImpactStats.totalWasteDivertedKg.toLocaleString()} kg`,
      comparison: 'Weight of 14 standard garbage trucks',
      icon: Trash2,
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
    {
      id: 'impact-miles',
      label: 'Logistics Miles Saved',
      value: `${mockImpactStats.totalMilesAvoided.toLocaleString()} mi`,
      comparison: 'Equivalent to orbiting Earth 5 times',
      icon: RefreshCw,
      color: 'text-sky-600 bg-sky-50 border-sky-100',
    },
    {
      id: 'impact-packaging',
      label: 'Packaging Saved',
      value: `${mockImpactStats.totalPackagingSavedCount.toLocaleString()} units`,
      comparison: 'Reused shipping containers and wraps',
      icon: ShieldCheck,
      color: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="mb-2 border-b border-slate-100 pb-4 text-left">
        <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-block mb-1">
          📊 Circular Accounting Ledger
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sustainability Impact Dashboard
        </h1>
        <p className="text-sm text-slate-600 mt-1.5">
          Real-time metrics auditing carbon reductions, landfill diversion, and logistics cost savings across Amazon SecondLife.
        </p>
      </div>

      {/* Impact metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {keyImpacts.map((imp) => {
          const IconComp = imp.icon;
          return (
            <div
              key={imp.id}
              className="bg-slate-50/90 border border-slate-250 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col text-left justify-between"
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

      {/* SVG Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Chart 1: CO2 Saved Trend */}
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

        {/* Chart 2: Category distribution */}
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

      {/* Calculator Section */}
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
          <div className="lg:col-span-6 bg-slate-100/70 border border-slate-250 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="bg-white border border-slate-200/90 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">
                CO2 Saved
              </span>
              <span className="text-lg font-black text-emerald-600 tracking-tight">
                {personalCo2.toFixed(1)} kg
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Offset Total</span>
            </div>

            <div className="bg-white border border-slate-200/90 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-1">
                Waste Kept Out
              </span>
              <span className="text-lg font-black text-sky-600 tracking-tight">
                {personalWaste.toFixed(2)} kg
              </span>
              <span className="text-[10px] text-slate-400 mt-1 font-semibold">Landfill Prevented</span>
            </div>

            <div className="bg-white border border-slate-200/90 p-4 rounded-xl flex flex-col items-center justify-center shadow-sm">
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
