'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaConcierge } from '@/src/components/nova/useNovaPage';
import { BadgeCheck, BrainCircuit, HeartHandshake, Leaf, ArrowRight, Wallet, Banknote, ShieldAlert, Zap, Cpu, Wrench } from 'lucide-react';

const mockData = {
  headline: "I analyzed your 5 products. 5 need attention — about ₹8,630 recoverable and 229.2 kg CO₂ to save.",
  summary: {
    total_value_recovery: 8630,
    total_carbon_opportunity: 229.2,
    total_gc_opportunity: 1250,
    total_circular_score: 38
  },
  recommendations: [
    {
      id: "ord-1",
      action: "sell_now",
      headline: "Sell now: Sony WH-1000XM4 Headphones",
      confidence: 0.93,
      is_eol: false,
      impact: { value: 3400, carbon: 12, gc: 450, ces: 88 },
      icon: <Cpu className="w-5 h-5 text-sky-500" />,
      color: "sky",
      summary: "High current demand in hyperlocal market.",
      reasons: [
        { factor: "Idle time", detail: "Unused for 8 months", weight: "high" },
        { factor: "Depreciation", detail: "Drops to ~₹2,800 in 6 months", weight: "medium" }
      ],
      twin: { current_value: 3400, m6: 2800, window: "Right now" }
    },
    {
      id: "ord-2",
      action: "donate",
      headline: "Donate: Patagonia Down Sweater",
      confidence: 0.88,
      is_eol: false,
      impact: { value: 800, carbon: 4.5, gc: 300, ces: 92 },
      icon: <HeartHandshake className="w-5 h-5 text-emerald-500" />,
      color: "emerald",
      summary: "Low direct resale value, but strong NGO demand.",
      reasons: [
        { factor: "NGO demand", detail: "Active request from Winter Warmth drive", weight: "high" },
        { factor: "Tax + impact", detail: "Instant tax receipt of ₹800", weight: "high" }
      ],
      twin: { current_value: 800, m6: 750, window: "Seasonal" }
    },
    {
      id: "ord-3",
      action: "repair",
      headline: "Repair then sell: KitchenAid Artisan Mixer",
      confidence: 0.82,
      is_eol: false,
      impact: { value: 12000, carbon: 180, gc: 200, ces: 95 },
      icon: <Wrench className="w-5 h-5 text-amber-500" />,
      color: "amber",
      summary: "Minor fault reduces value by 40%. Repair is highly profitable.",
      reasons: [
        { factor: "Repair ROI", detail: "₹800 repair increases resale by ₹4,500", weight: "high" },
        { factor: "Carbon savings", detail: "Massive emissions saved vs buying new", weight: "high" }
      ],
      twin: { current_value: 7500, m6: 7200, window: "Post-repair" }
    },
    {
      id: "ord-4",
      action: "sell_now",
      headline: "Sell now: Amazon Kindle Paperwhite",
      confidence: 0.98,
      is_eol: true,
      impact: { value: 4300, carbon: 8.2, gc: 150, ces: 80 },
      icon: <Zap className="w-5 h-5 text-rose-500" />,
      color: "rose",
      summary: "Next-gen model rumor detected. Values dropping soon.",
      reasons: [
        { factor: "Market Event", detail: "New model release expected in 30 days", weight: "high" },
        { factor: "Depreciation", detail: "Value drops by 30% upon announcement", weight: "high" }
      ],
      twin: { current_value: 4300, m6: 2800, window: "URGENT: Before launch" }
    },
    {
      id: "ord-5",
      action: "sell_now",
      headline: "Sell now: Apple iPad Air (4th Gen)",
      confidence: 0.85,
      is_eol: false,
      impact: { value: 18000, carbon: 24.5, gc: 150, ces: 84 },
      icon: <BrainCircuit className="w-5 h-5 text-indigo-500" />,
      color: "indigo",
      summary: "Stable demand, but passing optimal resale window.",
      reasons: [
        { factor: "Twin forecast", detail: "Passing peak demand window", weight: "medium" },
        { factor: "Battery Health", detail: "Currently at 88%, dropping soon", weight: "medium" }
      ],
      twin: { current_value: 18000, m6: 15500, window: "Within 2 months" }
    }
  ]
};

