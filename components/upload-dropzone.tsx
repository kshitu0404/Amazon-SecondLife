'use client';

import React, { useRef, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

interface UploadDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  currentCount: number;
  maxImages: number;
  disabled?: boolean;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 10;

export default function UploadDropzone({
  onFilesAdded,
  currentCount,
  maxImages,
  disabled = false,
}: UploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const remaining = maxImages - currentCount;

  const validateAndAdd = (rawFiles: FileList | File[]) => {
    setValidationError(null);
    const files = Array.from(rawFiles);

    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" is not a supported format (JPG, PNG, WebP only).`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB limit.`);
        continue;
      }
      valid.push(file);
    }

    if (errors.length > 0) {
      setValidationError(errors[0]);
    }

    const toAdd = valid.slice(0, remaining);
    if (toAdd.length > 0) {
      onFilesAdded(toAdd);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && remaining > 0) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || remaining <= 0) return;
    if (e.dataTransfer.files?.length) {
      validateAndAdd(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateAndAdd(e.target.files);
    }
    // Reset input so same file can be re-added after removal
    e.target.value = '';
  };

  const isFull = remaining <= 0;
  const isDisabled = disabled || isFull;

  return (
    <div className="space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isDisabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all
          ${isDisabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : isDragOver
            ? 'border-amazon-orange bg-amber-50/60 scale-[1.01] cursor-copy shadow-md'
            : 'border-slate-300 hover:border-amazon-orange bg-white hover:bg-slate-50/80 cursor-pointer'
          }`}
      >
        <Upload
          className={`w-9 h-9 mb-3 transition-colors ${
            isDragOver ? 'text-amazon-orange' : 'text-slate-400'
          }`}
        />

        {isFull ? (
          <p className="text-sm font-semibold text-slate-500">
            Maximum {maxImages} images reached
          </p>
        ) : (
          <>
            <p className="text-sm font-semibold text-slate-700 text-center">
              {isDragOver
                ? 'Drop images here'
                : 'Drag & drop product images, or '}
              {!isDragOver && (
                <span className="text-sky-700 hover:underline">browse files</span>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1.5">
              JPG, PNG, WebP · Max {MAX_SIZE_MB}MB each · Up to {remaining} more image{remaining !== 1 ? 's' : ''} allowed
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileChange}
          className="hidden"
          disabled={isDisabled}
        />
      </div>

      {validationError && (
        <div className="flex items-start gap-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
}
