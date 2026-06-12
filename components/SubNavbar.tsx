'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';

export default function SubNavbar() {
  const pathname = usePathname();

  const toggleSidebar = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-sidebar'));
    }
  };

  const navLinks = [
    { label: 'Circular Marketplace', href: '/marketplace' },
    { label: 'Trade-In Portal', href: '/upload' },
    { label: 'AI Diagnostics', href: '/analysis' },
    { label: 'Smart Routing', href: '/routing' },
    { label: 'Product Passports', href: '/health-card' },
    { label: 'Sustainability Ledger', href: '/impact' },
  ];

  return (
    <div className="bg-[#232f3e] text-white flex items-center justify-between px-4 py-1.5 h-10 w-full select-none text-xs font-semibold shrink-0 border-b border-[#19222d]/30">
      {/* Left Menu Section */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Toggle Hamburger */}
        <button
          onClick={toggleSidebar}
          className="flex items-center gap-1 px-2.5 py-1 rounded-sm border border-transparent hover:border-white transition cursor-pointer shrink-0 font-bold"
        >
          <Menu className="w-4 h-4" />
          <span>All</span>
        </button>

        {/* Dynamic Navigation Shortcuts */}
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded-sm border transition shrink-0 ${
                isActive
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent hover:border-white text-slate-100 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Right Static Links */}
      <div className="hidden md:flex items-center gap-4 text-slate-200 shrink-0">
        <Link
          href="/marketplace"
          className="px-2.5 py-1 rounded-sm border border-transparent hover:border-white transition"
        >
          Amazon Basics
        </Link>
        <Link
          href="/upload"
          className="px-2.5 py-1 rounded-sm border border-transparent hover:border-white transition"
        >
          Sell
        </Link>
        <Link
          href="/marketplace"
          className="px-2.5 py-1 rounded-sm border border-transparent hover:border-white transition mr-2"
        >
          Buy Again
        </Link>
      </div>
    </div>
  );
}
