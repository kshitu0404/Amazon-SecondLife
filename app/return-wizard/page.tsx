'use client';

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Box, Camera, CheckCircle, Leaf, ShieldCheck, Truck, RefreshCw, DollarSign, Upload, Zap, Package, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import NovaProgressOverlay, { NovaPhase } from '@/src/components/nova/NovaProgressOverlay';

// Mock Orders
const MOCK_ORDERS = [
  {
    id: "ord-1",
    order_number: "ORDER #114-892314-23910",
    purchase_price: 399,
    estimated_value: 290,
    product: {
      title: "Sony WH-1000XM4 Wireless Headphones",
      brand: "Sony",
      category: "Electronics",
      image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80"
    }
  },
  {
    id: "ord-2",
    order_number: "ORDER #114-123456-78901",
    purchase_price: 120,
    estimated_value: 95,
    product: {
      title: "Patagonia Better Sweater",
      brand: "Patagonia",
      category: "Apparel",
      image_url: "https://images.unsplash.com/photo-1578587018452-892bace94f12?auto=format&fit=crop&w=400&q=80"
    }
  }
];

const STEPS = ["Select item", "Upload photos", "Upload packaging", "AI inspection", "Decision", "Pickup"];

// STAGE_LABELS removed in favor of NovaPhase

