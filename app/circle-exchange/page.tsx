"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, CheckCircle, Package, DollarSign, Activity, Truck, MapPin, Search, PlayCircle } from "lucide-react";

export default function CircleExchangeSimulator() {
  const [images, setImages] = useState<string[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  
  const [isBuying, setIsBuying] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [activeItemStatus, setActiveItemStatus] = useState<string>("");
  const [dispatchData, setDispatchData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 5);
    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((base64Strings) => {
      setImages((prev) => [...prev, ...base64Strings].slice(0, 5));
    });
  };

  const handleEvaluate = async () => {
    if (images.length === 0) return;
    setIsEvaluating(true);
    setEvaluation(null);
    setDispatchData(null);
    setIsSettled(false);
    setActiveItemStatus("");

    try {
      const response = await fetch('/api/circle-exchange/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, basePrice: 1200 }) 
      });
      const result = await response.json();
      if (result.success) {
        setEvaluation(result.data);
        setActiveItemStatus(result.data.isViable ? "LIVE_ON_MARKETPLACE" : "REJECTED");
      } else {
        alert("Evaluation failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during evaluation.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSimulatePurchase = async () => {
    if (!evaluation || !evaluation.tradeInRecord) return;
    setIsBuying(true);

    try {
      const response = await fetch('/api/circle-exchange/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeInId: evaluation.tradeInRecord.id })
      });
      const result = await response.json();
      
      if (result.success) {
        setDispatchData(result.data);
        setIsSettled(true);
        setActiveItemStatus("PENDING_PICKUP");
      } else {
        alert("Purchase simulation failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during the buyer settlement.");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 p-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Circle Exchange Engine
            </h1>
          </div>
          <p className="text-slate-600 text-lg font-medium">
            Automated lifecycle bridging Trade-In, DP Passport, and Active Market Settlement.
          </p>
        </header>

        {/* SECTION 1: INGESTION & GATING */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Ingestion & AI Gating
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-blue-500 transition-colors" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">Upload Item Photos</h3>
              <p className="text-slate-500 mt-1 text-sm font-medium">AI will analyze structure & viability.</p>
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            </div>

            <div className="flex flex-col justify-center">
              {images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {images.map((img, idx) => (
                    <img key={idx} src={img} alt={`img-${idx}`} className="object-cover w-full aspect-square rounded-lg border border-slate-200" />
                  ))}
                </div>
              ) : (
                <div className="h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 mb-4 text-sm font-bold">
                  No images loaded
                </div>
              )}
              
              <button 
                onClick={handleEvaluate}
                disabled={images.length === 0 || isEvaluating}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  images.length > 0 
                    ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]" 
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isEvaluating ? "Processing AI Rules..." : "Run Circle Automation"}
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: AUTONOMOUS MARKET STATUS */}
        {evaluation && (
          <section className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 animate-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              Autonomous Market Status
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Condition Score</p>
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-black ${evaluation.conditionScore >= 7.0 ? 'text-green-600' : 'text-red-600'}`}>
                    {evaluation.conditionScore}
                  </span>
                  <span className="text-slate-400 font-bold">/ 10</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Requirement: &gt;= 7.0</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Local Demand</p>
                <div className="flex items-center gap-2">
                  <span className={`text-4xl font-black ${evaluation.demandScore >= 50 ? 'text-green-600' : 'text-orange-500'}`}>
                    {evaluation.demandScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Requirement: &gt;= 50%</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-2">System Outcome</p>
                {evaluation.isViable ? (
                  <div className="bg-green-100 text-green-800 font-bold px-4 py-2 rounded-lg border border-green-200 w-full">
                    ACTIVE_MARKETPLACE
                  </div>
                ) : (
                  <div className="bg-red-100 text-red-800 font-bold px-4 py-2 rounded-lg border border-red-200 w-full">
                    REJECTED / MANUAL_REVIEW
                  </div>
                )}
              </div>
            </div>

            {evaluation.isViable && !isSettled && (
              <button 
                onClick={handleSimulatePurchase}
                disabled={isBuying}
                className="w-full bg-slate-900 text-white font-bold py-5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isBuying ? "Executing Transaction..." : (
                  <>
                    <PlayCircle className="w-5 h-5" /> Simulate Buyer Purchase & Settlement
                  </>
                )}
              </button>
            )}
          </section>
        )}

        {/* SECTION 3: 3PL DISPATCH TRACKING */}
        {isSettled && dispatchData && (
          <section className="bg-white rounded-2xl p-8 shadow-md border-2 border-green-500 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                3PL Courier Dispatch
              </h2>
              <div className="bg-green-100 text-green-800 font-bold px-4 py-1.5 rounded-full text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Settlement Complete
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Generated Tracking ID</p>
                  <p className="text-2xl font-black text-slate-900 font-mono tracking-tight mt-1">
                    {dispatchData.logistics.trackingId}
                  </p>
                  <p className="text-slate-600 text-sm font-medium mt-1">Carrier: {dispatchData.logistics.courier}</p>
                </div>
              </div>

              <div className="relative">
                {/* Visual connecting line */}
                <div className="absolute left-[19px] top-8 bottom-8 w-1 bg-slate-200 rounded-full" />

                <div className="flex items-start gap-4 relative z-10 mb-8">
                  <div className="bg-white border-4 border-slate-200 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-slate-900">Origin (Seller Address)</p>
                    <p className="text-slate-600 font-medium">{dispatchData.logistics.originAddress}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative z-10">
                  <div className="bg-blue-600 border-4 border-blue-200 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <div className="pt-2">
                    <p className="font-bold text-slate-900">Destination (Buyer Address)</p>
                    <p className="text-slate-600 font-medium">{dispatchData.logistics.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
                Database Status: <span className="font-bold text-blue-600">{activeItemStatus}</span>
              </p>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
