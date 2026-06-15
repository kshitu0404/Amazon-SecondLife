'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Search, Filter, Map as MapIcon, List, Zap, Leaf } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import WitnessPanel from '@/components/WitnessPanel';
import { useNovaSmartMarketplace } from '@/src/components/nova/useNovaPage';

// Dynamically import the map to avoid SSR issues with Leaflet
const SmartMap = dynamic(() => import('@/components/SmartMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="w-12 h-12 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <div className="text-slate-400 font-bold uppercase tracking-widest text-sm animate-pulse">Initializing Geo-Intelligence...</div>
    </div>
  )
});

export default function SmartMarketplaceClient({ initialProducts }: { initialProducts: any[] }) {
  const [search, setSearch] = useState('');
  const [activeGrade, setActiveGrade] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [activeWitnessProduct, setActiveWitnessProduct] = useState<any>(null);

  useNovaSmartMarketplace();

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase());
      const matchesGrade = activeGrade ? p.grade === activeGrade : true;
      return matchesSearch && matchesGrade;
    });
  }, [initialProducts, search, activeGrade]);

  return (
    <div className="min-h-screen pb-20 text-slate-900">
      
      {/* Yellow Brand Header */}
      <div className="bg-[#FADD57] text-slate-900 pt-12 pb-24 px-6 border-b border-[#EBCF45] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest opacity-70 mb-2 block flex items-center gap-2">
              <Zap className="w-4 h-4" /> Geo-Intelligence
            </span>
            <h1 className="text-4xl font-black tracking-tight mb-3">
              Smart Marketplace
            </h1>
            <p className="text-lg font-medium opacity-80 max-w-2xl">
              Explore live pre-owned inventory near you. Interactive map powered by Vision AI grading.
            </p>
          </div>
          
          {/* Top Floating Bar */}
          <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-1.5 rounded-xl shadow-lg flex items-center gap-1 shrink-0">
            <button 
              onClick={() => setViewMode('map')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${viewMode === 'map' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <MapIcon className="w-4 h-4" /> Map View
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <List className="w-4 h-4" /> Grid View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-20 flex flex-col lg:flex-row gap-6">
        
        {/* Left Sidebar (Filters) */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-fit space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-slate-400" /> Search
            </h3>
            <input 
              type="text" 
              placeholder="Search products or cities..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 outline-none focus:border-amazon-orange transition-colors shadow-sm"
            />
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-slate-400" /> AI Grade
            </h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => setActiveGrade(activeGrade === 'B' ? null : 'B')}
                className={`py-2.5 rounded-lg text-sm font-bold border transition text-left px-4 ${activeGrade === 'B' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                Grade B - Excellent
              </button>
              <button 
                onClick={() => setActiveGrade(activeGrade === 'C' ? null : 'C')}
                className={`py-2.5 rounded-lg text-sm font-bold border transition text-left px-4 ${activeGrade === 'C' ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                Grade C - Very Good
              </button>
              <button 
                onClick={() => setActiveGrade(activeGrade === 'D' ? null : 'D')}
                className={`py-2.5 rounded-lg text-sm font-bold border transition text-left px-4 ${activeGrade === 'D' ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                Grade D - Good
              </button>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500">{filteredProducts.length} Results Found</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full h-[600px]">
          {viewMode === 'map' ? (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
              <SmartMap products={filteredProducts} onOpenWitnessPanel={(p) => setActiveWitnessProduct(p)} />
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto pb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-slate-300 hover:shadow-md transition shadow-sm">
                    <div className="h-48 bg-slate-50 p-6 flex items-center justify-center relative border-b border-slate-100">
                      <img src={p.image} alt={p.name} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                      <div className={`absolute top-4 left-4 text-[10px] font-black px-2 py-1 rounded-full uppercase shadow-sm ${p.grade === 'B' ? 'bg-emerald-100 text-emerald-700' : p.grade === 'C' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700'}`}>Grade {p.grade}</div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 mb-2 truncate">{p.name}</h3>
                      <div className="flex items-center gap-2 mb-4 text-xs text-slate-500 font-medium">
                        <MapIcon className="w-3.5 h-3.5" /> {p.city}
                      </div>
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                        <span className="text-sm text-slate-400 line-through font-medium">₹{p.originalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setActiveWitnessProduct(p)}
                          className="flex-1 py-2.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-center font-bold text-xs rounded-lg transition shadow-sm"
                        >
                          WitnessPanel
                        </button>
                        <Link 
                          href={`/health-card?id=${p.id}`}
                          className="flex-1 py-2.5 bg-amazon-orange hover:bg-amazon-orange/90 text-slate-900 text-center font-black text-xs rounded-lg transition shadow-sm"
                        >
                          Buy Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Global WitnessPanel Overlay */}
      <AnimatePresence>
        {activeWitnessProduct && (
          <WitnessPanel product={activeWitnessProduct} onClose={() => setActiveWitnessProduct(null)} />
        )}
      </AnimatePresence>

    </div>
  );
}
