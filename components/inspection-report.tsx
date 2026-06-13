'use client';

import React from 'react';
import {
  CheckCircle2, AlertTriangle, AlertCircle, XCircle,
  Camera, Leaf, TrendingDown, ChevronRight, RotateCcw,
  ShieldCheck, Eye, Zap, Package, Recycle, Heart, RefreshCw,
  ArrowUpRight, Info,
} from 'lucide-react';
import type { InspectionReport, FinalRecommendation, AngleAnalysis, InspectionDefect } from '@/lib/inspection';
import ScoreMetric from '@/components/score-metric';
import ReportSection from '@/components/report-section';

interface InspectionReportProps {
  report: InspectionReport;
  onRequestMoreImages: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getSeverityStyle(severity: 'low' | 'medium' | 'high') {
  return {
    low:    'bg-amber-50 text-amber-700 border-amber-300',
    medium: 'bg-orange-50 text-orange-700 border-orange-300',
    high:   'bg-rose-50 text-rose-700 border-rose-300',
  }[severity];
}

function getSeverityIcon(severity: 'low' | 'medium' | 'high') {
  return {
    low:    <Info className="w-3.5 h-3.5" />,
    medium: <AlertTriangle className="w-3.5 h-3.5" />,
    high:   <XCircle className="w-3.5 h-3.5" />,
  }[severity];
}

function getCoverageStyle(status: 'good' | 'partial' | 'missing') {
  return {
    good:    { badge: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: <CheckCircle2 className="w-3 h-3" /> },
    partial: { badge: 'bg-amber-100 text-amber-700 border-amber-300',    icon: <AlertCircle className="w-3 h-3" /> },
    missing: { badge: 'bg-rose-100 text-rose-700 border-rose-300',       icon: <XCircle className="w-3 h-3" /> },
  }[status];
}

const RECOMMENDATION_CONFIG: Record<FinalRecommendation, {
  label: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
}> = {
  relist: {
    label: 'Relist on Marketplace',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-400',
    icon: <ArrowUpRight className="w-5 h-5" />,
    description: 'Product is in good enough condition for direct resale.',
  },
  refurbish: {
    label: 'Send to Refurbishment',
    badge: 'bg-sky-100 text-sky-800 border-sky-400',
    icon: <RefreshCw className="w-5 h-5" />,
    description: 'Minor repairs or cleaning will significantly increase value.',
  },
  donate: {
    label: 'Donate to Community',
    badge: 'bg-violet-100 text-violet-800 border-violet-400',
    icon: <Heart className="w-5 h-5" />,
    description: 'Product is functional but resale value is low. Donation maximises circular impact.',
  },
  recycle: {
    label: 'Route to Recycling',
    badge: 'bg-slate-100 text-slate-700 border-slate-400',
    icon: <Recycle className="w-5 h-5" />,
    description: 'Product is beyond repair or resale. Material recovery is the best option.',
  },
  exchange: {
    label: 'Peer Exchange',
    badge: 'bg-amber-100 text-amber-800 border-amber-400',
    icon: <RotateCcw className="w-5 h-5" />,
    description: 'Best suited for direct peer-to-peer trade rather than marketplace listing.',
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ProductSummaryStrip({ report }: { report: InspectionReport }) {
  return (
    <div className="bg-[#19222d] text-white rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-slate-700">
      <div className="w-10 h-10 bg-amazon-secondary rounded-lg flex items-center justify-center shrink-0 border border-slate-600">
        <Package className="w-5 h-5 text-amazon-orange" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
          AI Inspection Report
        </p>
        <h2 className="text-sm font-extrabold text-white truncate leading-tight">
          {report.product_name}
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
          {report.summary}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <ShieldCheck className="w-4 h-4 text-[#10b981]" />
        <span className="text-[10px] font-bold text-[#10b981] uppercase tracking-wider">
          AI Verified
        </span>
      </div>
    </div>
  );
}

function ScorePanel({ report }: { report: InspectionReport }) {
  const isLowConfidence = report.confidence_score < 70;
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Condition Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center">
        <ScoreMetric
          label="Condition Score"
          score={report.overall_condition_score}
          size="lg"
          showBar={true}
        />
      </div>

      {/* Confidence Score */}
      <div className={`border rounded-xl p-4 shadow-sm flex flex-col items-center ${
        isLowConfidence ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'
      }`}>
        <ScoreMetric
          label="AI Confidence"
          score={report.confidence_score}
          size="lg"
          showBar={true}
          colorOverride={isLowConfidence ? 'text-amber-600' : undefined}
        />
        {isLowConfidence && (
          <div className="mt-2 text-center">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              More images needed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function AngleCoveragePanel({ angles }: { angles: AngleAnalysis[] }) {
  const good    = angles.filter((a) => a.coverage_status === 'good').length;
  const partial = angles.filter((a) => a.coverage_status === 'partial').length;
  const missing = angles.filter((a) => a.coverage_status === 'missing').length;

  return (
    <ReportSection title="Angle Coverage" icon={<Camera className="w-4 h-4" />} accent="sky">
      {/* Summary row */}
      <div className="flex gap-3 mb-3 flex-wrap">
        {[
          { label: 'Complete', count: good,    color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
          { label: 'Partial',  count: partial, color: 'bg-amber-100   text-amber-700   border-amber-300' },
          { label: 'Missing',  count: missing, color: 'bg-rose-100    text-rose-700    border-rose-300' },
        ].map((item) => (
          <span
            key={item.label}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${item.color}`}
          >
            {item.count} {item.label}
          </span>
        ))}
      </div>

      {/* Per-angle rows */}
      <div className="space-y-2">
        {angles.map((angle, idx) => {
          const cov = getCoverageStyle(angle.coverage_status);
          return (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg"
            >
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 mt-0.5 ${cov.badge}`}>
                {cov.icon} {angle.angle}
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">{angle.observations}</p>
            </div>
          );
        })}
      </div>
    </ReportSection>
  );
}

function DefectPanel({ defects }: { defects: InspectionDefect[] }) {
  if (defects.length === 0) {
    return (
      <ReportSection title="Defect Analysis" icon={<Eye className="w-4 h-4" />} accent="emerald">
        <div className="flex items-center gap-2 text-emerald-700 py-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-bold">No defects detected — product appears in excellent condition.</span>
        </div>
      </ReportSection>
    );
  }

  const high   = defects.filter((d) => d.severity === 'high');
  const medium = defects.filter((d) => d.severity === 'medium');
  const low    = defects.filter((d) => d.severity === 'low');

  return (
    <ReportSection title={`Defect Analysis · ${defects.length} found`} icon={<AlertTriangle className="w-4 h-4" />} accent="rose">
      {/* Severity summary bar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {high.length   > 0 && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-300">{high.length} High</span>}
        {medium.length > 0 && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 border border-orange-300">{medium.length} Medium</span>}
        {low.length    > 0 && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300">{low.length} Low</span>}
      </div>

      <div className="space-y-2.5">
        {defects.map((defect, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-3 ${getSeverityStyle(defect.severity)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              {getSeverityIcon(defect.severity)}
              <span className="text-xs font-extrabold">{defect.type}</span>
              <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getSeverityStyle(defect.severity)}`}>
                {defect.severity}
              </span>
            </div>
            <p className="text-xs leading-relaxed">{defect.description}</p>
            {defect.likely_location && (
              <p className="text-[10px] font-semibold mt-1 opacity-70">
                📍 {defect.likely_location}
              </p>
            )}
          </div>
        ))}
      </div>
    </ReportSection>
  );
}

function RecommendationPanel({ recommendation, reasoning }: { recommendation: FinalRecommendation; reasoning: string }) {
  const cfg = RECOMMENDATION_CONFIG[recommendation];
  return (
    <ReportSection title="Final Recommendation" icon={<Zap className="w-4 h-4" />} accent="amber">
      <div className="space-y-3">
        <div className={`flex items-center gap-3 p-3 rounded-xl border-2 ${cfg.badge}`}>
          <div className="shrink-0">{cfg.icon}</div>
          <div>
            <p className="font-extrabold text-sm">{cfg.label}</p>
            <p className="text-xs opacity-75 mt-0.5">{cfg.description}</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
          {reasoning}
        </p>
      </div>
    </ReportSection>
  );
}

function NextActionsPanel({ actions }: { actions: string[] }) {
  return (
    <ReportSection title="Next Actions" icon={<ChevronRight className="w-4 h-4" />} accent="sky">
      <ol className="space-y-2">
        {actions.map((action, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
            <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-extrabold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-sky-200">
              {idx + 1}
            </span>
            <span className="leading-relaxed">{action}</span>
          </li>
        ))}
      </ol>
    </ReportSection>
  );
}

function ResaleImpactPanel({ resale }: { resale: InspectionReport['resale_impact'] }) {
  return (
    <ReportSection title="Resale Impact" icon={<TrendingDown className="w-4 h-4" />} accent="violet">
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-600">Estimated Value Change</span>
          <span className="text-sm font-extrabold text-violet-700">{resale.estimated_value_change}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{resale.notes}</p>
      </div>
    </ReportSection>
  );
}

function SustainabilityPanel({ sustainability }: { sustainability: InspectionReport['sustainability_impact'] }) {
  return (
    <ReportSection title="Sustainability Impact" icon={<Leaf className="w-4 h-4" />} accent="emerald">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
            <p className="text-base font-extrabold text-emerald-700 leading-tight">
              {sustainability.estimated_co2_saved}
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">CO₂ Saved</p>
          </div>
          <div className="bg-teal-50 border border-teal-100 rounded-lg p-3 text-center">
            <p className="text-base font-extrabold text-teal-700 leading-tight">
              {sustainability.estimated_waste_diverted}
            </p>
            <p className="text-[10px] text-teal-600 font-semibold mt-0.5">Waste Diverted</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{sustainability.notes}</p>
      </div>
    </ReportSection>
  );
}

// ─── Low-Confidence Banner ───────────────────────────────────────────────────

function LowConfidenceBanner({
  missingImages,
  confidenceScore,
  onRequestMore,
}: {
  missingImages: string[];
  confidenceScore: number;
  onRequestMore: () => void;
}) {
  return (
    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <h3 className="text-sm font-extrabold text-amber-900">Additional Images Required</h3>
          <p className="text-xs text-amber-700 mt-0.5">
            Confidence is {confidenceScore}% — below the 70% threshold for a complete report.
            Upload the missing views below to get a full inspection.
          </p>
        </div>
      </div>

      {missingImages.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
            Missing or unclear angles:
          </p>
          <ul className="space-y-1">
            {missingImages.map((img, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-amber-800">
                <XCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {img}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onRequestMore}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2.5 px-4 rounded-lg shadow transition flex items-center justify-center gap-2"
      >
        <Camera className="w-4 h-4" /> Upload Additional Images
      </button>
    </div>
  );
}

// ─── Main Report Component ───────────────────────────────────────────────────

export default function InspectionReportView({
  report,
  onRequestMoreImages,
}: InspectionReportProps) {
  const isLowConfidence = report.confidence_score < 70;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          {isLowConfidence ? (
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          )}
          {isLowConfidence ? 'Partial Report — More Data Needed' : 'Inspection Report Ready'}
        </h2>
        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          isLowConfidence
            ? 'bg-amber-50 text-amber-700 border-amber-300'
            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
        }`}>
          {isLowConfidence ? 'Incomplete' : 'Complete'}
        </span>
      </div>

      {/* 1. Product Summary */}
      <ProductSummaryStrip report={report} />

      {/* 2. Score panels */}
      <ScorePanel report={report} />

      {/* 3. Low-confidence warning (shown before full report when confidence < 70) */}
      {isLowConfidence && (
        <LowConfidenceBanner
          missingImages={report.missing_images_needed}
          confidenceScore={report.confidence_score}
          onRequestMore={onRequestMoreImages}
        />
      )}

      {/* 4. Angle Coverage */}
      <AngleCoveragePanel angles={report.angle_analysis} />

      {/* 5. Defect Breakdown */}
      <DefectPanel defects={report.defects} />

      {/* 6. Final recommendation (only shown at high confidence) */}
      {!isLowConfidence && (
        <>
          <RecommendationPanel
            recommendation={report.final_recommendation}
            reasoning={report.reasoning}
          />

          {/* 7. Next Actions */}
          {report.next_actions?.length > 0 && (
            <NextActionsPanel actions={report.next_actions} />
          )}

          {/* 8. Resale Impact */}
          <ResaleImpactPanel resale={report.resale_impact} />

          {/* 9. Sustainability Impact */}
          <SustainabilityPanel sustainability={report.sustainability_impact} />
        </>
      )}

      {/* Low-confidence still shows partial data so the user can see what was found */}
      {isLowConfidence && report.defects?.length > 0 && (
        <div className="opacity-60 pointer-events-none space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
            — Partial data below (upload more images for full report) —
          </p>
          <DefectPanel defects={report.defects} />
        </div>
      )}
    </div>
  );
}
