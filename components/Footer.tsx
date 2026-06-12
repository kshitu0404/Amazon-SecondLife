'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, Globe, DollarSign } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="bg-[#232f3e] text-slate-300 text-sm mt-auto w-full">
      {/* Back to top banner */}
      <button
        onClick={scrollToTop}
        className="w-full bg-[#37475a] hover:bg-[#485769] text-white text-xs font-semibold py-3 text-center transition select-none cursor-pointer"
      >
        Back to top
      </button>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold mb-3">Get to Know Us</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:underline">Careers at SecondLife</a></li>
            <li><a href="#" className="hover:underline">Amazon Science & AI</a></li>
            <li><a href="#" className="hover:underline">Sustainability Reports</a></li>
            <li><a href="#" className="hover:underline">Carbon Footprint Tracker</a></li>
            <li><a href="#" className="hover:underline">Amazon Devices Circularity</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Amazon SecondLife Hub</h3>
          <ul className="space-y-2 text-xs">
            <li><Link href="/upload" className="hover:underline">Trade-In Portal</Link></li>
            <li><Link href="/marketplace" className="hover:underline">Circular Marketplace</Link></li>
            <li><Link href="/routing" className="hover:underline">Smart Routing System</Link></li>
            <li><Link href="/impact" className="hover:underline">Your Sustainability Impact</Link></li>
            <li><a href="#" className="hover:underline">Certified Refurbishment Partners</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Seller & Partner Programs</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:underline">Sell on SecondLife</a></li>
            <li><a href="#" className="hover:underline">Become a Certified Inspector</a></li>
            <li><a href="#" className="hover:underline">Donation Network Partnerships</a></li>
            <li><a href="#" className="hover:underline">Recycling & Materials Recovery</a></li>
            <li><a href="#" className="hover:underline">Developer Circular APIs</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3">Let Us Help You</h3>
          <ul className="space-y-2 text-xs">
            <li><a href="#" className="hover:underline">SecondLife Safety Guarantee</a></li>
            <li><a href="#" className="hover:underline">Return & Exchange Guidelines</a></li>
            <li><a href="#" className="hover:underline">Warranty Policies</a></li>
            <li><a href="#" className="hover:underline">Circular Hub Locations</a></li>
            <li><a href="#" className="hover:underline">Help & Customer Service</a></li>
          </ul>
        </div>
      </div>

      {/* Country / Currency Selectors */}
      <div className="border-t border-slate-700 py-6 bg-[#232f3e] flex flex-wrap justify-center items-center gap-6 text-xs text-slate-300">
        <div className="flex items-center gap-1.5 select-none font-bold text-white">
          <span>amazon</span>
          <span className="text-[#10b981] flex items-center gap-0.5">
            SecondLife <Leaf className="w-3.5 h-3.5" />
          </span>
        </div>

        <div className="flex items-center gap-6">
          <button className="border border-slate-600 hover:border-slate-400 rounded px-3 py-1.5 flex items-center gap-1.5 bg-transparent">
            <Globe className="w-3.5 h-3.5" /> English
          </button>
          <button className="border border-slate-600 hover:border-slate-400 rounded px-3 py-1.5 flex items-center gap-1.5 bg-transparent">
            <DollarSign className="w-3.5 h-3.5" /> USD - U.S. Dollar
          </button>
          <button className="border border-slate-600 hover:border-slate-400 rounded px-3 py-1.5 flex items-center gap-1.5 bg-transparent">
            <span className="text-amber-500 font-bold">♻</span> United States Hub
          </button>
        </div>
      </div>

      {/* Legal & Carbon Pledge Strip */}
      <div className="bg-[#19222d] text-slate-400 text-xs py-8 px-4 text-center leading-normal">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
          <p className="max-w-2xl text-[11px] leading-relaxed">
            Amazon SecondLife is part of our commitment to reaching net-zero carbon across our operations by 2040. 
            By purchasing pre-owned, certified refurbished, and traded-in items, you are extending product lifetimes 
            and reducing electronic waste. Every SecondLife listing is AI-scanned and technician-certified.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-slate-400 text-[11px]">
            <a href="#" className="hover:underline">Conditions of Use</a>
            <a href="#" className="hover:underline">Privacy Notice</a>
            <a href="#" className="hover:underline">Consumer Health Data Privacy Disclosure</a>
            <a href="#" className="hover:underline">Your Ads Privacy Choices</a>
            <span>© 1996-2026, AmazonSecondLife.com, Inc. or its affiliates</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
