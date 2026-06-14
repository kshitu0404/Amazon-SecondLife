'use client';

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { ShieldCheck, Leaf, Activity, Zap, TrendingDown, Clock, Target, Repeat, Star } from "lucide-react";

// Mock Data Source simulating the backend response
const MOCK_DATA = {
  order: {
    id: "o1", order_number: "ORDER #114-892314-23910", status: "returned", age_months: 14, purchase_price: 399,
    title: "Sony WH-1000XM4 Wireless Headphones", brand: "Sony", category: "Electronics", msrp: 399,
    image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
    embedded_carbon_kg: 18.5, eco_score: 88,
  },
  current_grade: "B",
  grade_label: "Good Condition",
  lifecycle_score: 82,
  ownership_count: 2,
  repair_count: 1,
  total_carbon_saved_kg: 18.5,
  ces: {
    score: 84,
    breakdown: { durability: 90, repairability: 85, recyclability: 80, circular_origin: 80 }
  },
  twin: {
    best_resale_window: "Now – +3 mo",
    recommendation: "Resell immediately. Depreciation accelerates rapidly after 18 months of age.",
    current_value: 240,
    forecast: { m3: 210, m6: 180, m12: 120 },
    curve: [ { month: 0, value: 240 }, { month: 3, value: 210 }, { month: 6, value: 180 }, { month: 12, value: 120 } ]
  },
  value_history: [
    { label: "MSRP", value: 399 },
    { label: "Paid", value: 399 },
    { label: "Now", value: 240 },
    { label: "+3 mo", value: 210 },
    { label: "+6 mo", value: 180 },
    { label: "+12 mo", value: 120 }
  ],
  buyer_matches: {
    routing: "local_node",
    matches: [
      { buyer_label: "Alex M.", location: "Seattle, WA", distance_miles: 15, match_score: 94, purchaseProbability: 88, outreachSuggestion: "Alex recently browsed similar headphones. Contextual bandit recommends push notification at 5 PM.", outreachChannel: "Push", outreachTiming: "5:00 PM", two_tower_similarity: 0.89, predicted_days_to_sale: 2, bandit_reward_lift: 15 },
      { buyer_label: "Sam T.", location: "Portland, OR", distance_miles: 145, match_score: 85, purchaseProbability: 62, outreachSuggestion: "Sam bought a Sony speaker last month. Recommend cross-sell email.", outreachChannel: "Email", outreachTiming: "10:00 AM", two_tower_similarity: 0.78, predicted_days_to_sale: 5, bandit_reward_lift: 8 },
    ]
  },
  story: [
    { title: "Manufactured", icon: "🏭", actor: "Sony Corp", date: "Jan 15, 2024", detail: "Produced in ISO-14001 facility" },
    { title: "First purchased", icon: "🛒", actor: "You", date: "Apr 01, 2024", detail: "Brand new purchase" },
    { title: "Repaired", icon: "🔧", actor: "Amazon Certified Tech", date: "Feb 10, 2025", detail: "Replaced earpads" },
    { title: "AI-inspected", icon: "🔍", actor: "Vision AI", date: "Jun 01, 2025", detail: "Graded B (Good Condition)" }
  ]
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 shadow-lg rounded-lg px-3 py-2 text-xs font-bold text-slate-800">
        <div>{label}</div>
        <div className="text-emerald-600">₹{payload[0].value}</div>
      </div>
    );
  }
  return null;
};

