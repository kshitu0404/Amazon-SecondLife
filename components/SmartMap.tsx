'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Tag, MapPin, Zap, BrainCircuit, ShieldCheck, Leaf, ArrowRight, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Custom Map Marker Icon
const createCustomIcon = (grade: string) => {
  const color = grade === 'B' ? '#10b981' : grade === 'C' ? '#38bdf8' : '#f59e0b';
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="background-color: #0f172a; border: 2px solid ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color}40;">
        <span style="color: ${color}; font-weight: 900; font-family: sans-serif; font-size: 14px;">${grade}</span>
      </div>
      <div style="width: 2px; height: 12px; background-color: ${color}; margin: 0 auto;"></div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    popupAnchor: [0, -44],
  });
};

export default function SmartMap({ products, onOpenWitnessPanel }: { products: any[], onOpenWitnessPanel: (product: any) => void }) {
  // Default to central India or a specific location if products exist
  const center = products.length > 0 && products[0].lat ? [products[0].lat, products[0].lng] : [20.5937, 78.9629];

  return (
    <MapContainer 
      center={center as any} 
      zoom={5} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      {/* Dark futuristic map tiles from CartoDB */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {products.map((p) => {
        if (!p.lat || !p.lng) return null;
        
        return (
          <Marker 
            key={p.id} 
            position={[p.lat, p.lng]} 
            icon={createCustomIcon(p.grade)}
          >
            <Popup className="custom-popup" maxWidth={360} minWidth={320}>
              <div className="bg-white border border-slate-200 rounded-2xl p-0 overflow-hidden text-slate-900 font-sans shadow-xl relative">
                
                {/* Product Header */}
                <div className="flex gap-4 p-4 border-b border-slate-100 bg-slate-50">
                  <div className="w-20 h-20 bg-white/5 rounded-xl p-2 shrink-0 border border-white/10 flex items-center justify-center">
                    <img src={p.image || "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=150&q=80"} alt={p.name} className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight mb-1">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        p.grade === 'B' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 
                        p.grade === 'C' ? 'bg-sky-50 text-sky-700 border-sky-300' : 
                        'bg-amber-50 text-amber-700 border-amber-300'
                      }`}>
                        Grade {p.grade}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">{p.city}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">₹{p.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 line-through font-medium">₹{Math.round(p.price * 1.4).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Intelligence Layer */}
                <div className="p-4 space-y-3 bg-white">
                  <div className="flex items-start gap-3">
                    <BrainCircuit className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-slate-500">AI Return Analysis</div>
                      <div className="text-sm text-slate-700 font-medium">"{p.returnReason}"</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-100 rounded-lg p-2 border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="w-4 h-4" /> Trust Score
                    </div>
                    <div className="text-sm font-black text-slate-900">{p.trustScore}/100</div>
                  </div>
                </div>

                {/* Sustainability Metrics */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[10px] text-slate-500 font-black uppercase mb-0.5">Original Price</div>
                      <div className="text-sm text-slate-400 font-medium line-through">₹{p.originalPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-600 font-black uppercase mb-0.5">Circular Price</div>
                      <div className="text-2xl font-black text-slate-900">₹{p.price.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 flex gap-2">
                  <button 
                    onClick={() => onOpenWitnessPanel(p)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> WitnessPanel
                  </button>
                  <Link 
                    href={`/health-card?id=${p.id}`}
                    className="flex-1 bg-amazon-orange hover:bg-amazon-orange/90 text-slate-900 text-xs font-black py-3 rounded-xl transition shadow-lg shadow-amazon-orange/20 flex items-center justify-center gap-2"
                  >
                    Buy Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  );
}
