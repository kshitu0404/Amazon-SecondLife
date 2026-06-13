'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';
import { LocationModal } from './LocationModal';

export const LocationSelector: React.FC = () => {
  const { location, setIsModalOpen, toast } = useLocation();

  return (
    <>
      {/* Deliver-to Location Pin */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="hidden md:flex items-center gap-1 border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer text-left select-none shrink-0"
      >
        <MapPin className="w-4.5 h-4.5 text-white mt-2.5 shrink-0" />
        <div className="flex flex-col text-[11px] leading-tight mt-1">
          <span className="text-slate-300">Deliver to Rohan</span>
          <span className="text-white font-extrabold max-w-[110px] sm:max-w-[130px] truncate">
            {location.city} {location.pincode}
          </span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-55 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-300 max-w-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <p className="text-xs font-extrabold leading-normal">{toast}</p>
        </div>
      )}

      {/* Modal Container */}
      <LocationModal />
    </>
  );
};
export default LocationSelector;
