'use client';

import React, { useState, useEffect } from "react";
import { useNovaWallet } from '@/src/components/nova/useNovaPage';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Leaf, Wallet as WalletIcon, RefreshCw, ShieldCheck, Zap, TrendingUp, History, PieChart as PieChartIcon, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";

const COLORS = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#f43f5e"];

export default function WalletDashboard() {
  useNovaWallet();
  const [wallet, setWallet] = useState<any>(null);
  const [carbon, setCarbon] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState(94);

  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeAction, setTradeAction] = useState("sell");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isTrading, setIsTrading] = useState(false);

  useEffect(() => {
    // Mock Backend Loading
    setTimeout(() => {
      setWallet({
        green_credits: 1250,
        carbon_saved_kg: 1850,
        usd_balance: 45.50,
        exchange_rate: 0.1980,
        level: "Tree",
        next_level: { name: "Forest", gcToNext: 8750 }
      });
      setCarbon({
        equivalents: { driving: "Equal to 7,400 miles driven" },
        timeline: [
          { month: "Jan", carbon: 150 },
          { month: "Feb", carbon: 220 },
          { month: "Mar", carbon: 180 },
          { month: "Apr", carbon: 350 },
          { month: "May", carbon: 410 },
          { month: "Jun", carbon: 540 }
        ],
        by_action: [
          { action: "Resold", carbon: 850 },
          { action: "Donated", carbon: 450 },
          { action: "Repaired", carbon: 350 },
          { action: "Bought Preloved", carbon: 200 }
        ]
      });
      setHistory([
        { delta: 450, reason: "Sold Certified Pre-Owned Sony Headphones", balance_after: 1250 },
        { delta: 200, reason: "Donated Patagonia Sweater", balance_after: 800 },
        { delta: -100, reason: "Swapped 100 GC for $19.80 INR Tokens", balance_after: 600 },
        { delta: 700, reason: "Initial Registration Bonus", balance_after: 700 }
      ]);
    }, 400);
  }, []);

  const handleTrade = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const amount = Number(tradeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }

    setIsTrading(true);

    setTimeout(() => {
      setIsTrading(false);
      const rate = wallet.exchange_rate;

      if (tradeAction === "sell") {
        if (amount > wallet.green_credits) {
          setErrorMsg("Insufficient Green Credits to complete swap.");
          return;
        }
        const earned = amount * rate;
        const newCredits = wallet.green_credits - amount;
        setWallet({ ...wallet, green_credits: newCredits, usd_balance: wallet.usd_balance + earned });
        setHistory([
          { delta: -amount, reason: `Swapped ${amount} GC for ₹${earned.toFixed(2)} INR Tokens`, balance_after: newCredits },
          ...history
        ]);
        setSuccessMsg(`Successfully swapped! Received ₹${earned.toFixed(2)} INR Tokens.`);
      } else {
        const cost = amount * rate;
        if (cost > wallet.usd_balance) {
          setErrorMsg("Insufficient INR Token balance to purchase Green Credits.");
          return;
        }
        const newCredits = wallet.green_credits + amount;
        setWallet({ ...wallet, green_credits: newCredits, usd_balance: wallet.usd_balance - cost });
        setHistory([
          { delta: amount, reason: `Purchased ${amount} GC for ₹${cost.toFixed(2)} INR Tokens`, balance_after: newCredits },
          ...history
        ]);
        setSuccessMsg(`Successfully purchased! Deducted ₹${cost.toFixed(2)} INR Tokens.`);
      }
      setTradeAmount("");
    }, 800);
  };

  if (!wallet || !carbon) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 pb-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-amazon-orange rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Loading Circular Wallet...</span>
        </div>
      </div>
    );
  }

  const { next_level } = wallet;

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto pb-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
          <WalletIcon className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Circular Wallet & Impact</h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage your Green Credits, track sustainability, and swap tokens.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Leaf className="w-4 h-4 text-emerald-500" /> Green Credits
          </div>
          <div className="text-3xl font-black text-emerald-600">{wallet.green_credits} <span className="text-lg">GC</span></div>
          <div className="text-xs font-bold text-slate-400 mt-2">Rate: ₹{wallet.exchange_rate.toFixed(4)}/GC</div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <WalletIcon className="w-4 h-4 text-sky-500" /> INR Token Balance
          </div>
          <div className="text-3xl font-black text-slate-900">₹{wallet.usd_balance.toFixed(2)}</div>
          <div className="text-xs font-bold text-slate-400 mt-2">Total GC Value: ₹{(wallet.green_credits * wallet.exchange_rate).toFixed(2)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> CO₂ Saved
          </div>
          <div className="text-3xl font-black text-emerald-600">{wallet.carbon_saved_kg} <span className="text-lg">kg</span></div>
          <div className="text-xs font-bold text-slate-400 mt-2 line-clamp-1">{carbon.equivalents.driving}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Zap className="w-4 h-4 text-amazon-orange" /> Level
          </div>
          <div className="text-3xl font-black text-slate-900">{wallet.level}</div>
          <div className="text-xs font-bold text-slate-400 mt-2">
            {next_level.name ? `${next_level.gcToNext} GC to ${next_level.name}` : "Max level"}
          </div>
        </div>
      </div>

      {/* Nectar Trust Score Dashboard */}
      <div className={`bg-white border ${trustScore >= 80 ? 'border-emerald-200' : 'border-rose-200'} rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden transition-colors duration-500`}>
        <div className={`absolute top-0 left-0 w-1 h-full ${trustScore >= 80 ? 'bg-emerald-400' : 'bg-rose-500'}`}></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                Your Nectar Trust Score
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${trustScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} flex items-center gap-1`}>
                {trustScore >= 80 ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                {trustScore >= 80 ? 'Trusted Customer' : 'Watchlist Status'}
              </span>
            </div>
            <div className="text-4xl font-black text-slate-900 mt-2">
              {trustScore}<span className="text-xl text-slate-400">/100</span>
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600">Simulate Trust Score:</span>
            <button 
              onClick={() => setTrustScore(94)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${trustScore >= 80 ? 'bg-emerald-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              Trusted (94)
            </button>
            <button 
              onClick={() => setTrustScore(38)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition ${trustScore < 80 ? 'bg-rose-500 text-white shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
            >
              Risky (38)
            </button>
          </div>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">{trustScore >= 80 ? 'Why is your score high?' : 'Factors lowering score:'}</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {trustScore >= 80 ? (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 22 successful purchases</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 0 fraudulent returns</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified purchase history</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Low return frequency</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm text-slate-600"><AlertTriangle className="w-4 h-4 text-rose-500" /> 7 returns in last 15 days</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><AlertTriangle className="w-4 h-4 text-rose-500" /> Multiple damage claims</div>
                <div className="flex items-center gap-2 text-sm text-slate-600"><AlertTriangle className="w-4 h-4 text-rose-500" /> Frequent high-value refunds</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* DeFi Token Swap & Registry */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* DeFi Token Swap */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
          
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
            <RefreshCw className="w-5 h-5 text-sky-500" /> Green Credit DeFi Token Swap
          </h3>
          <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
            Swap your verified Green Credit tokens for tradeable INR Stable-Tokens, or buy more credits. Pricing is algorithmically backed by actual verified carbon offsets.
          </p>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mb-5">
            <button 
              onClick={() => { setTradeAction("sell"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-md transition ${tradeAction === "sell" ? "bg-white text-sky-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 cursor-pointer"}`}
            >
              Swap GC for INR (Sell)
            </button>
            <button 
              onClick={() => { setTradeAction("buy"); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-md transition ${tradeAction === "buy" ? "bg-white text-sky-700 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 cursor-pointer"}`}
            >
              Purchase GC (Buy)
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
                <span>Amount of Green Credits (GC)</span>
                <span className="text-emerald-600">Balance: {wallet.green_credits} GC</span>
              </div>
              <div className="relative">
                <input 
                  type="number" placeholder="0" value={tradeAmount}
                  onChange={(e) => { setTradeAmount(e.target.value); setErrorMsg(null); setSuccessMsg(null); }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-4 pr-12 py-3 text-slate-900 font-bold focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition shadow-sm"
                />
                <span className="absolute right-4 top-3.5 text-xs font-black text-slate-400">GC</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 shadow-xs">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-500">Algorithmic Rate:</span>
                <span className="text-sky-600">₹{wallet.exchange_rate.toFixed(4)} INR / GC</span>
              </div>
              <div className="flex justify-between text-sm font-black border-t border-slate-200 pt-2 mt-2">
                <span className="text-slate-700">Total Value:</span>
                <span className="text-slate-900">₹{(Number(tradeAmount || 0) * wallet.exchange_rate).toFixed(2)} INR</span>
              </div>
              {tradeAction === "buy" && (
                <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-1">
                  <span>Available INR Tokens:</span>
                  <span className={wallet.usd_balance < (Number(tradeAmount || 0) * wallet.exchange_rate) ? "text-rose-500" : ""}>
                    ₹{wallet.usd_balance.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {errorMsg && <div className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-lg flex items-center gap-2"><ShieldCheck className="w-4 h-4 shrink-0" /> {errorMsg}</div>}
            {successMsg && <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-2"><ShieldCheck className="w-4 h-4 shrink-0" /> {successMsg}</div>}

            <button 
              onClick={handleTrade} disabled={isTrading || !tradeAmount || Number(tradeAmount) <= 0}
              className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-black py-3 rounded-lg border border-[#a88734] transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isTrading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {isTrading ? "Executing Swap..." : tradeAction === "sell" ? "Swap GC for INR Tokens" : "Confirm GC Purchase"}
            </button>
          </div>
        </div>

        {/* Carbon Backing Registry */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
          
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Carbon Backing Registry
          </h3>
          <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
            Every Green Credit token minted on CCOS represents an audit-verified, direct carbon avoidance event. This cryptographic registry links credit liquidity directly to structural sustainability.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[9px] uppercase font-black tracking-wider mb-1">Registry ID</div>
              <div className="font-mono text-slate-900 font-bold text-xs truncate">CCOS-REG-AX92B1M</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[9px] uppercase font-black tracking-wider mb-1">Verification Level</div>
              <div className="text-emerald-600 font-black text-xs flex items-center gap-1">
                ✦ Gold Standard
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[9px] uppercase font-black tracking-wider mb-1">Carbon Intensity</div>
              <div className="text-slate-900 font-black text-xs">
                {wallet.green_credits > 0 ? (wallet.carbon_saved_kg / wallet.green_credits).toFixed(2) : "1.00"} kg CO₂/GC
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-slate-400 text-[9px] uppercase font-black tracking-wider mb-1">Verification Audit</div>
              <div className="text-slate-600 font-bold text-xs">
                ✓ AI ESG Oracle
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-xs mt-auto">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-emerald-800">Token Backing Ratio Efficacy</span>
              <span className="text-emerald-600 font-black">Excellent</span>
            </div>
            <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden border border-emerald-200 mb-3">
              <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, ((wallet.carbon_saved_kg) / Math.max(1, wallet.green_credits)) * 50)}%` }} />
            </div>
            <p className="text-[10px] text-emerald-700 font-medium leading-relaxed">
              This account has a total backing of <b className="font-black">{wallet.carbon_saved_kg} kg CO₂</b> offsets across <b className="font-black">{wallet.green_credits}</b> active credit tokens. Higher offset intensity increases token value yield.
            </p>
          </div>
        </div>

      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-emerald-500" /> CO₂ Saved Over Time
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carbon.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                />
                <Bar dataKey="carbon" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-amazon-orange" /> Savings by Action
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={carbon.by_action} dataKey="carbon" nameKey="action" cx="50%" cy="50%" outerRadius={80} fill="#10b981" label={(entry: any) => entry.action} labelLine={false} className="font-bold text-[10px] fill-slate-700">
                  {carbon.by_action.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Ledger History */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-slate-500" /> Green Credit Ledger History
        </h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-2/3">Transaction Details</th>
                <th className="p-4 text-right">Amount (GC)</th>
                <th className="p-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((e, i) => (
                <tr key={i} className="hover:bg-slate-50 transition">
                  <td className="p-4 text-sm font-bold text-slate-800">{e.reason}</td>
                  <td className={`p-4 text-sm font-black text-right ${e.delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    {e.delta >= 0 ? "+" : ""}{e.delta}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-500 text-right">{e.balance_after}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
