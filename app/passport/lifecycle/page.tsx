'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getLifecycleData } from './actions';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, QrCode, ShieldCheck, Leaf, DollarSign, Clock, 
  MapPin, CheckCircle2, Factory, Search, Wrench, 
  Tag, ShoppingBag, Battery, PackageSearch, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

const STAGES = [
  {
    id: 1,
    title: "Return Initiated",
    icon: <MapPin className="w-5 h-5 text-sky-400" />,
    color: "sky",
    time: "Oct 12, 10:45 AM",
    details: [
      { label: "Reason", value: "No longer needed" },
      { label: "Location", value: "Seattle, WA" },
      { label: "Order ID", value: "114-892314-23910" }
    ]
  },
  {
    id: 2,
    title: "Fulfillment Center Received",
    icon: <Factory className="w-5 h-5 text-indigo-400" />,
    color: "indigo",
    time: "Oct 14, 02:30 PM",
    details: [
      { label: "Location", value: "BFI4 Warehouse, Kent" },
      { label: "Processing Status", value: "Routed to inspection" }
    ]
  },
  {
    id: 3,
    title: "AI Inspection Complete",
    icon: <Search className="w-5 h-5 text-purple-400" />,
    color: "purple",
    time: "Oct 14, 03:15 PM",
    details: [
      { label: "Battery Health", value: "92%" },
      { label: "Cosmetics", value: "Minor scratches detected" },
      { label: "Accessories", value: "Complete in box" },
      { label: "Final Grade", value: "Grade B (Good)" },
      { label: "AI Confidence", value: "87%" }
    ]
  },
  {
    id: 4,
    title: "Fraud Check Complete",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    color: "emerald",
    time: "Oct 14, 03:16 PM",
    details: [
      { label: "Serial Number", value: "Verified match" },
      { label: "Product Swap", value: "No swap detected" },
      { label: "Warranty Status", value: "Valid, no fraud" }
    ]
  },
  {
    id: 5,
    title: "Refurbishment Complete",
    icon: <Wrench className="w-5 h-5 text-amber-400" />,
    color: "amber",
    time: "Oct 15, 09:00 AM",
    details: [
      { label: "Action 1", value: "Screen cleaned" },
      { label: "Action 2", value: "Battery recalibrated" },
      { label: "Action 3", value: "Minor scratch polished" },
      { label: "Time Spent", value: "24 minutes" },
      { label: "Cost", value: "₹450" }
    ]
  },
  {
    id: 6,
    title: "Marketplace Re-listed",
    icon: <Tag className="w-5 h-5 text-blue-400" />,
    color: "blue",
    time: "Oct 15, 11:30 AM",
    details: [
      { label: "AI Rec. Price", value: "₹13,800" },
      { label: "Demand Score", value: "High (94/100)" },
      { label: "Est. Resale Time", value: "4 days" }
    ]
  },
  {
    id: 7,
    title: "Sold to New Buyer",
    icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
    color: "emerald",
    time: "Oct 17, 04:20 PM",
    details: [
      { label: "Buyer Location", value: "Portland, OR" },
      { label: "Final Sale Price", value: "₹13,800" },
      { label: "Delivery", value: "Completed successfully" }
    ]
  },
  {
    id: 8,
    title: "Lifecycle Complete",
    icon: <CheckCircle2 className="w-5 h-5 text-amazon-orange" />,
    color: "orange",
    time: "Oct 19, 10:00 AM",
    details: [
      { label: "Journey Status", value: "Closed" },
      { label: "Total Time", value: "7 days" }
    ]
  }
];

export default function LifecycleCardPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center text-slate-500 font-bold">Loading Lifecycle Data...</div>}>
      <LifecycleCardContent />
    </Suspense>
  );
}

function LifecycleCardContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [data, setData] = useState<any>(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    getLifecycleData(id || undefined).then(res => {
      if (res) setData(res);
    });
  }, [id]);

  // Auto-play timeline animation
  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      setActiveStage(prev => (prev < STAGES.length ? prev + 1 : prev));
    }, 1200);
    return () => clearInterval(timer);
  }, [data]);

  if (!data) return <div className="p-20 text-center text-slate-500 font-bold">Loading product lifecycle...</div>;

  return (
    <div className="min-h-screen pb-20 text-slate-900 font-sans">
      
      {/* Yellow Brand Header */}
      <div className="bg-[#FADD57] text-slate-900 pt-12 pb-24 px-6 border-b border-[#EBCF45] relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/health-card" className="hover:text-amazon-orange transition flex items-center gap-1 font-bold text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Health Card
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold bg-white/50 border border-slate-900/10 px-3 py-1.5 rounded-full text-emerald-700 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Tracking Active
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest block">Digital Product Passport</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-3">
            Lifecycle Timeline
          </h1>
          <p className="text-lg font-medium opacity-80 max-w-2xl">
            Trace the complete history of this certified pre-owned product, from its initial return to its second life.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 space-y-8">
        
        {/* Top Product Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm overflow-hidden"
        >
          {/* Decorative glowing orb */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] pointer-events-none" />
          
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl shrink-0 backdrop-blur-sm">
            <img 
              src={data.productImage}
              alt="Product" 
              className="w-32 h-32 object-contain filter drop-shadow-lg"
            />
          </div>

          <div className="flex-1 w-full relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">Lifecycle Identity Card</div>
                <h2 className="text-3xl font-black text-slate-900 leading-tight mb-2">{data.productName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded shadow-sm text-sm font-bold flex items-center gap-1.5">
                    Grade {data.grade}
                  </span>
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-3 py-1 rounded shadow-sm text-sm font-bold flex items-center gap-1.5">
                    Refurbished / {data.condition.split(',')[0] || "Good"}
                  </span>
                  <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded shadow-sm text-sm font-bold font-mono">
                    ID: {data.id.split('-').pop()}
                  </span>
                </div>
              </div>
              <div className="hidden lg:block bg-white p-2 rounded-lg shrink-0">
                <QrCode className="w-16 h-16 text-slate-900" />
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Side: Animated Vertical Timeline */}
          <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-slate-400" /> Complete Second-Life Journey
            </h3>
            
            <div className="relative pl-6 space-y-12">
              {/* Vertical line connecting nodes */}
              <div className="absolute top-2 bottom-2 left-[31px] w-0.5 bg-slate-800" />

              {STAGES.map((stage, index) => {
                const isActive = index < activeStage;
                const isCurrent = index === activeStage - 1;

                return (
                  <motion.div 
                    key={stage.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: isActive ? 1 : 0.3, x: isActive ? 0 : -10 }}
                    transition={{ duration: 0.5 }}
                    className={`relative z-10 flex gap-6 ${isActive ? 'grayscale-0' : 'grayscale'}`}
                  >
                    {/* Node Icon */}
                    <div className="shrink-0 relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-lg transition-colors duration-500 ${
                        isActive 
                          ? `bg-white border-${stage.color}-400 shadow-${stage.color}-500/20` 
                          : 'bg-slate-100 border-slate-300'
                      }`}>
                        {stage.icon}
                      </div>
                      {/* Pulse effect for current stage */}
                      {isCurrent && (
                        <div className={`absolute inset-0 rounded-full bg-${stage.color}-400/20 animate-ping`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-lg font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                          {stage.title}
                        </h4>
                        <span className="text-xs font-mono text-slate-500">{stage.time}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mt-3">
                        {stage.details.map((detail, idx) => (
                          <div key={idx} className={`text-sm ${isActive ? 'text-slate-600' : 'text-slate-400'}`}>
                            <span className="font-bold text-slate-500 mr-2">{detail.label}:</span>
                            <span className={isActive ? 'text-slate-900 font-medium' : ''}>{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Right Side: Sustainability & Certification */}
          <section className="space-y-6">
            
            {/* Sustainability Impact Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Leaf className="w-32 h-32 text-emerald-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" /> Sustainability Impact
              </h3>
              
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-500">CO₂ Prevented</div>
                  </div>
                  <div className="text-xl font-black text-slate-900">1.2 <span className="text-sm text-emerald-600">kg</span></div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-500">Waste Prevented</div>
                  </div>
                  <div className="text-xl font-black text-slate-900">0.8 <span className="text-sm text-sky-600">Liters</span></div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-600">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-500">Value Recovered</div>
                  </div>
                  <div className="text-xl font-black text-slate-900"><span className="text-sm text-amber-600">₹</span>13,800</div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-600">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-500">Time to Resell</div>
                  </div>
                  <div className="text-xl font-black text-slate-900">7 <span className="text-sm text-purple-600">Days</span></div>
                </div>
              </div>
            </div>

            {/* Certification Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" /> Digital Certificates
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-100 text-sm">AI Inspection Verified</div>
                    <div className="text-xs text-emerald-400/70 mt-0.5">Condition graded accurately by Vision AI</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-100 text-sm">Fraud Screening Passed</div>
                    <div className="text-xs text-emerald-400/70 mt-0.5">Verified authenticity and serial match</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-100 text-sm">Climate Pledge Compliant</div>
                    <div className="text-xs text-emerald-400/70 mt-0.5">Zero-landfill circular routing used</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-100 text-sm">Independent Verification</div>
                    <div className="text-xs text-emerald-400/70 mt-0.5">Third-party audit log finalized</div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}