export default function ReturnWizard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [step, setStep] = useState(0);
  const [order, setOrder] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [pkgFiles, setPkgFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [selectedNgo, setSelectedNgo] = useState("");
  const [busy, setBusy] = useState(false);
  const [forceFraud, setForceFraud] = useState(false);

  const [novaPhase, setNovaPhase] = useState<NovaPhase | null>(null);
  const [novaStepIdx, setNovaStepIdx] = useState(0);

  useEffect(() => {
    setOrders(MOCK_ORDERS);
  }, []);

  async function pickOrder(o: any) {
    setBusy(true);
    setTimeout(() => {
      setOrder(o);
      setStep(1);
      setBusy(false);
    }, 500);
  }

  async function runAnalysis() {
    setAnalysis(null);
    setStep(3);

    // Phase 1: Image Analysis
    setNovaPhase({
      id: "image_analysis",
      loadingText: "Nova is scanning your product images…",
      steps: ["Detecting scratches", "Checking visible damage", "Verifying product authenticity", "Estimating condition score"],
      successText: "Analysis complete.",
      successDesc: "Condition Score: 88/100\n\nProduct appears lightly used with no major defects.",
      state: "loading"
    });

    for (let i = 0; i < 4; i++) {
      setNovaStepIdx(i);
      await new Promise(r => setTimeout(r, 600));
    }
    setNovaStepIdx(4);
    setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
    await new Promise(r => setTimeout(r, 1500));

    // Phase 2: Fraud Detection
    setNovaPhase({
      id: "fraud_check",
      loadingText: "Nova is verifying return legitimacy...",
      steps: ["Checking account trust score...", "Analyzing historical return behavior...", "Scanning uploaded images for anomalies...", "Running fraud detection model..."],
      successText: "Return verified.",
      successDesc: "Trust Score: 92/100\n\nNo suspicious patterns detected.",
      failedText: forceFraud ? "Return flagged for manual review." : "Additional verification required.",
      failedDesc: forceFraud ? "Detected unusual return behavior.\n\nOur team will verify this request shortly." : "Detected:\n• High return frequency\n• Multiple electronics returns in 14 days\n\nPlease upload one additional image.",
      state: "loading"
    });

    for (let i = 0; i < 4; i++) {
      setNovaStepIdx(i);
      await new Promise(r => setTimeout(r, 600));
    }
    setNovaStepIdx(4);

    let fraudDecision = 'APPROVE';
    try {
      const fRes = await fetch('/api/fraud-check', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'u123',
          productCategory: order?.product?.category,
          claimNotes: 'Scratched during shipping',
          imageUrl: order?.product?.image_url,
          forceFraudSim: forceFraud
        })
      });
      const fData = await fRes.json();
      if (fData.success) {
        setFraudResult(fData.data);
        fraudDecision = fData.data.decision_tier;
      }
    } catch (e) {}

    if (fraudDecision === 'HOLD_REFUND') {
      setNovaPhase(prev => prev ? { ...prev, state: "failed" } : null);
      await new Promise(r => setTimeout(r, 2000));
      setStep(99);
      return;
    } else if (fraudDecision === 'REQUEST_PROOF') {
      setNovaPhase(prev => prev ? { ...prev, state: "failed" } : null);
      await new Promise(r => setTimeout(r, 2000));
    } else {
      setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
      await new Promise(r => setTimeout(r, 1500));
    }

    // Phase 3: Hyperlocal Search
    setNovaPhase({
      id: "hyperlocal_search",
      loadingText: "Nova is searching for buyers near you...",
      steps: ["Scanning demand...", "Checking users interested in electronics...", "Matching resale probability..."],
      successText: "14 nearby buyers found.",
      successDesc: "Highest demand:\n• Andheri\n• Powai\n• Bandra\n\nEstimated resale time: 7 hours",
      state: "loading"
    });
    for (let i = 0; i < 3; i++) { setNovaStepIdx(i); await new Promise(r => setTimeout(r, 500)); }
    setNovaStepIdx(3);
    setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
    await new Promise(r => setTimeout(r, 1500));

    // Phase 4: Carbon Savings
    setNovaPhase({
      id: "carbon_savings",
      loadingText: "Nova is measuring environmental impact...",
      steps: ["Calculating avoided transportation emissions...", "Comparing warehouse vs local resolution..."],
      successText: "Sustainable choice confirmed.",
      successDesc: "You avoided:\n2.3 kg CO₂ emissions\n\nEquivalent to charging a smartphone 280 times.",
      state: "loading"
    });
    for (let i = 0; i < 2; i++) { setNovaStepIdx(i); await new Promise(r => setTimeout(r, 500)); }
    setNovaStepIdx(2);
    setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
    await new Promise(r => setTimeout(r, 1500));
    setNovaPhase(null);

    // Set Final Result
    const mockAnalysis = {
      status: "completed",
      result: {
        assessment: {
          grade: "B",
          grade_label: "Good Condition",
          confidence: 0.94,
          reasoning: "Minor scuffs on the exterior, but fully functional. Packaging is partially reusable.",
          severity: 3,
          product_type: order?.product?.title,
          damages: [{ label: "Surface Scratch", severity: 2 }]
        },
        model_used: "Qwen-VL Max",
        source: "vision",
        images: [{ url: order?.product?.image_url, kind: "image", role: "item" }],
        packaging: {
          packagingGrade: "B+",
          reusable: "YES",
          recyclability: 85,
          packagingWasteScore: 12,
          recommendations: "Box is structurally sound. Recommend re-taping and reusing for next fulfillment to save 1.2kg CO2."
        },
        rde: {
          confidence: 92,
          explanation: "Reselling As-Is yields the highest net profit while preserving significant carbon savings.",
          matrix: {
            resell_as_is: { profit: 240, carbon_savings: 18.5, waste_reduction: 100 },
            refurbish_resell: { profit: 210, carbon_savings: 24, waste_reduction: 100 },
            donate: { tax_benefit: 150, impact_score: 85, carbon_savings: 18.5 },
            recycle: { tax_benefit: 0, impact_score: 40, carbon_savings: 5.2 }
          }
        },
        recommended: "resell",
        options: [
          { path: "refund", money: order?.purchase_price, green_credits: 0, carbon_saved_kg: 0, time: "3–5 days", note: "Standard return." },
          { path: "resell", money: 240, green_credits: 450, carbon_saved_kg: 18.5, time: "~8 days to sale", note: "AI matches with next owner." },
          { path: "donate", money: 0, tax_receipt_value: 150, green_credits: 800, carbon_saved_kg: 18.5, time: "1–2 days", note: "Instant tax receipt." },
          { path: "repair", money: 210, green_credits: 600, carbon_saved_kg: 24, time: "5–10 days", note: "Refurbish to boost value." }
        ],
        ngo_recommendations: [
          { name: "Tech For Kids", distance_miles: 4, impact_score: 95, reason: "High demand for educational electronics.", beneficiary_type: "Students" },
          { name: "Goodwill", distance_miles: 12, impact_score: 70, reason: "General donation center.", beneficiary_type: "Community" }
        ],
        buyer_preview: {
          routing: "local_node",
          matches: [
            { buyer_label: "Alex M.", location: "Seattle, WA", distance_miles: 15, match_score: 94, purchaseProbability: 88, outreachSuggestion: "Alex recently browsed similar headphones. Contextual bandit recommends push notification at 5 PM.", outreachChannel: "Push", outreachTiming: "5:00 PM", two_tower_similarity: 0.89 }
          ]
        }
      }
    };

    setAnalysis(mockAnalysis);
    setSelectedNgo(mockAnalysis.result.ngo_recommendations[0].name);
    setStep(4);
  }

  async function decide(path: string) {
    setBusy(true);
    
    if (path === "refund") {
      setNovaPhase({
        id: "refund_processing",
        loadingText: "Nova is calculating refund alternatives...",
        steps: ["Evaluating product condition...", "Comparing reverse logistics cost...", "Checking profit thresholds..."],
        successText: "Better option found.",
        successDesc: "You can keep this item.\n\nPartial Refund: ₹720\nNo pickup required.",
        failedText: "Refund initiated successfully.",
        failedDesc: "Amount: ₹2499\nExpected credit time: 2-4 business days",
        state: "loading"
      });
      for (let i = 0; i < 3; i++) { setNovaStepIdx(i); await new Promise(r => setTimeout(r, 600)); }
      setNovaStepIdx(3);
      setNovaPhase(prev => prev ? { ...prev, state: order?.purchase_price < 200 ? "success" : "failed" } : null);
      await new Promise(r => setTimeout(r, 2000));
    } else if (path === "resell") {
      setNovaPhase({
        id: "route_matching",
        loadingText: "Nova is checking Amazon delivery routes…",
        steps: ["Scanning tomorrow’s delivery vehicles...", "Checking nearby route availability...", "Verifying vehicle capacity...", "Calculating route deviation cost..."],
        successText: "Eco Pickup Available.",
        successDesc: "Amazon delivery partner already visiting your area tomorrow.\n\nPickup Slot: 2 PM – 5 PM\nCarbon Saved: 1.4 kg CO₂",
        state: "loading"
      });
      for (let i = 0; i < 4; i++) { setNovaStepIdx(i); await new Promise(r => setTimeout(r, 600)); }
      setNovaStepIdx(4);
      setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
      await new Promise(r => setTimeout(r, 2000));
      
      try {
        const currentListings = JSON.parse(localStorage.getItem('ara_listings') || '[]');
        const newItem = {
          id: `ret-${Date.now()}`,
          name: `Certified Pre-Owned: ${order?.product?.title}`,
          category: order?.product?.category || "Electronics",
          resalePrice: 240,
          originalPrice: order?.purchase_price || 399,
          condition: "good",
          conditionNotes: "AI Verified condition. Minor scuffs.",
          image: order?.product?.image_url,
          sellerName: "You (Trader)",
          co2SavedKg: 18.5,
          healthCard: { cosmeticScore: 8, batteryHealth: 100, warrantyStatus: "Certified Resale", raw: null }
        };
        localStorage.setItem('ara_listings', JSON.stringify([newItem, ...currentListings]));
      } catch (e) {}
    } else if (path === "donate") {
      setNovaPhase({
        id: "donation_flow",
        loadingText: "Nova is finding nearby donation centers...",
        steps: ["Scanning verified NGOs...", "Checking collection partners...", "Finding nearest donation bin..."],
        successText: "Donation route found.",
        successDesc: "Nearest NGO:\nHelping Hands Foundation\n\nDistance: 4.2 km\nWorker pickup available tomorrow.",
        state: "loading"
      });
      for (let i = 0; i < 3; i++) { setNovaStepIdx(i); await new Promise(r => setTimeout(r, 600)); }
      setNovaStepIdx(3);
      setNovaPhase(prev => prev ? { ...prev, state: "success" } : null);
      await new Promise(r => setTimeout(r, 2000));
    }

    setNovaPhase(null);
    setResult({
      path,
      refund_amount: path === "refund" ? order?.purchase_price : undefined,
      listing: path === "resell" ? { title: `Certified Pre-Owned: ${order?.product?.title}`, description: "AI Verified condition. Minor scuffs.", expected_sale_time_days: 8, ai_source: "ai" } : undefined,
      donation: path === "donate" ? { ngo_name: selectedNgo, tax_receipt_id: "TX-9921", fair_market_value: 150, tax_benefit: 45 } : undefined,
      carbon: { carbon_saved_kg: 18.5 },
      green_credits_earned: path === "donate" ? 800 : path === "resell" ? 450 : 0,
      new_gc_balance: 1250,
      buyer_matches: path === "resell" ? analysis?.result?.buyer_preview : undefined
    });
    setStep(5);
    setBusy(false);
  }

  function reset() {
    setStep(0); setOrder(null); setFiles([]); setPkgFiles([]);
    setProgress(null); setAnalysis(null); setResult(null); setSelectedNgo("");
  }

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto pb-20">
      <div className="w-full">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-8 h-8 text-sky-600" /> Smart Return Wizard
            </h1>
            <Stepper step={step} />
          </div>
          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200">
            <input type="checkbox" id="fraud-sim" checked={forceFraud} onChange={(e) => setForceFraud(e.target.checked)} className="rounded text-rose-500 focus:ring-rose-500" />
            <label htmlFor="fraud-sim" className="text-xs font-bold text-slate-700 cursor-pointer">Simulate High Fraud Risk</label>
          </div>
        </div>

        {step === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Select an item to return</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {orders.map((o) => (
                <button key={o.id} disabled={busy} onClick={() => pickOrder(o)}
                  className="flex items-center gap-4 text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-amazon-orange hover:shadow-md transition disabled:opacity-50 cursor-pointer">
                  <img src={o.product?.image_url} alt="" className="h-20 w-20 rounded-lg object-cover border border-slate-100" />
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-slate-900 line-clamp-2 leading-snug">{o.product?.title}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1">{o.order_number}</div>
                    <div className="text-xs font-medium text-slate-600 mt-1 flex items-center gap-1">
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{o.product?.brand}</span>
                      <span>• paid ₹{o.purchase_price}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && order && (
          <UploadStep 
            order={order} files={files} setFiles={setFiles} 
            title="Upload Item Condition Photos" 
            subtitle="Upload clear photos of the physical product, focusing on any scuffs, cracks, or damages."
            onContinue={() => setStep(2)} 
          />
        )}

        {step === 2 && order && (
          <UploadStep 
            order={order} files={pkgFiles} setFiles={setPkgFiles} 
            title="Upload Packaging Photos" 
            subtitle="Add photos of the packaging box (Front, Back, Inside, and Barcode) for AI reusability analysis."
            onContinue={runAnalysis} showBack={true} onBack={() => setStep(1)}
          />
        )}

        {step === 3 && novaPhase !== null && <NovaProgressOverlay phase={novaPhase} activeStepIndex={novaStepIdx} />}

        {step === 4 && analysis && !result && (
          novaPhase !== null ? (
            <div className="mt-8">
              <NovaProgressOverlay phase={novaPhase} activeStepIndex={novaStepIdx} />
            </div>
          ) : (
            <AnalysisOutcome 
              analysis={analysis} fraudResult={fraudResult} selectedNgo={selectedNgo} setSelectedNgo={setSelectedNgo} 
              onDecide={decide} onAddPhotos={() => setStep(1)} busy={busy} 
            />
          )
        )}

        {step === 5 && result && (
          <PickupStep 
            onConfirm={() => {
              setBusy(true);
              setTimeout(() => {
                setBusy(false);
                setStep(6);
              }, 800);
            }} 
            busy={busy}
          />
        )}

        {step === 99 && fraudResult?.decision_tier === 'HOLD_REFUND' && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-8 text-center shadow-sm max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-rose-800 mb-2">Return Processing Suspended</h2>
            <p className="text-rose-700 font-medium mb-6">Our automated security systems have flagged this return request for manual review due to anomalous account activity.</p>
            <div className="bg-white p-4 rounded-lg border border-rose-200 text-left space-y-2 mb-6">
              <div className="text-sm font-bold text-slate-800">Reference ID: REF-992104-X</div>
              <div className="text-xs text-slate-600">Your refund has been temporarily placed on hold. A customer service agent will review the images and details provided within 24-48 hours. You may be asked to provide additional proof of purchase.</div>
            </div>
            <button onClick={reset} className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-8 py-3 rounded-lg shadow-sm transition">
              Acknowledge & Return Home
            </button>
          </div>
        )}

        {step === 6 && result && <ResultView order={order} result={result} fraudResult={fraudResult} onReset={reset} />}
        
      </div>
    </div>
  );
}

