'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShieldCheck, Sparkles, ArrowRight, RefreshCw, AlertTriangle, Cpu, Tag, FileText } from 'lucide-react';
import { Product, AIAnalysis } from '@/types';
import { getConditionColorClass, getConditionLabel } from '@/lib/utils';
import { ProductJourney } from '@/lib/inspection';
import { useNovaProductScan } from '@/src/components/nova/useNovaPage';
import NovaScanOverlay from '@/src/components/nova/NovaScanOverlay';

export default function AnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get('runId');

  const [product, setProduct] = useState<Product | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { novaStartScan, novaScanResult } = useNovaProductScan();
  const [scanning, setScanning] = useState(true);

  // Load the active product (from MongoDB via runId)
  useEffect(() => {
    const iv = novaStartScan();
    if (!runId) {
      const mockScore = 85;
      setProduct({
        id: 'demo-123',
        name: 'Echo Dot (4th Gen) - Demo',
        category: 'Electronics',
        conditionNotes: 'Small scratch on top',
        image: '/images/products/placeholder.jpg',
        condition: 'very_good',
        originalPrice: 49,
        resalePrice: 35,
        co2SavedKg: 12,
        wasteDivertedKg: 0.5,
        packagingSavedCount: 1,
        milesAvoided: 50,
        healthCard: {} as any,
        aiAnalysis: {
          conditionScore: mockScore,
          confidenceScore: 92,
          scratchDetection: 'Minor surface scratch detected on the upper housing.',
          damageAssessment: 'Pristine structural integrity. No dents found.',
          missingPartsAssessment: 'All primary hardware accessories identified.',
          overallRecommendation: 'Product is fully functional with minor cosmetic wear. Recommended for quick resale.'
        },
        routing: {} as any,
        status: 'RECEIVED',
        sellerName: 'Demo User',
        sellerRating: 5.0
      } as any);
      
      clearInterval(iv);
      setScanning(false);
      novaScanResult({ score: mockScore });
      return;
    }
    
    fetch(`/api/inspections/${runId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.journey) {
          const journey = data.journey as ProductJourney;
          const report = journey.inspectionReport;
          
          // Determine condition from score
          const score = report.overall_condition_score;
          let condition: Product['condition'] = 'like_new';
          if (score < 60) condition = 'acceptable';
          else if (score < 80) condition = 'good';
          else if (score < 90) condition = 'very_good';

          // Reconstruct mock AI analysis from report
          const aiAnalysis: AIAnalysis = {
            conditionScore: score,
            confidenceScore: report.confidence_score,
            scratchDetection: report.defects.find(d => d.type.toLowerCase().includes('scratch'))?.description || 'No surface scratches detected.',
            damageAssessment: report.defects.find(d => d.type.toLowerCase().includes('damage') || d.type.toLowerCase().includes('dent'))?.description || 'Pristine structural integrity.',
            missingPartsAssessment: report.defects.find(d => d.type.toLowerCase().includes('missing'))?.description || 'All primary hardware accessories identified.',
            overallRecommendation: report.reasoning
          };

          const mappedProduct = {
            id: journey.runId,
            name: journey.productName,
            category: journey.category,
            conditionNotes: journey.conditionNotes,
            image: journey.uploadedImages?.[0] || 'https://via.placeholder.com/600',
            condition,
            originalPrice: 0,
            resalePrice: 0,
            co2SavedKg: 0,
            wasteDivertedKg: 0,
            packagingSavedCount: 0,
            milesAvoided: 0,
            healthCard: {} as any,
            aiAnalysis,
            routing: {} as any,
            status: journey.lifecycleStatus,
            sellerName: journey.ownerLabel || 'User',
            sellerRating: 5.0
          };
          setProduct(mappedProduct as any);
          clearInterval(iv);
          setScanning(false);
          novaScanResult({ score });
        } else {
          router.push('/upload');
        }
      })
      .catch(err => {
        console.error('Failed to fetch journey', err);
        clearInterval(iv);
        setScanning(false);
        router.push('/upload');
      });
  }, [runId, router]);

  // Simple animation steps on page load
  useEffect(() => {
    if (!product) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 4) {
          clearInterval(interval);
          return 4;
        }
        return prev + 1;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [product]);

  if (!product) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Retrieving scanning logs...</p>
        </div>
      </div>
    );
  }

  const { aiAnalysis, condition, name, image, category } = product;

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 text-xs font-bold py-0.5 px-2 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> AI Diagnostic Log
            </span>
            <span className="text-slate-500 text-xs font-bold">ID: {product.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Scan Analysis
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/upload')}
            className="border border-slate-300 hover:border-slate-400 text-slate-700 bg-white font-bold py-2 px-4 rounded-lg transition text-xs cursor-pointer animate-pulse"
          >
            Scan Another Item
          </button>
          <Link
            href="/routing"
            className="bg-amazon-orange hover:bg-amazon-orange-hover text-black font-bold py-2 px-4 rounded-lg transition text-xs flex items-center gap-1.5 shadow"
          >
            Smart Routing Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Product Image & Condition Gauge */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scanned Image Showcase */}
          <div className="bg-slate-50 border border-slate-250 rounded-xl overflow-hidden shadow-sm relative group">
            <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded-md border border-slate-800 backdrop-blur-sm z-10 flex items-center gap-1.5 select-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Multi-Spectral Optical Scan
            </div>
            
            <div className="relative h-72 w-full bg-white flex items-center justify-center border-b border-slate-200">
              <NovaScanOverlay isScanning={scanning}>
                <img
                  src={image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                />
              </NovaScanOverlay>
            </div>
            
            <div className="p-4 bg-slate-100/70 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-bold">
              <span>Resolution: <strong>4K CCD Visual Spectrum</strong></span>
              <span>Scanning Latency: <strong>1,420ms</strong></span>
            </div>
          </div>

          {/* Condition Gauge Card */}
          <div className="bg-slate-50 border border-slate-250 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <h3 className="font-extrabold text-sm text-slate-900 mb-4 self-start">AI Condition Score</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* SVG Gauge Background */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke={aiAnalysis.conditionScore >= 80 ? '#10b981' : aiAnalysis.conditionScore >= 60 ? '#f59e0b' : '#f97316'}
                  strokeWidth="8"
                  strokeDasharray={`${2.64 * aiAnalysis.conditionScore} 264`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Gauge text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {aiAnalysis.conditionScore}
                </span>
                <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider mt-0.5">
                  out of 100
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 w-full flex justify-around text-xs font-bold">
              <div className="text-center">
                <p className="text-slate-500">Auto-Grade</p>
                <span className={`inline-block font-extrabold px-2.5 py-0.5 rounded-full border text-xs uppercase mt-1 ${getConditionColorClass(condition)}`}>
                  {getConditionLabel(condition)}
                </span>
              </div>
              <div className="text-center">
                <p className="text-slate-500">Confidence</p>
                <span className="inline-block bg-sky-50 text-sky-700 border border-sky-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs uppercase mt-1">
                  {aiAnalysis.confidenceScore}% Acc.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: AI Diagnostic Notes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-50 border border-slate-250 rounded-xl p-6 shadow-sm space-y-6">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/10" /> Neural Scanning Diagnostics
            </h3>

            {/* Diagnostic Categories */}
            <div className="space-y-4">
              {/* Scratch Detection */}
              <div className={`p-4 rounded-lg border transition duration-300 ${
                activeStep >= 1 ? 'bg-white border-slate-200 shadow-sm opacity-100' : 'bg-white/40 border-slate-100 opacity-40'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 border border-slate-200">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Scratch & Defect Mapping</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                      {activeStep >= 1 ? aiAnalysis.scratchDetection : 'Running raster filtering scan...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structural Damage */}
              <div className={`p-4 rounded-lg border transition duration-300 ${
                activeStep >= 2 ? 'bg-white border-slate-200 shadow-sm opacity-100' : 'bg-white/40 border-slate-100 opacity-40'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 border border-slate-200">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Chassis & Material Damage Assessment</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                      {activeStep >= 2 ? aiAnalysis.damageAssessment : 'Analyzing volumetric chassis meshes...'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Missing Parts */}
              <div className={`p-4 rounded-lg border transition duration-300 ${
                activeStep >= 3 ? 'bg-white border-slate-200 shadow-sm opacity-100' : 'bg-white/40 border-slate-100 opacity-40'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 border border-slate-200">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Inclusions & Package Auditing</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-normal font-medium">
                      {activeStep >= 3 ? aiAnalysis.missingPartsAssessment : 'Identifying bundled accessories...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendation Amber Callout */}
            <div className={`p-4 rounded-lg border border-amber-300 bg-amber-50/65 text-slate-800 space-y-2 transition duration-500 ${
              activeStep >= 4 ? 'scale-100 opacity-100' : 'scale-98 opacity-0'
            }`}>
              <h4 className="text-xs uppercase font-extrabold text-amazon-orange-hover flex items-center gap-1 tracking-wider">
                <AlertTriangle className="w-4 h-4 fill-amber-100" /> Overall System Recommendation
              </h4>
              <p className="text-xs font-bold leading-relaxed">
                {aiAnalysis.overallRecommendation}
              </p>
            </div>
          </div>

          {/* Action CTAs Dashboard card */}
          <div className="bg-amazon-secondary text-white rounded-xl p-6 border border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-left space-y-1">
              <span className="text-xs text-[#10b981] font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-4 h-4" /> Next Step Program
              </span>
              <h4 className="text-sm font-bold">Calculate Expected Recovery Value</h4>
              <p className="text-xs text-slate-300 max-w-sm">
                View carbon credits and resale logistics. Inspect how the AI routes this item.
              </p>
            </div>

            <div className="flex gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/health-card"
                className="flex items-center justify-center gap-1 border border-slate-500 hover:border-slate-400 bg-transparent text-white font-semibold py-2 px-4 rounded-lg transition text-xs w-full sm:w-auto"
              >
                <FileText className="w-3.5 h-3.5" /> Product Passport
              </Link>
              
              <Link
                href={`/routing?runId=${runId}`}
                className="flex items-center justify-center gap-1 bg-amazon-orange hover:bg-amazon-orange-hover text-black font-bold py-2.5 px-4.5 rounded-lg transition text-xs shadow w-full sm:w-auto"
              >
                Go to Smart Routing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
