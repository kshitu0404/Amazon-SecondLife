'use client';

import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import type { UploadedImage, AngleLabel } from '@/lib/inspection';
import { ANGLE_LABELS } from '@/lib/inspection';

interface ImagePreviewGridProps {
  images: UploadedImage[];
  onRemove: (id: string) => void;
  onAngleChange: (id: string, angle: AngleLabel) => void;
}

// Color scheme per angle for visual differentiation
const ANGLE_COLORS: Record<AngleLabel, string> = {
  Front:  'bg-sky-100 text-sky-700 border-sky-300',
  Back:   'bg-violet-100 text-violet-700 border-violet-300',
  Left:   'bg-emerald-100 text-emerald-700 border-emerald-300',
  Right:  'bg-amber-100 text-amber-700 border-amber-300',
  Top:    'bg-rose-100 text-rose-700 border-rose-300',
  Bottom: 'bg-slate-100 text-slate-700 border-slate-300',
};

export default function ImagePreviewGrid({
  images,
  onRemove,
  onAngleChange,
}: ImagePreviewGridProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {images.map((img) => (
        <div
          key={img.id}
          className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm group"
        >
          {/* Image preview */}
          <div className="aspect-square relative overflow-hidden bg-slate-50">
            <img
              src={img.preview}
              alt={`${img.angle} view`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Angle label selector */}
          <div className="p-2 space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Angle
            </label>
            <div className="relative">
              <select
                value={img.angle}
                onChange={(e) => onAngleChange(img.id, e.target.value as AngleLabel)}
                className={`w-full text-xs font-bold rounded-md border px-2 py-1 pr-6 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-amazon-orange transition
                  ${ANGLE_COLORS[img.angle]}`}
              >
                {ANGLE_LABELS.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <RefreshCw className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
            </div>
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(img.id)}
            title="Remove image"
            className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 text-white p-1 rounded-full shadow transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
