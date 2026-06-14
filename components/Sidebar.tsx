'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { X, User, Home, Upload, Cpu, Truck, FileText, BarChart2, ShoppingBag, Percent, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Synchronize drawer state with custom window events
  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    const handleClose = () => setIsOpen(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('toggle-sidebar', handleToggle);
      window.addEventListener('close-sidebar', handleClose);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('toggle-sidebar', handleToggle);
        window.removeEventListener('close-sidebar', handleClose);
      }
    };
  }, []);

  // Close sidebar drawer automatically on navigation change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/marketplace?category=${encodeURIComponent(categoryName)}`);
    setIsOpen(false);
  };

  const coreLinks = [
    { name: 'Home Portal', href: '/', icon: Home },
    { name: 'Certified Marketplace', href: '/marketplace', icon: ShoppingBag },
    { name: 'Upload & Trade-In', href: '/upload', icon: Upload },
    { name: 'History Dashboard', href: '/history', icon: FileText },
    { name: 'AI Scan Diagnostics', href: '/analysis', icon: Cpu },
    { name: 'Smart Routing Solver', href: '/routing', icon: Truck },
    { name: 'Product Passport', href: '/health-card', icon: FileText },
    { name: 'Eco Impact Ledger', href: '/impact', icon: BarChart2 },
  ];

  const categories = [
    { name: 'Electronics', query: 'Electronics' },
    { name: 'Home & Kitchen', query: 'Home & Kitchen' },
    { name: 'Apparel', query: 'Apparel' },
    { name: 'Books/Media', query: 'Books/Media' },
  ];

  return (
    <>
      {/* Background overlay screen blocker */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 backdrop-blur-xs cursor-pointer"
        />
      )}

      {/* Main Drawer Container */}
      <aside
        className={`fixed top-0 left-0 h-full w-[290px] sm:w-[365px] bg-white text-slate-800 z-55 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out select-none border-r border-slate-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Greeting Profile Header */}
        <div className="bg-amazon-secondary text-white px-8 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
              <User className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight">Hello, Rohan</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-300 hover:text-white p-1 hover:bg-white/10 rounded-full transition cursor-pointer"
            title="Close Menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable menu content */}
        <div className="flex-grow overflow-y-auto no-scrollbar py-4 text-left">
          
          {/* Group 1: Core Portal Links */}
          <div className="space-y-1 px-4">
            <h3 className="px-3 py-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              SecondLife AI Portal
            </h3>
            <div className="pt-2 gap-0.5 flex flex-col">
              {coreLinks.map((link) => {
                const IconComp = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-4 px-3.5 py-2.5 rounded-md text-xs font-bold transition ${
                      isActive
                        ? 'bg-slate-100 text-sky-700 font-extrabold border-l-4 border-sky-600 pl-2.5'
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-sky-700' : 'text-slate-400'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Group 2: Shop Categories */}
          <div className="space-y-1 px-4 mt-6 border-t border-slate-100 pt-4">
            <h3 className="px-3 py-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Shop Categories
            </h3>
            <div className="pt-2 gap-0.5 flex flex-col">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.query)}
                  className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition w-full text-left bg-transparent cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Group 3: Settings & Help */}
          <div className="space-y-1 px-4 mt-6 border-t border-slate-100 pt-4">
            <h3 className="px-3 py-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              Help & Settings
            </h3>
            <div className="pt-2 gap-0.5 flex flex-col">
              <a
                href="/upload"
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-xs font-bold text-slate-705 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <Percent className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Sell on SecondLife</span>
              </a>

              <a
                href="/marketplace"
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-xs font-bold text-slate-705 hover:bg-slate-50 hover:text-slate-900 transition"
              >
                <HelpCircle className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Help Center</span>
              </a>

              <button
                onClick={() => alert('Demo Account Logged Out.')}
                className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-md text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition w-full text-left bg-transparent mt-2 border-t border-slate-100 pt-3"
              >
                <LogOut className="w-4.5 h-4.5 shrink-0" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
