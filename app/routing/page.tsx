'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck, RotateCcw, Users, Wrench, Heart, Trash2, ShieldCheck, DollarSign, Leaf, Sparkles, RefreshCw, BarChart } from 'lucide-react';
import { Product, RoutingType } from '@/types';
import { getActiveProduct, formatPrice } from '@/lib/utils';
import { mockProducts } from '@/data/mockProducts';

export default function RoutingPage() {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  // Load the active product (from upload or fallback)
  useEffect(() => {
    setProduct(getActiveProduct());
  }, []);

  if (!product) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Running routing solver algorithms...</p>
        </div>
      </div>
    );
  }

  const { routing, name, image, category } = product;

  // The 5 potential routes configuration
  const routesConfig = [
    {
      key: 'relist' as RoutingType,
      label: 'Relist As-Is',
      description: 'Sell directly on SecondLife marketplace at minor discount. Best for high-grade visual returns.',
      icon: RotateCcw,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      fillColor: 'emerald',
      baseRecovery: '70% - 90%',
    },
    {
      key: 'peer_exchange' as RoutingType,
      label: 'Peer Exchange',
      description: 'Swap directly with other community members. Ideal for outgrown apparel or books.',
      icon: Users,
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      fillColor: 'teal',
      baseRecovery: '60% - 75%',
    },
    {
      key: 'refurbishment' as RoutingType,
      label: 'Refurbishment',
      description: 'Repair components, sterilize, and repackage. Necessary for minor electronic or kitchen defects.',
      icon: Wrench,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      fillColor: 'amber',
      baseRecovery: '50% - 70%',
    },
    {
      key: 'donation' as RoutingType,
      label: 'Donation',
      description: 'Distribute to non-profit shelter networks. Yields circular tax write-off credits.',
      icon: Heart,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      fillColor: 'sky',
      baseRecovery: 'Tax Credit',
    },
    {
      key: 'recycling' as RoutingType,
      label: 'Recycling',
      description: 'Dismantle for raw copper, silver, and plastic. Standard salvage path for unrepairable items.',
      icon: Trash2,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      fillColor: 'orange',
      baseRecovery: 'Salvage Value',
    },
  ];

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-block mb-1">
            <Truck className="w-3.5 h-3.5 inline mr-1" /> Smart Logistics Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Smart Routing Dashboard
          </h1>
        </div>
        
        {/* Dropdown to switch items */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-500 font-extrabold uppercase">Inspect Item:</span>
          <select
            value={product.id}
            onChange={(e) => {
              const selectedId = e.target.value;
              const found = mockProducts.find((p) => p.id === selectedId);
              if (found) {
                setProduct(found);
              }
            }}
            className="border border-slate-300 text-xs font-bold rounded-lg px-3 py-2 bg-white text-slate-700 outline-none cursor-pointer focus:border-amazon-orange"
          >
            {mockProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.length > 35 ? `${p.name.substring(0, 35)}...` : p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Selected route highlight details */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Main Selected Route Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="font-extrabold text-base text-slate-900">Selected Recovery Route</h3>
              <span className="bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 font-bold text-xs uppercase py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-4 h-4" /> AI Verified Route
              </span>
            </div>

            {/* Large Route Card */}
            {(() => {
              const activeRouteConfig = routesConfig.find((r) => r.key === routing.route) || routesConfig[0];
              const IconComp = activeRouteConfig.icon;
              return (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-250 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 flex items-center justify-center shrink-0">
                    <IconComp className="w-7 h-7" />
                  </div>
                  <div className="text-center sm:text-left leading-normal space-y-1.5">
                    <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">AI RECOMMENDED</span>
                    <h4 className="text-xl font-black text-slate-900">{activeRouteConfig.label}</h4>
                    <p className="text-xs text-slate-600 max-w-md">{activeRouteConfig.description}</p>
                  </div>
                </div>
              );
            })()}

            {/* Reasoning text */}
            <div className="space-y-2 text-left">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Decision Rationale</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-250 font-bold">
                {routing.reasoning}
              </p>
            </div>

            {/* Routing metrics details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-200 pt-5">
              <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-250 shadow-sm">
                <p className="text-xs text-slate-500 font-extrabold uppercase">Expected Recovery</p>
                <span className="text-lg font-black text-slate-900 tracking-tight block mt-1.5">
                  {formatPrice(routing.expectedRecoveryValue)}
                </span>
                <span className="text-[10px] text-[#10b981] font-bold">Value Restored</span>
              </div>

              <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-250 shadow-sm">
                <p className="text-xs text-slate-500 font-extrabold uppercase">Estimated Savings</p>
                <span className="text-lg font-black text-slate-900 tracking-tight block mt-1.5">
                  {formatPrice(routing.costSavings)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">Logistics Avoided</span>
              </div>

              <div className="text-left bg-slate-50 p-3 rounded-lg border border-slate-250 shadow-sm">
                <p className="text-xs text-slate-500 font-extrabold uppercase">Routing Confidence</p>
                <span className="text-lg font-black text-slate-900 tracking-tight block mt-1.5">
                  {routing.confidenceLevel}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold">System Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Comparison of all routes checklist */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <BarChart className="w-5 h-5 text-amazon-orange" /> Comparative Route Audit
            </h3>

            {/* List of 5 routes */}
            <div className="space-y-3">
              {routesConfig.map((route) => {
                const isSelected = routing.route === route.key;
                const IconComp = route.icon;

                return (
                  <div
                    key={route.key}
                    className={`flex items-start gap-3.5 p-3 rounded-xl border transition duration-200 ${
                      isSelected
                        ? 'bg-emerald-50 border-[#10b981] shadow-sm'
                        : 'bg-slate-50 border-slate-250 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Tick box or check index */}
                    <div
                      className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center border text-[10px] font-black mt-1 ${
                        isSelected
                          ? 'bg-[#10b981] border-[#10b981] text-white'
                          : 'border-slate-300 text-slate-400'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>

                    <div className="text-left flex-grow space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-slate-800">{route.label}</span>
                        <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase">
                          Rec: {route.baseRecovery}
                        </span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-600 font-medium">{route.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick CTA to Health card or Marketplace */}
          <div className="bg-amazon-secondary text-white rounded-xl p-5 border border-slate-700 shadow-sm space-y-3.5">
            <h4 className="font-bold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-4 h-4 fill-amber-400/20" /> Circular Hub Logistics
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Once routing is locked, shipping labels are generated automatically. 
              Items rerouted to Refurbishment or Relisting are instantly logged 
              into our Circular Marketplace.
            </p>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
              <Link href="/marketplace" className="text-white hover:underline font-bold">
                Go to Marketplace
              </Link>
              <Link href="/health-card" className="text-amber-400 hover:underline flex items-center gap-0.5">
                Check Product passport <Truck className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
