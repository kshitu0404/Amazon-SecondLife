'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, HelpCircle, Package, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { generateSimulatedProduct, saveUploadedProduct } from '@/lib/utils';

export default function UploadPage() {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [conditionNotes, setConditionNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Upload progress states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading image to Amazon Circular Hub...');
  };

  // Simulating the upload progress & AI diagnostic engine
  useEffect(() => {
    if (!isUploading) return;

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Progress steps and messages
        const nextProgress = prev + 5;
        if (nextProgress === 30) {
          setUploadStatus('Image upload complete. Initiating neural analysis...');
        } else if (nextProgress === 60) {
          setUploadStatus('Detecting cosmetic blemishes & scratch coordinates...');
        } else if (nextProgress === 85) {
          setUploadStatus('Cross-referencing hardware diagnostics & packaging completeness...');
        }
        
        return nextProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isUploading]);

  // Execute redirection after scanning
  useEffect(() => {
    if (uploadProgress === 100 && isUploading) {
      const timer = setTimeout(() => {
        // Generate simulated product and save to localStorage
        const simulated = generateSimulatedProduct(
          productName,
          category,
          conditionNotes,
          imagePreview || undefined
        );
        saveUploadedProduct(simulated);
        
        // Redirect to AI Analysis
        router.push('/analysis');
      }, 800); // Small delay so the user sees "100% complete"

      return () => clearTimeout(timer);
    }
  }, [uploadProgress, isUploading, productName, category, conditionNotes, imagePreview, router]);

  return (
    <div className="p-6 w-full flex flex-col gap-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 flex flex-col gap-6 text-left">
        {/* Page Header */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            SecondLife Trade-In Portal
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Scan and evaluate your returned or outgrown products. Let our AI determine their next best life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 bg-slate-50/50 border border-slate-250 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Area */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Product Image
              </label>
              
              {!imagePreview ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amazon-orange rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-white hover:bg-slate-50/80"
                >
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">
                    Drag and drop your product photo, or <span className="text-sky-700 hover:underline">browse</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    Supports JPG, PNG, WebP (Max 10MB)
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-white max-h-64 flex justify-center items-center">
                  <img
                    src={imagePreview}
                    alt="Upload Preview"
                    className="max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full shadow-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Name */}
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
                className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-amazon-orange"
              />
            </div>

            {/* Category and Condition Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange bg-white cursor-pointer"
                >
                  <option>Electronics</option>
                  <option>Home & Kitchen</option>
                  <option>Apparel</option>
                  <option>Books/Media</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  AI Assessment Standard <span title="SecondLife grades products using optical scan neural networks."><HelpCircle className="w-3.5 h-3.5 text-slate-400 cursor-help" /></span>
                </label>
                <div className="w-full border border-slate-200 bg-white text-slate-600 rounded-lg px-3 py-2.5 text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#10b981]" />
                  <span>Circular AI Inspector v2.4</span>
                </div>
              </div>
            </div>

            {/* Condition Notes */}
            <div>
              <label htmlFor="conditionNotes" className="block text-sm font-bold text-slate-700 mb-1.5">
                Condition Notes & Wear Details
              </label>
              <textarea
                id="conditionNotes"
                rows={4}
                placeholder="Mention any scratches, missing parts, or signs of use (e.g. 'Minor scratching on bottom bezel, original box missing but power brick is included')."
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                className="w-full border border-slate-300 focus:border-amazon-orange rounded-lg px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-amazon-orange resize-y"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !productName.trim()}
              className="w-full bg-amazon-orange hover:bg-amazon-orange-hover text-black font-bold py-3 px-6 rounded-lg shadow hover:shadow-md transition text-sm flex items-center justify-center gap-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              Analyze with Amazon AI <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Info/Guide Panel */}
        <div className="space-y-6">
          <div className="bg-amazon-secondary text-white rounded-xl p-5 border border-slate-700 shadow-sm">
            <h3 className="font-bold text-base mb-3 flex items-center gap-1.5 text-amber-400">
              <Sparkles className="w-5 h-5 fill-amber-400/20" /> How scanning works
            </h3>
            <ul className="space-y-3 text-xs leading-relaxed text-slate-300">
              <li className="flex gap-2">
                <span className="text-[#10b981] font-bold">✔</span>
                <span><strong>Neural Inspection:</strong> Computer vision networks analyze the uploaded photo, searching for scratches, dents, and missing components.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#10b981] font-bold">✔</span>
                <span><strong>Hardware Diagnostics:</strong> We estimate remaining battery degradation curves (for electronics) and cosmetic health rating indexes.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-[#10b981] font-bold">✔</span>
                <span><strong>Smart Routing Logic:</strong> Our routing engine recommends the optimal circular path—maximizing financial recovery and environmental reduction.</span>
              </li>
            </ul>
          </div>

          <div className="border border-slate-250 rounded-xl p-5 bg-slate-50 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Circularity Guarantee</h4>
            <p className="text-xs text-slate-600 leading-normal">
              By uploading items to Amazon SecondLife, you support landfill diversion and help extend physical product lifecycles. Once approved, you receive immediate trade-in credit usable across Amazon.
            </p>
            <div className="flex gap-2 items-center text-[10px] text-slate-500 font-bold border-t border-slate-200 pt-3">
              <Package className="w-4 h-4 text-emerald-500" />
              <span>Certified Packaging Provided</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress Modal/Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 animate-scale-up">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Outer circular spinner */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 border-t-amazon-orange animate-spin" />
              <Package className="w-8 h-8 text-amazon-orange" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-slate-900">Analyzing Your Product</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                {uploadProgress}% Complete
              </p>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amazon-orange to-[#10b981] h-full transition-all duration-150 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>

            {/* Status Message */}
            <p className="text-xs text-slate-600 italic max-w-xs min-h-[32px] flex items-center justify-center leading-normal">
              {uploadStatus}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
