'use client';

import React, { useState, useRef, useCallback } from 'react';
import {
  HelpCircle, Package, Sparkles, ShieldCheck,
  Play, Loader2, AlertCircle, ImagePlus,
} from 'lucide-react';
import type { UploadedImage, AngleLabel } from '@/lib/inspection';
import { ANGLE_LABELS } from '@/lib/inspection';
import type { InspectionReport } from '@/lib/inspection';
import UploadDropzone from '@/components/upload-dropzone';
import ImagePreviewGrid from '@/components/image-preview-grid';
import InspectionReportView from '@/components/inspection-report';

const MIN_IMAGES = 4;
const MAX_IMAGES = 6;

// Assign the next available angle label in order
function getNextAngle(existing: UploadedImage[]): AngleLabel {
  const used = existing.map((img) => img.angle);
  return ANGLE_LABELS.find((a) => !used.includes(a)) ?? ANGLE_LABELS[existing.length % ANGLE_LABELS.length];
}

export default function UploadPage() {
  // ── Form state (preserved from original) ──────────────────────────────────
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [conditionNotes, setConditionNotes] = useState('');

  // ── Multi-image upload state ───────────────────────────────────────────────
  const [images, setImages] = useState<UploadedImage[]>([]);

  // ── Inspection workflow state ──────────────────────────────────────────────
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionError, setInspectionError] = useState<string | null>(null);
  const [setupMessage, setSetupMessage] = useState<string | null>(null);
  const [report, setReport] = useState<InspectionReport | null>(null);

  // Ref to scroll back to upload zone when more images are needed
  const uploadZoneRef = useRef<HTMLDivElement>(null);

  // ── Image management ───────────────────────────────────────────────────────

  const handleFilesAdded = useCallback((files: File[]) => {
    setImages((prev) => {
      const toAdd = files.slice(0, MAX_IMAGES - prev.length);
      const newImages: UploadedImage[] = toAdd.map((file, i) => {
        const preview = URL.createObjectURL(file);
        const angle = getNextAngle([...prev, ...toAdd.slice(0, i).map((_, j) => ({
          id: '', file, preview: '', angle: ANGLE_LABELS[j],
        }))]);
        return {
          id: `${Date.now()}-${i}-${file.name}`,
          file,
          preview,
          angle,
        };
      });
      return [...prev, ...newImages];
    });
    // Reset previous report when images change
    setReport(null);
    setInspectionError(null);
    setSetupMessage(null);
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setImages((prev) => {
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((img) => img.id !== id);
    });
    setReport(null);
  }, []);

  const handleAngleChange = useCallback((id: string, angle: AngleLabel) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, angle } : img));
  }, []);

  // ── Inspection submission ──────────────────────────────────────────────────

  const handleRunInspection = async () => {
    if (images.length < MIN_IMAGES) return;
    if (!productName.trim()) return;

    setIsInspecting(true);
    setInspectionError(null);
    setSetupMessage(null);
    setReport(null);

    try {
      const formData = new FormData();
      formData.append('productName', productName.trim());
      formData.append('category', category);
      formData.append('conditionNotes', conditionNotes.trim());

      images.forEach((img, idx) => {
        formData.append(`image_${idx}`, img.file, img.file.name);
        formData.append(`angle_${idx}`, img.angle);
      });

      const res = await fetch('/api/inspection', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.setup_message) {
          setSetupMessage(data.setup_message);
        } else {
          setInspectionError(data.error || 'Inspection failed. Please try again.');
        }
        return;
      }

      setReport(data.report);

      // Auto-scroll to report
      setTimeout(() => {
        const reportEl = document.getElementById('inspection-report');
        reportEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setInspectionError('Network error — please check your connection and try again.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleRequestMoreImages = () => {
    setReport(null);
    uploadZoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const imageCount = images.length;
  const canInspect = imageCount >= MIN_IMAGES && productName.trim().length > 0 && !isInspecting;
  const isUnderMin = imageCount > 0 && imageCount < MIN_IMAGES;

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">

        {/* Page Header */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            SecondLife Trade-In Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Upload 4–6 images of your product from different angles. Our Gemini Vision AI will
            analyze each view and generate a detailed inspection report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: Main Upload Form ───────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-slate-50/50 border border-slate-250 rounded-xl p-6 shadow-sm space-y-6">

            {/* ── A) Multi-Image Upload Area ────────────────────────────────── */}
            <div ref={uploadZoneRef}>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">
                  Product Images
                  <span className="ml-1.5 text-[10px] font-normal text-slate-400">(4–6 required)</span>
                </label>
                {/* Upload counter badge */}
                <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border tabular-nums transition-colors ${
                  imageCount === 0
                    ? 'bg-slate-100 text-slate-500 border-slate-300'
                    : imageCount < MIN_IMAGES
                    ? 'bg-amber-100 text-amber-700 border-amber-300'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                }`}>
                  {imageCount} / {MAX_IMAGES} images
                </span>
              </div>

              {/* Dropzone */}
              <UploadDropzone
                onFilesAdded={handleFilesAdded}
                currentCount={imageCount}
                maxImages={MAX_IMAGES}
                disabled={isInspecting}
              />

              {/* Under-minimum warning */}
              {isUnderMin && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Add {MIN_IMAGES - imageCount} more image{MIN_IMAGES - imageCount !== 1 ? 's' : ''} to enable inspection.
                    Cover different angles for better accuracy.
                  </span>
                </div>
              )}

              {/* Image preview grid */}
              {imageCount > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ImagePlus className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">
                      Uploaded images — select the angle for each
                    </span>
                  </div>
                  <ImagePreviewGrid
                    images={images}
                    onRemove={handleRemoveImage}
                    onAngleChange={handleAngleChange}
                  />
                </div>
              )}
            </div>

            {/* ── B) Product Name ────────────────────────────────────────────── */}
            <div>
              <label htmlFor="productName" className="block text-sm font-bold text-slate-700 mb-1.5">
                Product Name
              </label>
              <input
                id="productName"
                type="text"
                required
                placeholder="e.g. Apple iPad Pro 11-inch (3rd Gen) 128GB Wi-Fi"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                disabled={isInspecting}
                className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-amazon-orange disabled:opacity-60"
              />
            </div>

            {/* ── C) Category + AI Assessment Standard ──────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isInspecting}
                  className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange bg-white cursor-pointer disabled:opacity-60"
                >
                  <option>Electronics</option>
                  <option>Home &amp; Kitchen</option>
                  <option>Apparel</option>
                  <option>Books/Media</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  AI Assessment Standard{' '}
                  <span title="SecondLife grades products using Gemini Vision AI.">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                  </span>
                </label>
                <div className="w-full border border-slate-200 bg-white text-slate-600 rounded-lg px-3 py-2.5 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span>Gemini Vision Inspector v1</span>
                </div>
              </div>
            </div>

            {/* ── D) Condition Notes ─────────────────────────────────────────── */}
            <div>
              <label htmlFor="conditionNotes" className="block text-sm font-bold text-slate-700 mb-1.5">
                Condition Notes &amp; Wear Details
              </label>
              <textarea
                id="conditionNotes"
                rows={4}
                placeholder="Mention any scratches, missing parts, or signs of use (e.g. 'Minor scratching on bottom bezel, original box missing but power brick is included')."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                disabled={isInspecting}
                className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-amazon-orange resize-y disabled:opacity-60"
              />
            </div>

            {/* ── E) Setup message (missing API key) ─────────────────────────── */}
            {setupMessage && (
              <div className="flex items-start gap-3 p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
                <div>
                  <p className="font-extrabold mb-1">Setup Required</p>
                  <p className="leading-relaxed">{setupMessage}</p>
                </div>
              </div>
            )}

            {/* ── F) Inspection error ─────────────────────────────────────────── */}
            {inspectionError && (
              <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{inspectionError}</span>
              </div>
            )}

            {/* ── G) Run Inspection button ───────────────────────────────────── */}
            <button
              type="button"
              onClick={handleRunInspection}
              disabled={!canInspect}
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-black font-bold py-3.5 px-6 rounded-lg shadow hover:shadow-md transition text-sm flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isInspecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini Vision…
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Run Inspection
                  {imageCount < MIN_IMAGES && ` (need ${MIN_IMAGES - imageCount} more image${MIN_IMAGES - imageCount !== 1 ? 's' : ''})`}
                </>
              )}
            </button>
          </div>

          {/* ── Right: Info Panels (preserved from original) ──────────────────── */}
          <div className="space-y-6">
            <div className="bg-amazon-secondary text-white rounded-xl p-5 border border-slate-700 shadow-sm">
              <h3 className="font-bold text-base mb-3 flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-5 h-5 fill-amber-400/20" /> How scanning works
              </h3>
              <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
                <li className="flex gap-2">
                  <span className="text-[#10b981] font-bold">✔</span>
                  <span>
                    <strong>Multi-Angle Vision:</strong> Upload 4–6 photos from different angles.
                    Gemini inspects all images together for a complete 360° view.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#10b981] font-bold">✔</span>
                  <span>
                    <strong>Defect Detection:</strong> AI identifies scratches, dents, discoloration,
                    missing parts, and structural damage across all views.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#10b981] font-bold">✔</span>
                  <span>
                    <strong>Smart Routing:</strong> Receive a final recommendation — relist,
                    refurbish, donate, exchange, or recycle — with full reasoning.
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-250 rounded-xl p-5 bg-slate-50 shadow-sm space-y-4">
              <h4 className="font-bold text-sm text-slate-900">Circularity Guarantee</h4>
              <p className="text-xs text-slate-600 leading-normal">
                By uploading items to Amazon SecondLife, you support landfill diversion and help
                extend physical product lifecycles. Once approved, you receive immediate trade-in
                credit usable across Amazon.
              </p>
              <div className="flex gap-2 items-center text-[10px] text-slate-500 font-bold border-t border-slate-200 pt-3">
                <Package className="w-4 h-4 text-emerald-500" />
                <span>Certified Packaging Provided</span>
              </div>
            </div>

            {/* Live status panel — appears while inspecting */}
            {isInspecting && (
              <div className="border border-sky-200 bg-sky-50 rounded-xl p-5 space-y-3 animate-pulse">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-sky-600 animate-spin" />
                  <span className="text-xs font-extrabold text-sky-800">Gemini Vision Analyzing…</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-sky-700">
                  <li className="flex gap-1.5"><span className="text-sky-400">▸</span> Processing {imageCount} uploaded images</li>
                  <li className="flex gap-1.5"><span className="text-sky-400">▸</span> Scanning for defects across all angles</li>
                  <li className="flex gap-1.5"><span className="text-sky-400">▸</span> Computing condition &amp; confidence scores</li>
                  <li className="flex gap-1.5"><span className="text-sky-400">▸</span> Generating sustainability impact report</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Inspection Report (below the form, full width inside the card) ─── */}
        {report && (
          <div
            id="inspection-report"
            className="border-t border-slate-200 pt-6 mt-2"
          >
            <InspectionReportView
              report={report}
              onRequestMoreImages={handleRequestMoreImages}
            />
          </div>
        )}
      </div>
    </div>
  );
}