export default function DigitalProductPassport() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In a real app, we'd fetch based on 'id'. Using mock for demo.
    setTimeout(() => {
      setData(MOCK_DATA);
    }, 400);
  }, [id]);

  if (!data) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 pb-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amazon-orange rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Loading Passport...</span>
        </div>
      </div>
    );
  }

  const { order: p, ces, twin, buyer_matches, story } = data;

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      <div className="w-full space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 font-bold">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded shadow-sm flex items-center gap-1 uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" /> Digital Product Passport
          </span>
          <span>{p.order_number}</span>
        </div>

        {/* Hero Product Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="h-32 w-32 shrink-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2">
            <img src={p.image_url} alt="" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-black text-slate-900 leading-tight">{p.brand} {p.title}</h1>
            <div className="mt-1 text-sm font-bold text-slate-500">
              {p.category} · MSRP ₹{p.msrp} · Eco Score {p.eco_score}/100
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {data.current_grade && (
                <div className="bg-sky-50 text-sky-700 border border-sky-200 font-bold px-3 py-1 rounded shadow-sm text-sm flex items-center gap-1.5">
                  <Star className="w-4 h-4" /> {data.grade_label} (Grade {data.current_grade})
                </div>
              )}
              <div className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-3 py-1 rounded shadow-sm text-sm flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-500" /> Embedded Carbon: {p.embedded_carbon_kg} kg CO₂
              </div>
            </div>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Lifecycle Score</div>
            <div className="text-2xl font-black text-emerald-600">{data.lifecycle_score}/100</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Owners</div>
            <div className="text-2xl font-black text-slate-900">{data.ownership_count}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">Repairs</div>
            <div className="text-2xl font-black text-slate-900">{data.repair_count}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm text-center">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-1">CO₂ Saved</div>
            <div className="text-2xl font-black text-emerald-600">{data.total_carbon_saved_kg} kg</div>
          </div>
        </div>

        {/* Circular Economy Score (CES) */}
        {ces && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Repeat className="w-5 h-5 text-emerald-500" /> Circular Economy Score
              </h3>
              <span className="text-3xl font-black text-emerald-600">{ces.score}/100</span>
            </div>
            
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
              {Object.entries(ces.breakdown).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-xs">
                  <div className="text-xl font-black text-slate-900">{v as React.ReactNode}</div>
                  <div className="text-slate-500 font-bold uppercase tracking-wider mt-1">{k.replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100 border border-slate-200 shadow-inner">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${ces.score}%` }} />
            </div>
          </div>
        )}

        {/* Product Twin & Value History */}
        <div className="grid gap-6 lg:grid-cols-2">
          {twin && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-sky-600" /> Product Twin Forecast
                </h3>
                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded shadow-sm text-[10px] font-extrabold uppercase tracking-wider">
                  Best Window: {twin.best_resale_window}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-500 mb-6">{twin.recommendation}</p>
              
              <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={twin.curve} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickFormatter={(m) => `+${m}mo`} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v}`} tickLine={false} axisLine={false} width={40} />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><div className="font-black text-slate-900">₹{twin.current_value}</div><div className="text-xs font-bold text-slate-500 uppercase">Now</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><div className="font-black text-slate-900">₹{twin.forecast.m6}</div><div className="text-xs font-bold text-slate-500 uppercase">+6 mo</div></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><div className="font-black text-slate-900">₹{twin.forecast.m12}</div><div className="text-xs font-bold text-slate-500 uppercase">+12 mo</div></div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="font-black text-slate-900 flex items-center gap-2 mb-6">
              <TrendingDown className="w-5 h-5 text-rose-500" /> Value History
            </h3>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.value_history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${v}`} tickLine={false} axisLine={false} width={40} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Buyer Match Engine */}
        {buyer_matches && buyer_matches.matches && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-amazon-orange" /> AI Buyer Match Engine (NBOE)
                </h3>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  Two-Tower neural retrieval over live buyer database. Proximity routing: <b className="text-sky-600 capitalize">{buyer_matches.routing.replace("_", " ")}</b>
                </p>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 shadow-xs">
                <div>
                  <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider mb-0.5">Holding Time</span>
                  <span className="text-emerald-600 font-black text-sm">8 days</span> <span className="text-[10px] text-slate-400 font-bold">(was 45d)</span>
                </div>
                <div className="border-l border-slate-200 h-8"></div>
                <div>
                  <span className="text-slate-400 font-extrabold block text-[9px] uppercase tracking-wider mb-0.5">Resale Rate</span>
                  <span className="text-emerald-600 font-black text-sm">72%</span> <span className="text-[10px] text-slate-400 font-bold">(was 40%)</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {buyer_matches.matches.map((m: any, i: number) => (
                <div key={i} className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-900">{m.buyer_label}</span>
                      <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                        {m.match_score}% Match
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-slate-400" /> {m.location} · {m.distance_miles} miles
                    </div>
                    <div className="text-xs text-slate-700 font-medium italic bg-slate-50 rounded-lg p-3 border border-slate-100">
                      "{m.outreachSuggestion}"
                    </div>

                    <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 font-bold leading-relaxed shadow-xs">
                      <span className="block mb-0.5 text-amber-600 uppercase tracking-wider font-extrabold">Bandit Scheduling Recommendation:</span>
                      Send via {m.outreachChannel} @ {m.outreachTiming} <span className="text-emerald-600">(+{m.bandit_reward_lift}% expected CTR lift)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 p-3 flex flex-col gap-1.5 text-[10px] text-slate-500 font-bold">
                    <div className="flex items-center justify-between">
                      <span>⚡ Purchase Prob: <span className="text-slate-900 font-black">{m.purchaseProbability}%</span></span>
                      <span>⏱ Days-to-Sale: <span className="text-slate-900 font-black">~{m.predicted_days_to_sale} days</span></span>
                    </div>
                    <div className="text-right text-slate-400 font-mono">
                      Embedding Sim: {m.two_tower_similarity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lifecycle Story */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-amazon-orange" /> Traceability Story
          </h3>
          <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
            {story.map((s: any, i: number) => (
              <div key={i} className="relative pl-6">
                <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-sm shadow-sm">
                  {s.icon}
                </div>
                <div>
                  <div className="font-black text-slate-900">{s.title}</div>
                  <div className="text-xs font-bold text-slate-500 mt-0.5">{s.date} · {s.actor}</div>
                  <div className="text-sm font-medium text-slate-600 mt-1">{s.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
