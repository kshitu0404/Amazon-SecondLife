import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import AdminNovaWrapper from './AdminNovaWrapper';
import { 
  ShieldAlert, 
  PackageSearch, 
  RefreshCcw, 
  Link as LinkIcon, 
  ArrowRight,
  Database,
  Box,
  Truck
} from 'lucide-react';

// Next.js App Router Server Component
export const dynamic = 'force-dynamic';

export default async function AdminPortal() {

  // Fetch latest database records
  const orders = await prisma.order.findMany({ 
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { product: true }
  });
  
  const tradeIns = await prisma.tradeIn.findMany({ 
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { product: true }
  });
  
  const matches = await prisma.p2PMatch.findMany({ 
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { 
      order: { include: { product: true } },
      tradeIn: true
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 pb-32">
      <AdminNovaWrapper />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-amazon-blue flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-amazon-orange" />
              SecondLife Logistics Command Center
            </h1>
            <p className="text-slate-500 mt-1 text-sm">System oversight for P2P Matching & Inventory.</p>
          </div>
          <Link 
            href="/test-sandbox" 
            className="inline-flex items-center gap-2 bg-amazon-orange hover:bg-amber-500 text-slate-900 font-bold py-2.5 px-5 rounded-lg shadow-sm transition"
          >
            Open Test Sandbox <ArrowRight className="w-4 h-4" />
          </Link>
        </header>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Risk & Fraud Card */}
          <div className="lg:col-span-4 bg-rose-50 border border-rose-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-xl font-black text-rose-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-600" /> Risk & Fraud Operations
              </h2>
              <p className="text-rose-700 text-sm mt-1">Access the advanced 3-layer AI fraud detection system and XAI analytics.</p>
            </div>
            <Link 
              href="/admin/fraud" 
              className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition shrink-0"
            >
              Open Fraud Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-4 grid lg:grid-cols-3 gap-6">
          
          {/* Active Orders Pool */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-center gap-2">
              <PackageSearch className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-blue-900">Active Buyer Orders</h2>
            </div>
            <div className="p-4 overflow-y-auto flex-grow space-y-3 bg-slate-50">
              {orders.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No orders in system.</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-100 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-slate-500">{order.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${order.status === 'MATCHED_P2P' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="font-semibold">{order.product?.name || order.productId}</p>
                    <p className="text-xs text-slate-500 mt-1">H3: {order.h3_index}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Trade-Ins Queue */}
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-purple-50 border-b border-purple-100 p-4 flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-purple-600" />
              <h2 className="font-bold text-purple-900">Trade-In Pool</h2>
            </div>
            <div className="p-4 overflow-y-auto flex-grow space-y-3 bg-slate-50">
              {tradeIns.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No trade-ins recorded.</p>
              ) : (
                tradeIns.map(trade => (
                  <div key={trade.id} className="bg-white p-3 rounded-md shadow-sm border border-slate-100 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-xs text-slate-500">{trade.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        trade.status === 'MATCHED_P2P' ? 'bg-emerald-100 text-emerald-700' : 
                        trade.status === 'INSPECTED_PASSED' ? 'bg-purple-100 text-purple-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {trade.status}
                      </span>
                    </div>
                    <p className="font-semibold">{trade.product?.name || trade.productId}</p>
                    <p className="text-xs text-slate-500 mt-1">Cond: {trade.condition} | H3: {trade.h3_index}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* P2P Matches */}
          <section className="bg-white rounded-xl border border-emerald-300 overflow-hidden flex flex-col h-[500px] shadow-sm">
            <div className="bg-emerald-50 border-b border-emerald-200 p-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-emerald-900">Live P2P Routing Matches</h2>
            </div>
            <div className="p-4 overflow-y-auto flex-grow space-y-4 bg-emerald-50/30">
              {matches.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No matches created yet.</p>
              ) : (
                matches.map(match => (
                  <div key={match.id} className="bg-white p-4 rounded-lg shadow border border-emerald-100 text-sm relative">
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        match.status === 'AWAITING_COURIER' ? 'bg-orange-100 text-orange-700' : 
                        match.status === 'CANCELLED_TIMEOUT' ? 'bg-red-100 text-red-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 mb-3">{match.order?.product?.name || 'Unknown Item'}</h3>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Box className="w-3.5 h-3.5 text-purple-500" /> 
                        <span className="font-mono">T: {match.tradeInId.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Database className="w-3.5 h-3.5 text-blue-500" /> 
                        <span className="font-mono">O: {match.orderId.substring(0, 8)}...</span>
                      </div>
                    </div>

                    {match.trackingUrl && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <a href={match.trackingUrl} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700">
                          <Truck className="w-3.5 h-3.5" /> Track 3PL Courier
                        </a>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          </div>
        </div>
      </div>
    </div>
  );
}
