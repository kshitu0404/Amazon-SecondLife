'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export type NovaPhaseState = 'idle' | 'loading' | 'success' | 'failed';

export interface NovaPhase {
  id: string;
  loadingText: string;
  steps: string[];
  successText: string;
  successDesc: string | React.ReactNode;
  failedText?: string;
  failedDesc?: string | React.ReactNode;
  state: NovaPhaseState;
}

interface NovaProgressOverlayProps {
  phase: NovaPhase | null;
  activeStepIndex: number;
}

export default function NovaProgressOverlay({ phase, activeStepIndex }: NovaProgressOverlayProps) {
  if (!phase) return null;

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-8 shadow-sm flex flex-col w-full max-w-xl mx-auto overflow-hidden relative">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      
      <div className="relative z-10 flex flex-col items-start text-left">
        {/* Header / Loading Text */}
        <div className="flex items-center gap-3 mb-6">
          {phase.state === 'loading' && (
            <div className="relative flex items-center justify-center shrink-0 w-8 h-8">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
              <span className="absolute text-lg">🟡</span>
            </div>
          )}
          {phase.state === 'success' && (
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {phase.state === 'failed' && (
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
          <h3 className={`text-lg font-black ${
            phase.state === 'success' ? 'text-emerald-800' :
            phase.state === 'failed' ? 'text-rose-800' :
            'text-amber-900'
          }`}>
            {phase.state === 'loading' ? phase.loadingText :
             phase.state === 'success' ? phase.successText :
             phase.failedText || 'Analysis failed'}
          </h3>
        </div>

        {/* Steps List */}
        {phase.state === 'loading' && (
          <div className="w-full space-y-4 pl-11">
            {phase.steps.map((step, idx) => {
              const isDone = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              const isPending = idx > activeStepIndex;

              return (
                <div key={idx} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-30' : 'opacity-100'}`}>
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    {isDone ? (
                      <span className="text-emerald-500 font-bold text-sm">✓</span>
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full border-2 border-amber-500 animate-pulse"></span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-200"></span>
                    )}
                  </div>
                  <span className={`text-sm font-bold ${
                    isDone ? 'text-slate-700' : 
                    isCurrent ? 'text-amber-800' : 
                    'text-slate-400'
                  }`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Success Description */}
        {phase.state === 'success' && (
          <div className="pl-11 mt-2 text-sm font-bold text-emerald-700 whitespace-pre-wrap leading-relaxed">
            {phase.successDesc}
          </div>
        )}

        {/* Failed Description */}
        {phase.state === 'failed' && (
          <div className="pl-11 mt-2 text-sm font-bold text-rose-700 whitespace-pre-wrap leading-relaxed">
            {phase.failedDesc}
          </div>
        )}
      </div>
    </div>
  );
}
