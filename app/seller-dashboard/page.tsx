"use client";

import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, CheckCircle, Package, DollarSign, Activity, AlertCircle, ArrowRight, Trash2, PenTool, Wrench, Circle, CheckSquare, Flame } from "lucide-react";
import { useNovaSeller } from "@/src/components/nova/useNovaPage";

export default function SellerCopilotDashboard() {
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
      const response = await fetch('/api/seller/relist-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detectedItemName: evaluation.analysis.detectedItemName,
          suggestedPrice: isUpgraded ? evaluation.roi.potentialUpgradedPrice : evaluation.pricing.suggestedPrice,
          damageLevel: isUpgraded ? 'Pristine' : evaluation.analysis.damageLevel,
          sellerNotes: isUpgraded ? "Relisted via AI Copilot - Restored to Pristine" : "Relisted via AI Copilot As-Is",
        })
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMsg(`Item relisted successfully as ${isUpgraded ? 'Pristine' : 'As-Is'}!`);
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
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-300 to-orange-500 bg-clip-text text-transparent">
            Seller AI Copilot
          </h1>
          <p className="text-neutral-400 mt-2 text-lg">
            Automated visual inspection, ROI repair analysis, and instant relisting.
          </p>
        </header>

        {successMsg && (
          <div className="mb-8 p-4 rounded-xl bg-green-500/20 border border-green-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <CheckCircle className="text-green-400 w-6 h-6" />
            <span className="text-green-100 font-medium text-lg">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Panel: Upload Dropzone */}
          <section className="flex flex-col gap-6">
            <div 
              className="border-2 border-dashed border-neutral-700 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-neutral-900/50 hover:bg-neutral-800/50 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="p-4 rounded-full bg-neutral-800 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-10 h-10 text-neutral-400 group-hover:text-amber-400" />
              </div>
              <h3 className="mt-4 text-xl font-semibold text-neutral-200">Upload Return Images</h3>
              <p className="text-neutral-500 mt-2 max-w-sm">
                Drop multiple angles of the returned product here. AI will scan for structural damage automatically.
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
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-neutral-800 group">
                    <img src={img} alt={`upload-${idx}`} className="object-cover w-full h-full" />
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={analyzeImages}
              disabled={images.length === 0 || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                images.length > 0 
                  ? "bg-neutral-100 text-black hover:bg-white active:scale-[0.98]" 
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Analyzing Return...
                </span>
              ) : "Run AI Copilot Audit"}
            </button>
          </section>

          {/* Right Panel: Intelligence Panel */}
          <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden flex flex-col">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Activity className="text-amber-400" />
              Intelligence Deck
            </h2>

            {!evaluation && !isAnalyzing && (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-center space-y-4">
                <Package className="w-16 h-16 opacity-20" />
                <p>Upload images and run the audit<br/>to generate insights.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-1 flex flex-col gap-4 animate-pulse">
                <div className="h-24 bg-neutral-800 rounded-2xl w-full" />
                <div className="h-40 bg-neutral-800 rounded-2xl w-full" />
                <div className="h-32 bg-neutral-800 rounded-2xl w-full" />
              </div>
            )}

            {evaluation && !isAnalyzing && (
              <div className="flex-1 flex flex-col gap-6 animate-in slide-in-from-bottom-4 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Damage Assessment Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Detected Product</p>
                    <p className="text-lg font-semibold">{evaluation.analysis.detectedItemName}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-neutral-400 mb-1">Condition Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      evaluation.analysis.damageLevel === 'Pristine' ? 'bg-green-500/20 text-green-400' :
                      evaluation.analysis.damageLevel === 'Severe Damage' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {evaluation.analysis.damageLevel}
                    </span>
                  </div>
                </div>

                {evaluation.analysis.damageLevel === 'Pristine' ? (
                  /* Pristine State UI: Show Demand Meter */
                  <>
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <h3 className="text-sm text-neutral-400">Local H3 Demand Velocity</h3>
                          <p className="text-3xl font-black mt-1">{evaluation.pricing.demandScorePercent}<span className="text-lg text-neutral-500">%</span></p>
                        </div>
                        <div className="text-right text-xs text-neutral-500">
                          Based on {evaluation.nearbyDemandCount} active local searches
                        </div>
                      </div>
                      <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-1000"
                          style={{ width: `${evaluation.pricing.demandScorePercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
                      <DollarSign className="absolute -right-4 -bottom-4 w-32 h-32 text-amber-500/10" />
                      <p className="text-amber-500 font-semibold mb-2">Optimized Resale Price</p>
                      <div className="flex items-baseline gap-3">
                        <h2 className="text-5xl font-black tracking-tighter">₹{evaluation.pricing.suggestedPrice}</h2>
                        <span className="text-neutral-500 line-through">₹{evaluation.referencePrice} MSRP</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-6">
                      <button 
                        onClick={() => handleRelist(false)}
                        disabled={isRelisting}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xl py-5 rounded-2xl transition-all active:scale-[0.98]"
                      >
                        {isRelisting ? "Relisting..." : "[ Relist Immediately ]"}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Damaged State UI: Quality Upgrading & ROI Repair Wizard */
                  <>
                    {/* The ROI Split Card */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Sell As-Is */}
                      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col justify-center">
                        <p className="text-sm text-neutral-400 font-medium mb-1">Sell As-Is Now</p>
                        <p className="text-3xl text-white font-bold mb-1">₹{evaluation.roi.currentPrice}</p>
                        <p className="text-xs text-neutral-500">Fast liquid, lower value</p>
                      </div>

                      {/* Upgrade Quality Tier */}
                      <div className="bg-green-500 border border-green-400 rounded-2xl p-5 flex flex-col justify-center relative shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]">
                        <div className="absolute top-2 right-3 text-xs font-bold text-green-900 bg-green-400 px-2 py-0.5 rounded-full uppercase tracking-widest">
                          Target
                        </div>
                        <p className="text-sm text-green-950 font-bold mb-1">Upgrade Tier</p>
                        <p className="text-3xl text-slate-900 font-black mb-1">₹{evaluation.roi.potentialUpgradedPrice}</p>
                        <p className="text-xs text-green-900 font-semibold">Material Cost: -₹{evaluation.roi.materialCost}</p>
                      </div>
                    </div>

                    {/* Net Profit Banner */}
                    <div className="bg-gradient-to-r from-emerald-950 to-green-900 border border-green-500/50 rounded-xl p-4 flex items-center justify-center gap-2">
                      <Flame className="text-orange-500 w-6 h-6" />
                      <span className="text-green-100 text-lg font-bold">
                        Net Profit Increase: <span className="text-green-400">+₹{evaluation.roi.netProfitIncrease}</span>
                      </span>
                    </div>

                    {/* Required Tools Alert Box */}
                    <div className="bg-blue-950/50 border border-blue-500/30 rounded-xl p-4 flex gap-3 items-start">
                      <Wrench className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-blue-300 font-bold text-sm">Required Workbench Materials</h4>
                        <p className="text-blue-200/70 text-xs mt-1">Based on the detected flaws ({evaluation.analysis.repairable_flaws?.join(', ')}), ensure you have standard cleaning solvents and repair kits suitable for the damage tier.</p>
                      </div>
                    </div>

                    {/* Actionable Restoration Checklist */}
                    {evaluation.analysis.step_by_step_restoration_guide?.length > 0 && (
                      <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                          <PenTool className="w-5 h-5 text-amber-400" />
                          Restoration Guide
                        </h3>
                        <div className="space-y-3">
                          {evaluation.analysis.step_by_step_restoration_guide.map((step: string, index: number) => (
                            <div 
                              key={index} 
                              onClick={() => toggleStep(index)}
                              className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                checkedSteps[index] 
                                  ? 'bg-green-900/20 border-green-500/30 text-green-100' 
                                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                              }`}
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {checkedSteps[index] ? (
                                  <CheckSquare className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Circle className="w-5 h-5 text-neutral-500" />
                                )}
                              </div>
                              <span className={`text-sm ${checkedSteps[index] ? 'line-through opacity-70' : ''}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-2">
                      <button 
                        onClick={() => handleRelist(false)}
                        disabled={isRelisting}
                        className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition-colors text-sm"
                      >
                        Sell As-Is
                      </button>
                      <button 
                        onClick={() => handleRelist(true)}
                        disabled={isRelisting}
                        className="flex-1 bg-green-500 hover:bg-green-400 text-slate-900 font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)] text-sm flex items-center justify-center gap-2"
                      >
                        {isRelisting ? "Relisting..." : "Relist as Upgraded"}
                        <ArrowRight className="w-4 h-4" />
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
