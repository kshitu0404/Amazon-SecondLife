'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, ShieldCheck, Battery, RefreshCw, BarChart2, Star, DollarSign, QrCode, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { getActiveProduct, formatPrice, getConditionColorClass, getConditionLabel } from '@/lib/utils';

export default function HealthCardPage() {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-[#ff9900] animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Generating Passport Ledgers...</p>
        </div>
      </div>
    }>
      <HealthCardContent />
    </React.Suspense>
  );
}

function HealthCardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  // Load product based on query param '?id=...' or from localStorage fallback
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const found = mockProducts.find((p) => p.id === id);
      if (found) {
        setProduct(found);
        return;
      }
    }
    setProduct(getActiveProduct());
  }, [searchParams]);

  if (!product) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Generating Passport Ledgers...</p>
        </div>
      </div>
    );
  }

  const { healthCard, name, image, condition, category } = product;

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Header with Selector */}
        <div className="mb-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="bg-[#ff9900]/10 text-[#ff9900] border border-[#ff9900]/20 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-block mb-1">
            ♻ Digital Product Passport (DPP)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Circular Product Passport
          </h1>
        </div>

        {/* Directory drop-down for mock products */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-slate-500 font-extrabold uppercase">Passport Directory:</span>
          <select
            value={product.id}
            onChange={(e) => {
              const selectedId = e.target.value;
              router.push(`/health-card?id=${selectedId}`);
            }}
            className="border border-slate-300 text-xs font-bold rounded-lg px-3 py-2 bg-white text-slate-700 outline-none cursor-pointer focus:border-[#ff9900]"
          >
            <optgroup label="Uploaded Items">
              {product.id.startsWith('prod-17') && (
                <option value={product.id}>{product.name} (Uploaded)</option>
              )}
            </optgroup>
            <optgroup label="Marketplace Catalogue">
              {mockProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name.length > 35 ? `${p.name.substring(0, 35)}...` : p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Main Passport Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Product passport card */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Card header */}
          <div className="bg-[#131921] text-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase font-extrabold text-[#10b981] tracking-wider">
                Category: {category}
              </span>
              <h2 className="text-lg font-bold leading-tight">{name}</h2>
              <p className="text-xs text-slate-400">Owner Ledger: {product.sellerName || 'Anonymous'}</p>
            </div>
            
            <div className="shrink-0 flex items-center gap-2.5 bg-[#232f3e] px-4 py-2 rounded-xl border border-slate-700">
              <QrCode className="w-10 h-10 text-white" />
              <div className="text-xs text-slate-300 font-extrabold leading-normal">
                <p>SCAN PASSPORT</p>
                <p className="text-[#10b981]">REG# 84-SEC-LIFE</p>
              </div>
            </div>
          </div>

          {/* Card Body - Grid of Stats */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 border-b border-slate-200">
            {/* Metric 1: Cosmetic Rating */}
            <div className="bg-slate-50 border border-slate-250 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                Cosmetic Grade
              </span>
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <path
                    className="text-slate-200"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${healthCard.cosmeticScore * 10}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-xl font-black text-slate-900">{healthCard.cosmeticScore}</span>
                  <span className="text-[10px] text-slate-500 block font-bold leading-none">/10</span>
                </div>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border uppercase mt-3 ${getConditionColorClass(condition)}`}>
                {getConditionLabel(condition)}
              </span>
            </div>

            {/* Metric 2: Battery Health (or circular impact) */}
            <div className="bg-slate-50 border border-slate-250 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                {healthCard.batteryHealth !== null ? 'Battery Capacity' : 'Sustainability Rating'}
              </span>
              
              {healthCard.batteryHealth !== null ? (
                <div className="flex flex-col items-center justify-center w-full">
                  <div className="relative w-16 h-8 border-2 border-slate-400 rounded p-0.5 flex items-center">
                    <div
                      className={`h-full rounded-sm ${
                        healthCard.batteryHealth > 90 ? 'bg-emerald-500' : healthCard.batteryHealth > 80 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${healthCard.batteryHealth}%` }}
                    />
                    <div className="absolute -right-2 w-1.5 h-3 bg-slate-400 rounded-r" />
                  </div>
                  <span className="text-xl font-black text-slate-900 mt-4 leading-none">
                    {healthCard.batteryHealth}%
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">Remaining Lifespan</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(healthCard.sustainabilityRating)
                            ? 'text-emerald-500 fill-emerald-500'
                            : 'text-slate-350'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xl font-black text-slate-900 mt-4 leading-none">
                    {healthCard.sustainabilityRating} / 5
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold mt-1">Eco Integrity Rating</span>
                </div>
              )}
            </div>

            {/* Metric 3: Value Recovery */}
            <div className="bg-slate-50 border border-slate-250 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mb-2">
                Estimated Resale
              </span>
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 text-emerald-600 mb-2">
                <DollarSign className="w-7 h-7" />
              </div>
              <span className="text-xl font-black text-slate-900">
                {formatPrice(healthCard.estimatedResaleValue)}
              </span>
              <span className="text-xs text-slate-500 font-bold uppercase mt-2">
                Original: {formatPrice(product.originalPrice)}
              </span>
            </div>
          </div>

          {/* Product Lifecycle Data Ledger */}
          <div className="p-6 space-y-6">
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Circular Passport Ledger
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div className="text-left leading-tight">
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Original Purchase Date</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{healthCard.purchaseDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div className="text-left leading-tight">
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Estimated Usage Duration</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{healthCard.estimatedUsageDuration}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
                <div className="text-left leading-tight">
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Warranty & Return Status</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5">{healthCard.warrantyStatus}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-slate-400" />
                <div className="text-left leading-tight">
                  <p className="text-xs text-slate-500 font-extrabold uppercase">Circularity CO2 Offsets</p>
                  <p className="text-sm font-semibold text-emerald-600 mt-0.5">{product.co2SavedKg} kg carbon saved</p>
                </div>
              </div>
            </div>

            {/* Timeline Return History */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Product History Logs</h4>
              <div className="relative pl-6 border-l border-slate-200 space-y-4">
                {/* Loop return logs */}
                {healthCard.returnHistory.map((log, idx) => (
                  <div key={idx} className="relative">
                    {/* Circle bullet */}
                    <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-emerald-50 border-2 border-[#10b981] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800">Circular Audit Registry</p>
                      <p className="text-xs text-slate-600 leading-normal mt-0.5">{log}</p>
                    </div>
                  </div>
                ))}
                
                {/* Standard original registration */}
                <div className="relative">
                  <div className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full bg-slate-50 border-2 border-slate-300 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">Initial Registry Entry</p>
                    <p className="text-xs text-slate-500 mt-0.5">Product first purchased via Amazon.com retail channel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Passport Side Instructions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-850 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-5 h-5" /> What is a DPP?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              A **Digital Product Passport (DPP)** tracks a product's lifecycle from origin to reuse. 
              By logging repairs, battery wear, and cosmetic grades, DPPs establish a verified ledger 
              of physical state. This unlocks trust in circular marketplaces, proving remaining health index grades.
            </p>
            <div className="text-xs text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg p-3 font-semibold leading-relaxed">
              Scan the QR passport on packaging to verify this certification prior to buying.
            </div>
          </div>

          {/* Quick Routing Summary CTA */}
          <div className="border border-slate-250 rounded-2xl p-5 bg-slate-50/70 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Logistics Recommendation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              This product is processed through the Amazon Circular Engine and recommended for routing to:
              <strong className="block text-slate-800 font-extrabold mt-1 text-xs uppercase">
                {product.routing.route.replace('_', ' ')}
              </strong>
            </p>
            <Link
              href="/routing"
              className="text-xs font-bold text-sky-700 hover:text-sky-850 hover:underline flex items-center gap-0.5"
            >
              Open Smart Routing Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
