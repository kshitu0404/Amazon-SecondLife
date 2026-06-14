import React from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, ShieldCheck, UserX, Image as ImageIcon, Crosshair, HelpCircle, Activity, ArrowLeft } from 'lucide-react';
import { calculateEnsembleFraudScore } from '@/lib/fraud/ensemble';

// Next.js App Router Server Component
export const dynamic = 'force-dynamic';

export default async function FraudDashboard() {
  // Simulate a queue of recent returns
  const mockReturns = [
    {
      id: "RET-8921-A",
      user_id: "u1092_john",
      product_category: "Electronics",
      claim_notes: "Screen shattered upon arrival",
      image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=400&q=80",
      forceFraud: true,
      time: "2 mins ago"
    },
    {
      id: "RET-8922-B",
      user_id: "u4112_sarah",
      product_category: "Apparel",
      claim_notes: "Wrong size, too small",
      image_url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=400&q=80",
      forceFraud: false,
      time: "15 mins ago"
    },
    {
      id: "RET-8923-C",
      user_id: "u9932_alex",
      product_category: "Electronics",
      claim_notes: "Airpods won't connect",
      image_url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=400&q=80",
      forceFraud: true,
      time: "1 hour ago"
    }
  ];

  const processedReturns = mockReturns.map(r => {
    const score = calculateEnsembleFraudScore(r.user_id, r.product_category, r.claim_notes, r.image_url, undefined, r.forceFraud);
    return { ...r, fraud: score };
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition"><ArrowLeft className="w-5 h-5" /></Link>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">Restricted Access</span>
            </div>
            <h1 className="text-2xl font-black text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-7 h-7 text-rose-600" />
              Risk & Fraud Operations (XAI)
            </h1>
            <p className="text-slate-500 mt-1 text-sm">Advanced Multi-Layer AI Anomaly Detection & Trust Scoring</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Models Online</div>
              <div className="font-mono font-black text-emerald-600 text-lg">3/3 Active</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg text-center">
              <div className="text-xs font-bold text-slate-500 uppercase">Auto-Rejections</div>
              <div className="font-mono font-black text-rose-600 text-lg">142 Today</div>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-black text-lg text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" /> Real-Time Decision Queue
            </h2>
            
            {processedReturns.map(r => {
              const f = r.fraud;
              const isHighRisk = f.decision_tier === 'HOLD_REFUND' || f.decision_tier === 'MANUAL_REVIEW';
              
              return (
                <div key={r.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm ${isHighRisk ? 'border-rose-200' : 'border-slate-200'}`}>
                  <div className={`p-4 flex justify-between items-center border-b ${isHighRisk ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-700">{r.id}</span>
                      <span className="text-xs font-medium text-slate-500">{r.time}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      f.decision_tier === 'HOLD_REFUND' ? 'bg-rose-600 text-white' :
                      f.decision_tier === 'MANUAL_REVIEW' ? 'bg-amber-500 text-white' :
                      f.decision_tier === 'REQUEST_PROOF' ? 'bg-blue-500 text-white' :
                      'bg-emerald-500 text-white'
                    }`}>
                      {f.decision_tier.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="p-6 grid md:grid-cols-3 gap-6">
                    {/* Return Info */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-3">Claim Details</div>
                      <div className="flex items-start gap-3 mb-4">
                        <img src={r.image_url} alt="" className="w-12 h-12 rounded object-cover border border-slate-200" />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{r.product_category}</div>
                          <div className="text-xs italic text-slate-500">"{r.claim_notes}"</div>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-2">User Profile</div>
                      <div className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 inline-block">{r.user_id}</div>
                      <div className="mt-2 text-xs font-bold text-slate-600">Trust Level: <span className={f.sub_scores.trust_level === 'Restricted' ? 'text-rose-600' : 'text-emerald-600'}>{f.sub_scores.trust_level}</span></div>
                    </div>

                    {/* Ensemble Scores */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center justify-between">
                        Ensemble Scores <HelpCircle className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1 text-slate-600"><UserX className="w-3.5 h-3.5"/> Behavioral ML</span>
                            <span className={f.sub_scores.behavioral > 60 ? 'text-rose-600' : 'text-slate-700'}>{f.sub_scores.behavioral}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${f.sub_scores.behavioral > 60 ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${f.sub_scores.behavioral}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1 text-slate-600"><ImageIcon className="w-3.5 h-3.5"/> Vision AI</span>
                            <span className={f.sub_scores.vision > 60 ? 'text-rose-600' : 'text-slate-700'}>{f.sub_scores.vision}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${f.sub_scores.vision > 60 ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${f.sub_scores.vision}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="flex items-center gap-1 text-slate-600"><Activity className="w-3.5 h-3.5"/> Anomaly Engine</span>
                            <span className={f.sub_scores.anomaly > 60 ? 'text-rose-600' : 'text-slate-700'}>{f.sub_scores.anomaly}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${f.sub_scores.anomaly > 60 ? 'bg-rose-500' : 'bg-slate-400'}`} style={{ width: `${f.sub_scores.anomaly}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* XAI Factors */}
                    <div className="border-l border-slate-100 pl-6">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-black" style={{ color: isHighRisk ? '#e11d48' : '#059669' }}>
                          {f.final_fraud_score}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Final Fraud Score</div>
                        <div className="text-xs text-slate-500 mt-1">{f.confidence}% Model Confidence</div>
                      </div>
                      
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">SHAP Explanations (Top Factors)</div>
                      <ul className="space-y-2">
                        {f.explanations.slice(0, 4).map((expl, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                            <Crosshair className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isHighRisk ? 'text-rose-400' : 'text-slate-400'}`} />
                            <span className="leading-snug">{expl}</span>
                          </li>
                        ))}
                        {f.explanations.length === 0 && (
                          <li className="text-xs text-slate-500 italic">No significant fraud factors detected.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-xl p-6 shadow-lg">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-sky-400" /> Security Telemetry</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">Total Analyzed (24h)</span>
                  <span className="font-mono font-bold text-lg">1,245</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <span className="text-sm text-slate-400">Suspicious Flags</span>
                  <span className="font-mono font-bold text-rose-400 text-lg">84</span>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-sm text-slate-400">False Positive Rate</span>
                  <span className="font-mono font-bold text-emerald-400 text-lg">0.8%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-3">Model Architecture</h3>
              <p className="text-sm text-slate-600 mb-4">The final fraud score is an ensemble weighted calculation:</p>
              <div className="bg-slate-50 p-3 rounded font-mono text-xs text-slate-700 border border-slate-200">
                0.4 * Behavioral ML + <br/>
                0.3 * Computer Vision + <br/>
                0.2 * Isolation Forest + <br/>
                0.1 * Trust Inverse
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
