'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNovaDriver } from '@/src/components/nova/useNovaPage';
import { Truck, MapPin, Package, KeyRound, CheckCircle2, Navigation, AlertTriangle, BatteryCharging, Box } from 'lucide-react';

export default function DriverPortal() {
  useNovaDriver();
  const [pickups, setPickups] = useState<any[]>([]);
  const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPickups = async () => {
    try {
      const res = await fetch('/api/driver/pickups?driverId=DRV-849');
      const data = await res.json();
      if (data.success) {
        setPickups(data.pickups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleOtpVerify = async (pickupId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');
    const otp = otpInput[pickupId];
    
    try {
      const res = await fetch('/api/driver/pickups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pickupId, otp })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Pickup ${pickupId} confirmed!`);
        fetchPickups(); // refresh
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (e) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 font-sans">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Driver Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-sky-100 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <Truck className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">Van 14 • DRV-849</h1>
              <p className="text-sky-600 font-bold text-sm">Active Route: Borivali → Powai</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Box className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wide">Capacity</span>
              </div>
              <div className="text-lg font-black text-slate-900">82 <span className="text-slate-500 text-sm">/ 100 kg</span></div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <BatteryCharging className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wide">EV Battery</span>
              </div>
              <div className="text-lg font-black text-emerald-600">74%</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"><AlertTriangle className="w-4 h-4" /> {error}</div>}
        {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"><CheckCircle2 className="w-4 h-4" /> {success}</div>}

        {/* Pending Pickups */}
        <div>
          <h2 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amazon-orange" /> Bundled Return Pickups
            <span className="bg-amazon-orange text-slate-900 text-xs px-2 py-0.5 rounded-full ml-auto shadow-sm">{pickups.filter(p => p.status === 'assigned').length} Pending</span>
          </h2>

          <div className="space-y-4">
            {pickups.map(pickup => (
              <div key={pickup.id} className={`rounded-2xl border overflow-hidden shadow-sm transition-all ${
                pickup.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'
              }`}>
                {pickup.status === 'completed' && (
                  <div className="bg-emerald-100 text-emerald-700 text-xs font-black uppercase text-center py-1 border-b border-emerald-200">
                    Pickup Completed
                  </div>
                )}
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{pickup.id}</span>
                    {pickup.status === 'assigned' && (
                      <span className="text-[10px] font-black uppercase bg-sky-100 text-sky-700 px-2 py-1 rounded-full border border-sky-200 flex items-center gap-1 shadow-sm">
                        <Navigation className="w-3 h-3" /> +{pickup.route_deviation_km}km Detour
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="font-black text-slate-900 text-lg mb-1">{pickup.item}</div>
                    <div className="text-slate-500 font-medium text-sm flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" /> {pickup.address}
                    </div>
                  </div>

                  {pickup.status === 'assigned' && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <KeyRound className="w-4 h-4" /> Customer Verification
                      </div>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder="4-digit OTP" 
                          className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2 text-slate-900 font-mono font-bold text-center tracking-[0.5em] focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 placeholder:tracking-normal placeholder:text-slate-400 placeholder:font-sans"
                          maxLength={4}
                          value={otpInput[pickup.id] || ''}
                          onChange={(e) => setOtpInput({ ...otpInput, [pickup.id]: e.target.value })}
                        />
                        <button 
                          onClick={() => handleOtpVerify(pickup.id)}
                          disabled={loading || !otpInput[pickup.id] || otpInput[pickup.id].length !== 4}
                          className="bg-[#ffd814] hover:bg-[#f7ca00] border border-[#a88734] disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-slate-900 font-black px-6 rounded-lg transition shadow-sm"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
