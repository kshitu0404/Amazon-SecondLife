"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle, Package, DollarSign, Activity, AlertCircle, ArrowRight, Trash2, PenTool, Wrench, Circle, CheckSquare, Flame, Sparkles } from "lucide-react";
import { useNovaSeller } from "@/src/components/nova/useNovaPage";

export default function CopilotTab() {
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRelisting, setIsRelisting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { novaSellerInsight, novaPriceRecommendation } = useNovaSeller();

  useEffect(() => {
    // Proactive AI insight on dashboard load
    const timer = setTimeout(() => {
      novaSellerInsight({
        issue: 'I detected high return rates in your recent electronics shipments.',
        action: 'Switch to reinforced bubble packaging to prevent transit damage.',
        revenue: 42000,
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setEvaluation(null); 
    setCheckedSteps({});
  };

  const analyzeImages = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    setEvaluation(null);
    setSuccessMsg("");
    setCheckedSteps({});

    try {
      const response = await fetch('/api/seller/copilot-evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images, basePrice: 1500 }) 
      });
      const result = await response.json();
      if (result.success) {
        setEvaluation(result.data);
      } else {
        alert("Evaluation failed: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong during evaluation.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRelist = async (isUpgraded: boolean) => {
    if (!evaluation) return;
    setIsRelisting(true);

    try {
      const response = await fetch('/api/ara/add-to-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectedItemName: evaluation.analysis.detectedItemName,
          suggestedPrice: isUpgraded ? evaluation.roi.potentialUpgradedPrice : evaluation.pricing.suggestedPrice,
          damageLevel: isUpgraded ? 'Pristine' : evaluation.analysis.damageLevel,
          image: images[0]
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMsg(`Item transferred to Autonomous Action Queue!`);
        setTimeout(() => {
          setImages([]);
          setEvaluation(null);
          setSuccessMsg("");
          setCheckedSteps({});
        }, 4000);
      } else {
        alert("Failed to relist: " + result.error);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong while relisting.");
    } finally {
      setIsRelisting(false);
    }
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-left">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="mb-2 border-b border-slate-100 pb-5">
          <span className="bg-sky-100 text-sky-700 border border-sky-200 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            Seller AI Copilot
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Automated Visual Inspection
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed font-medium">
            Upload images of returned items. The AI Copilot will automatically analyze structural damage, calculate ROI for repairs, and relist your inventory with a single click.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 shadow-sm">
            <CheckCircle className="text-emerald-500 w-6 h-6" />
            <span className="text-emerald-800 font-bold text-sm">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Upload Dropzone */}
          <section className="flex flex-col gap-5">
            <div 
              className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 rounded-full bg-white shadow-sm border border-slate-200 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-amazon-orange" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-800">Upload Return Images</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm font-medium">
                Drop multiple angles of the returned product here. AI will scan for damage automatically.
              </p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                    <img src={img} alt={`upload-${idx}`} className="object-cover w-full h-full" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white hover:text-rose-400"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={analyzeImages}
              disabled={images.length === 0 || isAnalyzing}
              className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-sm ${
                images.length > 0 
                  ? "bg-amazon-orange hover:bg-orange-500 text-white active:scale-[0.98]" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing Return...
                </span>
              ) : "Run AI Copilot Audit"}
            </button>
          </section>

          {/* Right Panel: Intelligence Panel */}
          <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6 relative flex flex-col">
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2 text-slate-900">
              <Activity className="text-amazon-orange w-5 h-5" />
              Intelligence Deck
            </h2>

            {!evaluation && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center space-y-3 py-12">
                <Package className="w-12 h-12 opacity-50" />
                <p className="text-sm font-semibold">Upload images and run the audit<br/>to generate insights.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col gap-4 animate-pulse">
                <div className="h-20 bg-slate-200 rounded-xl w-full" />
                <div className="h-32 bg-slate-200 rounded-xl w-full" />
                <div className="h-24 bg-slate-200 rounded-xl w-full" />
              </div>
            )}

            {evaluation && !isAnalyzing && (
              <div className="flex-1 flex flex-col gap-5 animate-in slide-in-from-bottom-4">
                
                {/* Damage Assessment Card */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-0.5">Detected Product</p>
                    <p className="text-sm font-black text-slate-900">{evaluation.analysis.detectedItemName}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">Condition Status</p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      evaluation.analysis.damageLevel === 'Pristine' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      evaluation.analysis.damageLevel === 'Severe Damage' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {evaluation.analysis.damageLevel}
                    </span>
                  </div>
                </div>

                {evaluation.analysis.damageLevel === 'Pristine' ? (
                  /* Pristine State UI: Show Demand Meter */
                  <>
                    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Local H3 Demand Velocity</h3>
                          <p className="text-2xl font-black text-slate-900 mt-1">{evaluation.pricing.demandScorePercent}<span className="text-base text-slate-500">%</span></p>
                        </div>
                        <div className="text-right text-[10px] font-bold text-slate-400">
                          Based on {evaluation.nearbyDemandCount} active searches
                        </div>
                      </div>
                      <div className="h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amazon-orange transition-all duration-1000"
                          style={{ width: `${evaluation.pricing.demandScorePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 relative overflow-hidden">
                      <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-amber-500/10" />
                      <p className="text-amber-700 font-extrabold text-xs uppercase tracking-wider mb-1">Optimized Resale Price</p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">₹{evaluation.pricing.suggestedPrice}</h2>
                        <span className="text-slate-400 font-semibold line-through text-sm">₹{evaluation.referencePrice} MSRP</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <button 
                        onClick={() => handleRelist(false)}
                        disabled={isRelisting}
                        className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0c14b] border border-[#a88734] text-slate-900 font-extrabold text-sm py-3.5 rounded-xl shadow-sm transition-all active:scale-[0.98]"
                      >
                        {isRelisting ? "Relisting..." : "Relist Immediately"}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Damaged State UI: Quality Upgrading & ROI Repair Wizard */
                  <>
                    {/* The ROI Split Card */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Sell As-Is */}
                      <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 flex flex-col justify-center">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-0.5">Sell As-Is Now</p>
                        <p className="text-2xl text-slate-900 font-black mb-0.5">₹{evaluation.roi.currentPrice}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">Fast liquid, lower value</p>
                      </div>

                      {/* Upgrade Quality Tier */}
                      <div className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-xl p-4 flex flex-col justify-center relative">
                        <div className="absolute top-2 right-2 text-[8px] font-black text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded uppercase tracking-widest">
                          Target
                        </div>
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 mb-0.5">Upgrade Tier</p>
                        <p className="text-2xl text-slate-900 font-black mb-0.5">₹{evaluation.roi.potentialUpgradedPrice}</p>
                        <p className="text-[10px] text-emerald-600 font-bold">Material Cost: -₹{evaluation.roi.materialCost}</p>
                      </div>
                    </div>

                    {/* Net Profit Banner */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-center gap-2 shadow-sm">
                      <Flame className="text-amazon-orange w-5 h-5" />
                      <span className="text-slate-700 text-sm font-bold">
                        Net Profit Increase: <span className="text-emerald-600 font-black">+₹{evaluation.roi.netProfitIncrease}</span>
                      </span>
                    </div>

                    {/* Required Tools Alert Box */}
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 flex gap-2.5 items-start">
                      <Wrench className="text-sky-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sky-800 font-extrabold text-xs">Required Workbench Materials</h4>
                        <p className="text-sky-700 text-[11px] font-medium mt-0.5">Based on flaws ({evaluation.analysis.repairable_flaws?.join(', ')}), ensure you have standard cleaning solvents and repair kits suitable for the damage tier.</p>
                      </div>
                    </div>

                    {/* Actionable Restoration Checklist */}
                    {evaluation.analysis.step_by_step_restoration_guide?.length > 0 && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <h3 className="text-slate-900 font-extrabold text-sm flex items-center gap-2 mb-3">
                          <PenTool className="w-4 h-4 text-amazon-orange" />
                          Restoration Guide
                        </h3>
                        <div className="space-y-2">
                          {evaluation.analysis.step_by_step_restoration_guide.map((step: string, index: number) => (
                            <div 
                              key={index} 
                              onClick={() => toggleStep(index)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer ${
                                checkedSteps[index] 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {checkedSteps[index] ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-300" />
                                )}
                              </div>
                              <span className={`text-xs font-semibold ${checkedSteps[index] ? 'line-through opacity-60' : ''}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-1">
                      <button 
                        onClick={() => handleRelist(false)}
                        disabled={isRelisting}
                        className="flex-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-extrabold py-3 rounded-lg transition-colors text-xs shadow-sm"
                      >
                        {isRelisting ? "Transferring..." : "Queue As-Is"}
                      </button>
                      <button 
                        onClick={() => handleRelist(true)}
                        disabled={isRelisting}
                        className="flex-1 bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-black py-3 border border-[#a88734] rounded-lg transition-all active:scale-[0.98] shadow-sm text-xs flex items-center justify-center gap-1.5"
                      >
                        {isRelisting ? "Transferring..." : "Queue as Upgraded"}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
