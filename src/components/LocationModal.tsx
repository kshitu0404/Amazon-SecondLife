'use client';

import React, { useState } from 'react';
import { X, MapPin, Search, Trash2 } from 'lucide-react';
import { useLocation } from '../hooks/useLocation';

const POPULAR_CITIES = [
  { city: 'Delhi', pincode: '110001' },
  { city: 'Mumbai', pincode: '400001' },
  { city: 'Bangalore', pincode: '560001' },
  { city: 'Hyderabad', pincode: '500001' },
  { city: 'Chennai', pincode: '600001' },
  { city: 'Pune', pincode: '411001' },
  { city: 'Kolkata', pincode: '700001' },
];

const resolveCityFromPincode = (pincode: string): string => {
  if (pincode.startsWith('11')) return 'Delhi';
  if (pincode.startsWith('40')) return 'Mumbai';
  if (pincode.startsWith('56')) return 'Bangalore';
  if (pincode.startsWith('50')) return 'Hyderabad';
  if (pincode.startsWith('60')) return 'Chennai';
  if (pincode.startsWith('41')) return 'Pune';
  if (pincode.startsWith('70')) return 'Kolkata';
  
  const digit = pincode[0];
  switch (digit) {
    case '1': return 'Delhi NCR';
    case '2': return 'Lucknow';
    case '3': return 'Ahmedabad';
    case '4': return 'Nagpur';
    case '5': return 'Bangalore Hub';
    case '6': return 'Kochi';
    case '7': return 'Guwahati';
    case '8': return 'Patna';
    default: return 'India';
  }
};

export const LocationModal: React.FC = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    recentLocations,
    updateLocation,
    clearRecentLocations,
  } = useLocation();

  const [pincode, setPincode] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isModalOpen) return null;

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate Indian pincode (6 digits, non-zero start)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      setError('Please enter a valid 6-digit Indian pincode (e.g., 560001).');
      return;
    }

    const resolvedCity = resolveCityFromPincode(pincode);
    updateLocation(resolvedCity, pincode);
    setPincode('');
  };

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;

    // Check if the searched city is in our popular list to match standard pincode
    const match = POPULAR_CITIES.find(
      (c) => c.city.toLowerCase() === citySearch.trim().toLowerCase()
    );

    if (match) {
      updateLocation(match.city, match.pincode);
    } else {
      // Default to a generic regional pincode based on popular cities defaults
      updateLocation(citySearch.trim(), '500099');
    }
    setCitySearch('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-xs p-4">
      {/* Modal Wrapper */}
      <div 
        className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center text-left">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            Choose your delivery location
          </h3>
          <button
            onClick={() => setIsOpenModalInState(setIsModalOpen)}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-full transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-left text-xs text-slate-700 max-h-[80vh] overflow-y-auto no-scrollbar">
          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
            Select a shipping address to see accurate circular products availability, nearby warehouse inventories, and delivery estimates.
          </p>

          {/* Pincode Form */}
          <form onSubmit={handlePincodeSubmit} className="space-y-2">
            <label className="block font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Enter Indian Pincode
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 560001"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className={`flex-grow border rounded-lg px-3.5 py-2 text-sm text-slate-800 outline-none focus:ring-1 focus:ring-amazon-orange bg-white ${
                  error ? 'border-red-500 focus:border-red-500' : 'border-slate-300 focus:border-amazon-orange'
                }`}
              />
              <button
                type="submit"
                className="bg-amazon-orange hover:bg-amazon-orange-hover text-black font-extrabold px-5 py-2 rounded-lg transition shadow-sm cursor-pointer text-xs shrink-0"
              >
                Apply
              </button>
            </div>
            {error && <p className="text-red-600 font-bold text-[10px] mt-1">{error}</p>}
          </form>

          {/* Divider */}
          <div className="relative flex py-1.5 items-center text-slate-400 text-[9px] uppercase font-bold">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3">or search city</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* City Search Form */}
          <form onSubmit={handleCitySearchSubmit} className="space-y-2">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search city e.g. Delhi, Mumbai"
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3.5 py-2 text-sm text-slate-800 outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange bg-white"
              />
              <button
                type="submit"
                className="hidden"
              />
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-1.5 items-center text-slate-400 text-[9px] uppercase font-bold">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3">popular cities</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Popular Cities Grid */}
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_CITIES.map((cityObj) => (
              <button
                key={cityObj.city}
                onClick={() => updateLocation(cityObj.city, cityObj.pincode)}
                className="border border-slate-250 hover:border-amazon-orange hover:bg-slate-50 py-2 rounded-lg transition font-bold text-slate-700 text-[11px] cursor-pointer text-center bg-transparent"
              >
                {cityObj.city}
              </button>
            ))}
          </div>

          {/* Recent Locations Section */}
          {recentLocations.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Recent Locations
                </span>
                <button
                  onClick={clearRecentLocations}
                  className="text-red-500 hover:text-red-700 font-extrabold flex items-center gap-1 cursor-pointer bg-transparent"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>

              <div className="space-y-2">
                {recentLocations.map((loc, idx) => (
                  <button
                    key={`${loc.pincode}-${idx}`}
                    onClick={() => updateLocation(loc.city, loc.pincode)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:border-slate-250 hover:bg-slate-50 transition text-left cursor-pointer bg-white"
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{loc.city}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{loc.pincode}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Select</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to avoid scoping issues with toggle
const setIsOpenModalInState = (setter: (val: boolean) => void) => {
  setter(false);
};
