'use client';

import React, { useState } from "react";
import AraTab from "./AraTab";
import CopilotTab from "./CopilotTab";
import { Star, Sparkles } from "lucide-react";
import { useNovaSellerWelcome } from '@/src/components/nova/useNovaPage';

export default function SellerDashboardLayout() {
  useNovaSellerWelcome();
  const [activeTab, setActiveTab] = useState<'ara' | 'copilot'>('ara');

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto font-sans text-left">
      
      {/* Tab Navigation Header */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ara')}
          className={`px-4 py-2 text-sm font-extrabold flex items-center gap-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'ara' 
              ? 'bg-amber-50 text-amber-800 border-b-2 border-amber-500' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Star className="w-4 h-4" />
          Autonomous Resale Agent
        </button>
        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-2 text-sm font-extrabold flex items-center gap-2 rounded-t-lg transition-colors cursor-pointer ${
            activeTab === 'copilot' 
              ? 'bg-sky-50 text-sky-800 border-b-2 border-sky-500' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Seller AI Copilot
        </button>
      </div>

      {/* Render Active Tab */}
      <div className="mt-2">
        {activeTab === 'ara' ? <AraTab /> : <CopilotTab />}
      </div>
      
    </div>
  );
}
