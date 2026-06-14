'use client';

import React, { useEffect, useState } from "react";
import { ShieldCheck, RefreshCw, Zap, TrendingUp, HandHeart, CheckCircle, Search, Settings, Star, Activity } from "lucide-react";

const STAGES = [
  { id: "rip", label: "Analyzing Inventory...", description: "Return Intent Predictor running risk diagnostics" },
  { id: "rde", label: "Evaluating Condition...", description: "Refurbishment pathways & circular grade assessment" },
  { id: "nboe", label: "Finding Best Owner...", description: "Next Best Owner Engine matching with high-propensity buyers" },
  { id: "dcpe", label: "Calculating Price...", description: "Dynamic Pricing Engine mapping regional markdown schedules" },
  { id: "lag", label: "Publishing Listing...", description: "Generating listing copy and digital passport update" },
  { id: "repricer", label: "Monitoring Demand...", description: "Activating autonomous auto-repricer loop" }
];

export default function AraTab() {
  const [enabled, setEnabled] = useState(true);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [activeResale, setActiveResale] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [listData, setListData] = useState<any>(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ara/suggestions');
      const data = await res.json();
      setSuggestions(data.suggestions || []);

      const actRes = await fetch('/api/ara/activity');
      const actData = await actRes.json();
      setActivity(actData.activity || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (!activeResale) {
      setCurrentStep(0);
      setShowSuccess(false);
      return;
    }

    // Trigger API call for the autonomous listing
    fetch('/api/ara/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: activeResale.order_id })
    }).then(res => res.json()).then(data => setListData(data));

    let step = 0;
    setCurrentStep(0);
    setShowSuccess(false);

    const interval = setInterval(() => {
      step += 1;
      if (step < STAGES.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => setShowSuccess(true), 800);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [activeResale]);

  useEffect(() => {
    if (activeResale && showSuccess && listData) {
      try {
        const currentListings = JSON.parse(localStorage.getItem('ara_listings') || '[]');
        // Avoid duplicate saves
        if (!currentListings.find((l: any) => l.araId === activeResale.order_id)) {
          const newListing = {
            id: 'ara-' + Date.now(),
            araId: activeResale.order_id,
            name: activeResale.product.title,
            category: activeResale.product.category,
            originalPrice: activeResale.product.msrp,
            resalePrice: listData.listing.price || activeResale.estimated_value,
            condition: 'good',
            conditionNotes: 'AI certified pre-owned',
            image: activeResale.product.image_url,
            sellerName: 'You (Trader)',
            co2SavedKg: activeResale.projected_carbon_kg || 25,
            healthCard: { cosmeticScore: 9, batteryHealth: 100, warrantyStatus: 'Certified ARA' }
          };
          localStorage.setItem('ara_listings', JSON.stringify([newListing, ...currentListings]));
        }
      } catch (e) {
        console.error("Failed to save listing locally", e);
      }
    }
  }, [showSuccess, activeResale, listData]);

  const removeListing = () => {
    if (activeResale) {
      setSuggestions(prev => prev.filter(s => s.order_id !== activeResale.order_id));
      setActiveResale(null);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "sell_now": return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider">Sell Now</span>;
      case "donate": return <span className="bg-sky-50 text-sky-600 border border-sky-200 px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider">Donate</span>;
      case "hold": return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider">Hold</span>;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-left">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-2 border-b border-slate-100 pb-5">
          <span className="bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-500" />
            Autonomous Resale Agent
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your closet is a passive income engine.
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed font-medium">
            The agent scans your owned inventory, forecasts each item's value with its Digital Twin, and recommends actions — then lists items for you on approval to maximize financial yield and circular utility.
          </p>
        </div>

        {/* Global Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex flex-col gap-1">
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <Zap className={`w-5 h-5 ${enabled ? 'text-amazon-orange' : 'text-slate-400'}`} />
              Auto Resale Agent Daemon
            </div>
            <div className="text-xs font-semibold text-slate-500">
              {enabled ? "Enabled — actively monitoring your Amazon purchase history." : "Disabled — agent is sleeping."}
            </div>
          </div>
          <button 
            onClick={() => setEnabled(!enabled)}
            className={`relative w-14 h-8 rounded-full transition-colors duration-300 shadow-inner ${enabled ? "bg-emerald-500" : "bg-slate-300"}`}
          >
            <span className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all duration-300 ${enabled ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {/* Agent Activity Feed */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-500" />
            Recent Agent Activity
          </h2>
          {activity.length === 0 ? (
             <p className="text-sm text-slate-400">No recent autonomous actions.</p>
          ) : (
            <div className="space-y-0">
              {activity.map((act, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
                  <div className="flex flex-col">
                    <span className="text-slate-800 font-bold text-sm">
                      <span className="capitalize text-slate-900">{act.action}</span> · {act.product}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{act.time}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {act.price > 0 && <span className="text-emerald-600 font-black text-sm">${act.price}</span>}
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-1 ${
                      act.action === 'donated' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                      act.action === 'repriced' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                      'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    }`}>
                      {act.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory Suggestions */}
        <div className="mt-4">
          <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400" />
            Inventory Action Queue
          </h2>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 border border-slate-100 rounded-xl bg-slate-50">
              <RefreshCw className="w-8 h-8 text-slate-300 animate-spin" />
              <p className="text-sm text-slate-500 font-bold">Scanning Digital Twins...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 border border-slate-100 rounded-xl bg-slate-50">
              <ShieldCheck className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-500 font-bold">Your inventory is optimized. No pending actions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {suggestions.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  
                  {/* Card Header & Image */}
                  <div className="flex gap-4 p-4 border-b border-slate-100 bg-slate-50">
                    <img src={item.product.image_url} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-white" />
                    <div className="flex flex-col justify-center min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 truncate">{item.product.title}</h3>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 truncate">{item.product.brand} · {item.product.size || "Standard"}</div>
                      <div className="text-xs font-black text-slate-900 mt-1">MSRP: ${item.product.msrp}</div>
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 flex-1 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Suggested Action</div>
                      {getActionBadge(item.action)}
                    </div>

                    <div className="text-sm text-slate-700 font-medium leading-snug">
                      "{item.reason}"
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mt-auto grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-slate-500 font-bold mb-0.5">Est. Value</div>
                        <div className="text-slate-900 font-black text-sm">${item.estimated_value}</div>
                      </div>
                      <div>
                        <div className="text-slate-500 font-bold mb-0.5">Likelihood</div>
                        <div className="text-slate-900 font-black text-sm">{item.resale_probability}% match</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-4 pt-0">
                    <button 
                      onClick={() => setActiveResale(item)}
                      disabled={item.action === "hold" || !enabled}
                      className={`w-full py-2.5 rounded-lg text-sm font-extrabold transition-colors shadow-sm ${
                        !enabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                        item.action === "sell_now" ? "bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734] active:bg-[#f0c14b]" :
                        item.action === "donate" ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200" :
                        "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      }`}
                    >
                      {item.action === "sell_now" ? "Approve & List Automatically" : 
                       item.action === "donate" ? "Approve Donation Routing" : "Monitoring Value"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ARA Listing Optimization Modal Overlay */}
      {activeResale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            
            {!showSuccess ? (
              // Step Progress View
              <div className="p-8 flex flex-col justify-center items-center">
                <div className="w-16 h-16 shrink-0 rounded-full bg-slate-50 border-4 border-amazon-orange border-t-transparent animate-spin mb-6" />
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 text-center">Optimizing Circular Resale...</h3>
                <p className="text-sm text-slate-500 font-medium text-center max-w-xs mb-8">
                  The Autonomous Agent is brokering the best possible outcome for your item.
                </p>

                <div className="w-full max-w-sm space-y-4">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    const isPending = idx > currentStep;

                    return (
                      <div key={stage.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : isActive ? (
                            <div className="w-5 h-5 rounded-full border-2 border-amazon-orange border-t-transparent animate-spin" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200" />
                          )}
                        </div>
                        <div>
                          <div className={`text-sm font-bold ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                            {stage.label}
                          </div>
                          {(isActive || isCompleted) && (
                            <div className={`text-xs mt-0.5 ${isActive ? 'text-slate-600' : 'text-slate-400 line-through'}`}>
                              {stage.description}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // Success View showing digital twin and metrics
              <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
                
                <div className="text-center space-y-2 mt-2">
                  <div className="mx-auto w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Listing Active & Protected!</h3>
                  <p className="text-xs font-semibold text-slate-500">Autonomous optimization sequence completed successfully.</p>
                </div>

                {/* Product Summary */}
                <div className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm items-center">
                  <img src={activeResale.product?.image_url} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200 bg-white shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-900 truncate text-sm">{activeResale.product?.title}</div>
                    <div className="text-xs text-slate-500 font-medium">MSRP: ${activeResale.product?.msrp} · Size: {listData?.listing?.size || "Standard"}</div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-emerald-600 font-black text-xl">${listData?.listing?.price || activeResale.estimated_value}</div>
                      <div className="bg-amber-100 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                        Expected Sale: {listData?.pricing?.expected_sale_time_days || 5} Days
                      </div>
                    </div>
                  </div>
                </div>

                {/* Engine Summaries */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Return Intent</div>
                    <div className="text-sm font-black text-emerald-600">Low Risk Profile</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">Verified pristine history</div>
                  </div>
                  <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex flex-col justify-center">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Next Best Owner</div>
                    <div className="text-sm font-black text-slate-900">{listData?.buyer_matches?.count || 14} Local Matches</div>
                    <div className="text-xs text-slate-500 font-medium mt-1">Highest prop: {listData?.buyer_matches?.topMatch?.probability || 88}%</div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="bg-slate-50 -mx-6 -mb-6 p-5 border-t border-slate-200 mt-2">
                  <button 
                    onClick={removeListing}
                    className="w-full py-3.5 rounded-xl font-extrabold text-sm transition-colors shadow-sm bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734] active:scale-[0.98]"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}
    </div>
  );
}
