'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, MapPin, Globe, Leaf } from 'lucide-react';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(searchCategory)}`);
    } else {
      router.push(`/marketplace?category=${encodeURIComponent(searchCategory)}`);
    }
  };

  return (
    <header className="bg-[#131921] text-white flex items-center justify-between px-4 py-2 h-16 w-full select-none shrink-0 gap-4">
      {/* Left Area: Logo & Location */}
      <div className="flex items-center gap-4">
        {/* Amazon Logo with SecondLife Tagline */}
        <Link href="/" className="flex items-center gap-1 border border-transparent hover:border-white px-2 py-1.5 rounded transition">
          <div className="flex flex-col items-start leading-none pt-1">
            <span className="text-xl font-bold tracking-tight text-white select-none">amazon<span className="text-[#ff9900] font-medium text-sm">.in</span></span>
            <span className="text-[10px] font-bold text-[#ff9900] tracking-wide mt-[-2px] ml-0.5 flex items-center gap-0.5">
              SecondLife <Leaf className="w-2.5 h-2.5 fill-amber-500/10" />
            </span>
          </div>
        </Link>

        {/* Deliver-to Location Pin */}
        <div 
          onClick={() => alert('Demo Location Selector: Shipping set to Delhi 110020')}
          className="hidden md:flex items-center gap-1 border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer text-left"
        >
          <MapPin className="w-4.5 h-4.5 text-white mt-2.5 shrink-0" />
          <div className="flex flex-col text-[11px] leading-tight mt-1">
            <span className="text-slate-300">Deliver to Rohan</span>
            <span className="text-white font-extrabold">Delhi 110020</span>
          </div>
        </div>
      </div>

      {/* Center Area: Search Bar (Authentic Amazon style) */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="flex flex-grow max-w-2xl h-10 rounded-md overflow-hidden bg-white border border-transparent focus-within:ring-2 focus-within:ring-[#ff9900] shadow-sm items-center"
      >
        {/* Category select dropdown (left side of input) */}
        <div className="relative h-full flex items-center bg-[#f3f3f3] border-r border-[#cdcdcd] hover:bg-[#dadada] transition cursor-pointer rounded-l-md shrink-0">
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="appearance-none bg-transparent pr-7 pl-3.5 py-2 text-xs font-semibold text-slate-700 outline-none cursor-pointer h-full z-10"
          >
            <option value="All">All</option>
            <option value="Electronics">Electronics</option>
            <option value="Home & Kitchen">Kitchen</option>
            <option value="Apparel">Apparel</option>
            <option value="Books/Media">Books</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 text-slate-650 pointer-events-none" />
        </div>

        {/* Input Text Box */}
        <input
          type="text"
          placeholder="Search Amazon SecondLife"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow px-3 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none h-full"
        />

        {/* Yellow Search Action Button */}
        <button 
          type="submit" 
          className="bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center px-6 transition cursor-pointer h-full shrink-0"
        >
          <Search className="w-4.5 h-4.5 text-slate-900 stroke-[2.5]" />
        </button>
      </form>

      {/* Right Area: Action Anchors */}
      <div className="flex items-center gap-2 sm:gap-4.5 shrink-0">
        
        {/* Language selector (EN) */}
        <div 
          onClick={() => alert('Language options: English (EN)')}
          className="hidden sm:flex items-center gap-1 border border-transparent hover:border-white px-2 py-2 rounded transition cursor-pointer text-xs font-extrabold"
        >
          <Globe className="w-4 h-4 text-slate-300" />
          <span className="text-white">EN</span>
          <ChevronDown className="w-3 h-3 text-slate-400 mt-1" />
        </div>

        {/* Account and Lists dropdown */}
        <div 
          onClick={() => router.push('/marketplace')}
          className="flex flex-col text-left border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer leading-tight select-none"
        >
          <span className="text-[11px] text-slate-300">Hello, Rohan</span>
          <span className="text-xs font-extrabold text-white flex items-center gap-0.5">
            Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
          </span>
        </div>

        {/* Amazon Hives / SecondLife link */}
        <Link 
          href="/marketplace"
          className="hidden lg:flex flex-col text-left border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer leading-tight"
        >
          <span className="text-[11px] text-[#ff9900] font-bold">New</span>
          <span className="text-xs font-extrabold text-white">SecondLife</span>
        </Link>

        {/* Shopping Cart Icon (outline style with circular badge) */}
        <button
          onClick={() => router.push('/marketplace')}
          className="relative flex items-center gap-1.5 border border-transparent hover:border-white px-2.5 py-2 rounded transition cursor-pointer text-xs font-extrabold"
          title="Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white stroke-[1.8]" />
            <span className="absolute -top-1 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-[#131921] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none border-2 border-[#131921] translate-x-1.5">
              1
            </span>
          </div>
          <span className="text-white mt-3 hidden sm:inline">Cart</span>
        </button>

      </div>
    </header>
  );
}