const ACTION_COLORS: any = {
  sell_now: "bg-sky-50 text-sky-700 border-sky-200",
  donate: "bg-emerald-50 text-emerald-700 border-emerald-200",
  repair: "bg-amber-50 text-amber-700 border-amber-200",
  hold: "bg-slate-50 text-slate-700 border-slate-200",
};

export default function CircularConciergePage() {
  useNovaConcierge();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [listed, setListed] = useState<Record<string, boolean>>({});

  const handleList = (id: string) => {
    setListed(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-[#FADD57] text-slate-900 pt-16 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-slate-800 p-2 rounded-xl border border-slate-700 shadow-sm">
              <BrainCircuit className="w-6 h-6 text-[#FADD57]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Circular Concierge</h1>
          </div>
          <p className="text-xl text-slate-800 font-bold leading-relaxed max-w-2xl">
            {mockData.headline}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">Value Recovery</div>
            <div className="text-2xl font-black text-slate-900">₹{mockData.summary.total_value_recovery.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">Carbon Saved</div>
            <div className="text-2xl font-black text-emerald-600">{mockData.summary.total_carbon_opportunity} kg</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">Green Credits</div>
            <div className="text-2xl font-black text-sky-600">+{mockData.summary.total_gc_opportunity}</div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60">
            <div className="text-sm font-bold text-slate-500 mb-1">Circular Score</div>
            <div className="text-2xl font-black text-sky-600">+{mockData.summary.total_circular_score}</div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-[#007185]" /> Actionable Insights
          </h2>
          
          {mockData.recommendations.map(r => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all hover:border-slate-300">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-4">
                  <div className={`p-3 rounded-xl bg-${r.color}-50 border border-${r.color}-100 shrink-0`}>
                    {r.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-extrabold text-slate-900 text-lg">{r.headline}</h3>
                      {r.is_eol && (
                        <span className="bg-rose-100 text-rose-700 text-[10px] uppercase font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> EOL Alert
                        </span>
                      )}
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${ACTION_COLORS[r.action]}`}>
                        {Math.round(r.confidence * 100)}% Confident
                      </span>
                    </div>
                    <div className="text-sm text-slate-500 font-medium flex items-center gap-3">
                      <span>+₹{r.impact.value.toLocaleString()}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>{r.impact.carbon}kg CO₂</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300" />
                      <span>+{r.impact.gc} GC</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:w-auto w-full justify-between md:justify-end">
                  <button 
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Why?
                  </button>
                  {r.action === "sell_now" && (
                    <button 
                      onClick={() => handleList(r.id)}
                      disabled={listed[r.id]}
                      className={`px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
                        listed[r.id] 
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                          : 'bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734]'
                      }`}
                    >
                      {listed[r.id] ? "Listed ✓" : "List it"}
                    </button>
                  )}
                  {r.action === "donate" && (
                    <button className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all border border-emerald-200">
                      Donate
                    </button>
                  )}
                  {r.action === "repair" && (
                    <button className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all border border-amber-200">
                      Book Repair
                    </button>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {expanded === r.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 pt-0 border-t border-slate-100 mt-2 bg-slate-50/50">
                      <p className="text-sm text-slate-700 font-medium mt-4 mb-4">{r.summary}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {r.reasons.map((reason, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex items-start gap-3">
                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${reason.weight === 'high' ? 'bg-sky-500' : 'bg-slate-400'}`} />
                            <div>
                              <div className="text-xs font-black text-slate-900 uppercase tracking-wide">{reason.factor}</div>
                              <div className="text-sm text-slate-600 mt-0.5">{reason.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 flex items-center justify-between text-sm">
                        <div className="text-sky-900 flex items-center gap-2">
                          <BrainCircuit className="w-4 h-4 text-sky-500" />
                          <span className="font-bold">Digital Twin Forecast:</span>
                          <span className="font-medium">₹{r.twin.current_value} now</span>
                          <ArrowRight className="w-3 h-3 text-sky-400" />
                          <span className="font-medium">₹{r.twin.m6} in 6mo</span>
                        </div>
                        <div className="font-bold text-sky-700">
                          Window: {r.twin.window}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {listed[r.id] && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-emerald-50 px-5 py-3 border-t border-emerald-100 text-sm font-medium text-emerald-800 flex items-center justify-between"
                  >
                    <span>✓ Autonomous Resale Agent listed this item for ₹{r.impact.value.toLocaleString()}. 14 local buyers matched.</span>
                    <button className="font-bold hover:underline">View Listing →</button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