function Stepper({ step }: { step: number }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {STEPS.map((s, i) => {
        const isPast = i < step;
        const isCurrent = i === step;
        return (
          <span key={s} className={`px-3 py-1 text-xs font-bold rounded-full border flex items-center gap-1.5 ${
            isCurrent ? "bg-sky-50 text-sky-700 border-sky-200" :
            isPast ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            "bg-white text-slate-400 border-slate-200"
          }`}>
            {isPast ? <CheckCircle className="w-3.5 h-3.5" /> : <span>{i + 1}.</span>}
            {s}
          </span>
        );
      })}
    </div>
  );
}

function UploadStep({ order, files, setFiles, title, subtitle, onContinue, showBack = false, onBack }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const add = (list: FileList | null) => {
    if (list) setFiles([...files, ...Array.from(list)].slice(0, 8));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
        <img src={order.product?.image_url} alt="" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
        <div>
          <div className="font-extrabold text-slate-900">{order.product?.title}</div>
          <div className="text-sm font-medium text-slate-500">{order.order_number}</div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-black text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 font-medium mt-1">{subtitle}</p>
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer border-2 border-dashed rounded-xl text-center transition py-10 ${
          drag ? "border-sky-500 bg-sky-50" : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100"
        }`}>
        <Upload className={`w-8 h-8 mx-auto mb-3 ${drag ? 'text-sky-600' : 'text-slate-400'}`} />
        <div className="text-base font-extrabold text-slate-700">Drop photos or video here</div>
        <div className="mt-1 text-sm text-slate-500 font-medium">or click to browse</div>
        <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => add(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {files.map((f: File, i: number) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(f)} alt="" className="h-24 w-full rounded-lg object-cover border border-slate-200" />
              <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter((_: any, j: number) => j !== i)); }}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-white font-bold text-xs shadow-md opacity-0 group-hover:opacity-100 transition">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        {showBack && (
          <button onClick={onBack} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-5 py-2.5 rounded-lg shadow-sm transition">
            Back
          </button>
        )}
        <button onClick={onContinue} disabled={files.length === 0} 
          className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-black px-6 py-2.5 rounded-lg shadow-sm border border-[#a88734] transition disabled:opacity-50">
          Continue
        </button>
        <span className="text-sm font-medium text-slate-500">{files.length} file(s) uploaded.</span>
      </div>
    </div>
  );
}

// AnalysisProgress replaced by NovaProgressOverlay

function AnalysisOutcome({ analysis, fraudResult, selectedNgo, setSelectedNgo, onDecide, onAddPhotos, busy }: any) {
  const r = analysis.result;
  const a = r.assessment;
  const recommended = r.recommended;

  return (
    <div className="space-y-6">
      
      {fraudResult && fraudResult.decision_tier === 'MANUAL_REVIEW' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
          <div>
            <div className="font-bold text-amber-800">Return Flagged for Manual Review</div>
            <div className="text-sm text-amber-700 mt-1">We can proceed with the return, but your refund will not be issued until our warehouse physically receives and verifies the item.</div>
          </div>
        </div>
      )}

      {fraudResult && fraudResult.decision_tier === 'REQUEST_PROOF' && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3 shadow-sm">
          <AlertCircle className="w-6 h-6 text-blue-500 shrink-0" />
          <div>
            <div className="font-bold text-blue-800">Additional Verification Requested</div>
            <div className="text-sm text-blue-700 mt-1">To process your refund instantly, please upload a short video showing the serial number of the device.</div>
            <button className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded">Upload Video Verification</button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Visual Inspection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="mb-4 font-black text-slate-900 flex items-center gap-2">
            <Camera className="w-5 h-5 text-sky-600" /> AI Visual Inspection
          </h3>
          <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-48 flex items-center justify-center">
            <img src={r.images[0].url} alt="" className="h-full object-contain mix-blend-multiply" />
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 border-t border-slate-200 flex flex-wrap gap-2">
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                Surface Scratch (Sev 2/10)
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 border border-slate-100 p-3 rounded-lg">
            <div>
              <div className="text-sm font-extrabold text-slate-900">{a.grade_label}</div>
              <div className="text-xs font-semibold text-slate-500">{Math.round(a.confidence * 100)}% conf · Inspected by {r.model_used}</div>
            </div>
            <div className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-black px-3 py-1 rounded text-sm">
              Grade {a.grade}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600 font-medium leading-relaxed">{a.reasoning}</p>
        </div>

        {/* Packaging Intelligence */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="mb-4 font-black text-slate-900 flex items-center gap-2">
            <Box className="w-5 h-5 text-sky-600" /> Packaging Intelligence
          </h3>
          <div className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-extrabold text-slate-700">Reusability Status:</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                {r.packaging.reusable}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white border border-slate-200 p-3 rounded-lg text-center">
                <div className="text-lg font-black text-emerald-600">{r.packaging.recyclability}%</div>
                <div className="text-xs font-bold text-slate-500">Recyclability</div>
              </div>
              <div className="bg-white border border-slate-200 p-3 rounded-lg text-center">
                <div className="text-lg font-black text-rose-600">{r.packaging.packagingWasteScore}</div>
                <div className="text-xs font-bold text-slate-500">Waste Score</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 font-medium bg-white border border-slate-200 p-3 rounded-lg italic">
              " {r.packaging.recommendations} "
            </div>
          </div>
        </div>
      </div>

      {/* RDE Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="mb-4 font-black text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amazon-orange" /> Refurbishment Decision Matrix
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`p-4 rounded-xl border-2 bg-white ${recommended === "resell" ? "border-amazon-orange shadow-md" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Resell As-Is</span>
              {recommended === "resell" && <span className="bg-amazon-orange text-slate-900 text-[10px] font-black px-1.5 py-0.5 rounded">RECOMMENDED</span>}
            </div>
            <div className="text-2xl font-black text-slate-900">₹{r.rde.matrix.resell_as_is.profit}</div>
            <div className="text-xs font-bold text-slate-400 mb-3">Net Profit</div>
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {r.rde.matrix.resell_as_is.carbon_savings}kg CO₂ saved
            </div>
          </div>
          {/* Add others similarly */}
          <div className={`p-4 rounded-xl border-2 bg-white ${recommended === "repair" ? "border-amazon-orange shadow-md" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Refurbish</span>
            </div>
            <div className="text-2xl font-black text-slate-900">₹{r.rde.matrix.refurbish_resell.profit}</div>
            <div className="text-xs font-bold text-slate-400 mb-3">Net Profit</div>
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {r.rde.matrix.refurbish_resell.carbon_savings}kg CO₂ saved
            </div>
          </div>
          <div className={`p-4 rounded-xl border-2 bg-white ${recommended === "donate" ? "border-amazon-orange shadow-md" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Donate</span>
            </div>
            <div className="text-2xl font-black text-sky-600">₹{r.rde.matrix.donate.tax_benefit}</div>
            <div className="text-xs font-bold text-slate-400 mb-3">Tax Benefit</div>
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {r.rde.matrix.donate.carbon_savings}kg CO₂ saved
            </div>
          </div>
          <div className={`p-4 rounded-xl border-2 bg-white ${recommended === "recycle" ? "border-amazon-orange shadow-md" : "border-slate-100"}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Recycle</span>
            </div>
            <div className="text-2xl font-black text-rose-600">0 kg</div>
            <div className="text-xs font-bold text-slate-400 mb-3">Landfill</div>
            <div className="text-xs font-medium text-emerald-700 flex items-center gap-1">
              <Leaf className="w-3 h-3" /> {r.rde.matrix.recycle.carbon_savings}kg CO₂ saved
            </div>
          </div>
        </div>
      </div>

      {/* Final Decision Options */}
      <div>
        <h3 className="mb-4 text-xl font-black text-slate-900">Choose Next Steps</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {r.options.map((o: any) => (
            <div key={o.path} className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition hover:shadow-md ${
              o.path === recommended ? "border-amazon-orange shadow-sm ring-1 ring-amazon-orange" : "border-slate-200"
            }`}>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-black text-slate-900 capitalize">{o.path}</span>
                  {o.path === recommended && <span className="bg-amazon-orange text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full">AI Pick</span>}
                </div>
                <div className="text-2xl font-black text-emerald-700 mb-2">
                  {o.path === 'donate' ? `FMV ₹${o.tax_receipt_value}` : `₹${o.money}`}
                </div>
                <ul className="text-xs font-medium text-slate-500 space-y-1 mb-4">
                  <li className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> {o.carbon_saved_kg} kg CO₂ saved</li>
                  <li className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-slate-400" /> {o.time}</li>
                </ul>
              </div>
              <button disabled={busy} onClick={() => onDecide(o.path)} 
                className={`w-full py-2 rounded-lg font-bold text-sm transition disabled:opacity-50 ${
                  o.path === recommended ? "bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734]" : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                }`}>
                {busy ? "Processing..." : `Select ${o.path}`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PickupStep({ onConfirm, busy }: any) {
  const [slot, setSlot] = useState("");

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm max-w-2xl mx-auto w-full">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 opacity-20"><Leaf className="w-20 h-20 text-emerald-600" /></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Eco Pickup Available
            </span>
          </div>
          <h2 className="text-xl font-black text-emerald-900 mb-2">Amazon Delivery Partner in Your Area</h2>
          <p className="text-emerald-700 font-medium text-sm">An Amazon van (Route VAN-MH-14-882) is already scheduled to deliver packages near your address tomorrow. By bundling your return with this existing route, you prevent a separate vehicle trip!</p>
          <div className="mt-4 flex items-center gap-4 bg-white/60 p-3 rounded-lg border border-emerald-100">
            <div className="flex-1 text-center">
              <div className="text-emerald-600 font-black text-lg">1.2 kg</div>
              <div className="text-emerald-800 text-xs font-bold uppercase">CO₂ Saved</div>
            </div>
            <div className="w-px h-8 bg-emerald-200"></div>
            <div className="flex-1 text-center">
              <div className="text-emerald-600 font-black text-lg">+25</div>
              <div className="text-emerald-800 text-xs font-bold uppercase">Green Points</div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="font-black text-slate-900 mb-3">Select Eco-Pickup Slot (Tomorrow)</h3>
      <div className="grid gap-3 mb-6">
        {["10 AM - 1 PM", "2 PM - 5 PM"].map(s => (
          <button 
            key={s} 
            onClick={() => setSlot(s)}
            className={`p-4 rounded-xl border-2 text-left font-bold transition flex items-center justify-between ${
              slot === s ? 'border-sky-500 bg-sky-50 text-sky-900' : 'border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <span>{s}</span>
            {slot === s && <CheckCircle className="w-5 h-5 text-sky-500" />}
          </button>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button disabled={!slot || busy} onClick={onConfirm} className="bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 font-black px-8 py-3 rounded-lg shadow-sm border border-[#a88734] transition disabled:opacity-50">
          {busy ? "Scheduling..." : "Confirm Eco Pickup"}
        </button>
      </div>
    </div>
  );
}

function ResultView({ result, fraudResult, onReset }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-emerald-800">Return resolved via {result.path}!</h2>
        <p className="text-emerald-600 font-medium mt-2">Your item has been successfully processed by the SecondLife network.</p>
        
        {fraudResult && fraudResult.decision_tier === 'MANUAL_REVIEW' && (
          <div className="mt-4 inline-block bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2 rounded-lg text-sm font-bold">
            Refund will be processed after physical verification at the warehouse.
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {result.listing && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-sky-600" /> Listing Generated
            </h3>
            <div className="font-extrabold text-slate-800">{result.listing.title}</div>
            <p className="text-sm font-medium text-slate-500 mt-2">{result.listing.description}</p>
            <div className="mt-4 inline-block bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-slate-600">
              Expected sale in {result.listing.expected_sale_time_days} days
            </div>
          </div>
        )}

        {result.buyer_matches && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amazon-orange" /> Next Best Owner Engine
            </h3>
            {result.buyer_matches.matches.map((m: any, i: number) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-extrabold text-slate-900">{m.buyer_label}</span>
                  <span className="bg-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded text-xs">{m.purchaseProbability}% Prob</span>
                </div>
                <div className="text-xs font-medium text-slate-500 mb-3">{m.location} • {m.distance_miles} miles away</div>
                <div className="text-xs bg-white border border-slate-200 p-2 rounded italic text-slate-600 font-medium">
                  "{m.outreachSuggestion}"
                </div>
              </div>
            ))}
          </div>
        )}

        {result.carbon && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center items-center text-center">
            <Leaf className="w-10 h-10 text-emerald-500 mb-3" />
            <h3 className="font-black text-slate-900 text-lg">Verified Impact</h3>
            <div className="text-4xl font-black text-emerald-600 my-2">{result.carbon.carbon_saved_kg} kg CO₂</div>
            <div className="text-sm font-bold text-slate-500">+{result.green_credits_earned} Green Credits Earned</div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-6">
        <button onClick={onReset} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3 rounded-lg shadow-sm transition">
          Process Another Return
        </button>
      </div>
    </div>
  );
}
