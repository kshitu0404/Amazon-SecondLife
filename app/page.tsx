'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Laptop, Smartphone, Camera, Shirt, Gift, Sparkles, Star, Heart, BookmarkCheck, ChevronLeft, ChevronRight, ShoppingCart, Leaf, Cpu } from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';
import { formatPrice, getConditionColorClass, getConditionLabel } from '@/lib/utils';
import { DeliveryBadge } from '@/src/components/DeliveryBadge';
import { useCart } from '@/src/context/CartContext';
import { useNovaLanding, useNovaExitIntent } from '@/src/components/nova/useNovaPage';

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  
  useNovaLanding();
  useNovaExitIntent();

  const featured = mockProducts.slice(0, 5);
  // Stable review counts — computed once, never changes between server and client
  const reviewCounts = useMemo(
    () => featured.map((p) => 20 + (p.id.charCodeAt(5) % 80)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Mockup category cards config
  const categoryIcons = [
    { label: 'Electronics', icon: Laptop, query: 'Electronics' },
    { label: 'Apparel', icon: Shirt, query: 'Apparel' },
    { label: 'Camera', icon: Camera, query: 'Electronics' },
    { label: 'Kitchen', icon: Sparkles, query: 'Home & Kitchen' },
    { label: 'Hobby', icon: Gift, query: 'Books/Media' },
  ];

  // Carousel slider indices
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      title: 'Extracting Value Beyond',
      cursive: 'The First Purchase',
      tagline: 'AI-powered lifecycle intelligence that finds the best next destination for every returned or unused product.',
      buttonText: 'Start Trade-in',
      link: '/upload',
    },
    {
      title: 'TRADE-IN DEVICES',
      cursive: 'Earn Together',
      tagline: 'Get instant Amazon credit for circular recycling and certified listings.',
      buttonText: 'Open Trade-in Portal',
      link: '/upload',
    }
  ];

  const handleQtyChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  return (
    <div className="w-full flex flex-col pb-12">
      
      {/* 1. Hero Dashboard Banner */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="radial-glow relative w-full max-w-[1600px] mx-auto bg-[#f3d03b]/90 bg-gradient-to-r from-[#fce056]/90 to-[#f3d03b]/90 min-h-[400px] flex items-center overflow-hidden rounded-[24px] shadow-sm border border-[#ddb31c]/30">
          
          {/* Honeycomb Texture Overlay */}
          <div className="absolute inset-0 pointer-events-none honeycomb-bg !bg-transparent opacity-20 z-0"></div>
          
          {/* Left Slider Button */}
          <button
            onClick={() => setActiveSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute left-4 z-20 w-11 h-11 bg-black/10 hover:bg-black/30 text-white rounded-full flex items-center justify-center transition cursor-pointer select-none"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Carousel Content */}
          <div className="mx-auto w-full px-12 lg:px-16 flex flex-col lg:flex-row justify-between items-center gap-6 py-6 relative z-10 min-h-[400px]">
            
            {/* Left: Text & Buttons */}
            <div className="space-y-4 text-left w-full lg:w-[40%]">
              <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-white/50 px-3.5 py-1.5 rounded-full shadow-xs text-[11px] uppercase tracking-wide font-extrabold text-emerald-800">
                <Leaf className="w-3.5 h-3.5 text-emerald-600" /> WELCOME TO AMAZON SECONDLIFE
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-slate-900 leading-none">
                  Extracting Value Beyond<br />The First Purchase
                </h2>
              </div>

              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-semibold max-w-[420px]">
                AI-powered lifecycle intelligence that finds the best next destination for every returned, unused, or outgrown product.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => router.push('/upload')}
                  className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  Start Trade-in <span className="font-normal text-lg leading-none">→</span>
                </button>
                <button
                  onClick={() => router.push('/marketplace')}
                  className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-lg shadow-lg transition transform hover:scale-105 cursor-pointer flex items-center gap-2"
                >
                  Browse Marketplace <span className="font-normal text-lg leading-none">→</span>
                </button>
              </div>
            </div>

            {/* Center: 3D Graphic */}
            <div className="hidden lg:flex w-full lg:w-[30%] justify-center relative">
               
               {/* Floating Leaves Elements */}
               <div className="absolute -top-2 right-6 animate-[bounce_3s_infinite] delay-75 z-20">
                  <Leaf className="w-4 h-4 text-green-600 transform rotate-45 opacity-60 drop-shadow-md" fill="currentColor" />
               </div>
               <div className="absolute top-1/4 -left-4 animate-[bounce_4s_infinite] delay-300 z-20">
                  <Leaf className="w-6 h-6 text-emerald-600 transform -rotate-12 opacity-50 drop-shadow-sm" fill="currentColor" />
               </div>
               <div className="absolute bottom-8 right-2 animate-[pulse_3s_infinite] delay-500 z-20">
                  <Leaf className="w-4 h-4 text-green-500 transform rotate-90 opacity-70 drop-shadow-sm" fill="currentColor" />
               </div>

               {/* Transparent 3D Product Illustration */}
               <img 
                 src="/images/hero_circular_3d_transparent.png" 
                 alt="Circular Economy Graphic" 
                 className="w-full max-w-[340px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)] mix-blend-darken relative z-10 transition-transform hover:scale-105 duration-500" 
               />
            </div>

            {/* Right Panels (Features) */}
            <div className="flex flex-col gap-2 shrink-0 w-full lg:w-[30%] relative z-10">
              {/* Panel 1 */}
              <div className="bg-[#FFFDF5] rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 transition hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <div className="leading-tight">
                  <h4 className="text-xs font-extrabold text-slate-900">AI Diagnostics</h4>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Advanced AI scans & evaluates product condition instantly.</p>
                </div>
              </div>

              {/* Panel 2 */}
              <div className="bg-[#FFFDF5] rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 transition hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                  <span className="font-extrabold text-base">₹</span>
                </div>
                <div className="leading-tight">
                  <h4 className="text-xs font-extrabold text-slate-900">Smart Trade-In Valuation</h4>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Get the best value with real-time market & condition analysis.</p>
                </div>
              </div>

              {/* Panel 3 */}
              <div className="bg-[#FFFDF5] rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 transition hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <h4 className="text-xs font-extrabold text-slate-900">Circular Marketplace</h4>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Buy, sell & rediscover quality pre-owned products.</p>
                </div>
              </div>

              {/* Panel 4 */}
              <div className="bg-[#FFFDF5] rounded-xl p-3 shadow-sm border border-slate-100 flex items-center gap-3 transition hover:shadow-md">
                <div className="w-9 h-9 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-100">
                  <Leaf className="w-4 h-4" />
                </div>
                <div className="leading-tight">
                  <h4 className="text-xs font-extrabold text-slate-900">Sustainability Rewards</h4>
                  <p className="text-[10px] text-slate-600 font-medium mt-0.5 leading-snug">Earn eco-credits for every sustainable action.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Slider Button */}
          <button
            onClick={() => setActiveSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 z-20 w-11 h-11 bg-black/10 hover:bg-black/30 text-white rounded-full flex items-center justify-center transition cursor-pointer select-none"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2 h-2 rounded-full cursor-pointer transition ${
                  activeSlide === i ? 'bg-slate-900 scale-125' : 'bg-slate-900/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Page Content Body */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-8 mt-6 space-y-6">
        
        {/* Popular Categories Ribbon */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm text-left">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold text-slate-900">Popular Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {categoryIcons.map((cat, idx) => {
                const IconComp = cat.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => router.push(`/marketplace?category=${encodeURIComponent(cat.query)}`)}
                    className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md px-3 py-1 flex items-center gap-1.5 transition text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <IconComp className="w-3.5 h-3.5 text-slate-500" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => router.push('/marketplace')}
            className="text-xs font-bold text-sky-700 hover:text-sky-850 hover:underline"
          >
            All Categories &rarr;
          </button>
        </div>

        {/* Hot Deals Grid */}
        <div className="space-y-4 radial-glow relative">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5">
              Circular Deals <span className="text-rose-500">🔥</span>
            </h3>
            <button
              onClick={() => router.push('/marketplace')}
              className="text-xs font-bold text-sky-750 hover:text-sky-900 hover:underline"
            >
              See all circular listings &rarr;
            </button>
          </div>

          {/* Authentic Amazon product listing grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {featured.map((product) => {
              const qty = quantities[product.id] || 1;
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/health-card?id=${product.id}`)}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition duration-200 flex flex-col justify-between cursor-pointer group relative p-4 shadow-xs"
                >
                  {/* Whislist overlay */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Added ${product.name} to Wishlist!`);
                    }}
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200 p-1.5 rounded-full shadow-xs transition z-10 cursor-pointer"
                  >
                    <Heart className="w-3.5 h-3.5" />
                  </button>

                  {/* AI Verified Badge */}
                  <div className="absolute top-3 left-3 bg-[#10b981] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm z-10 uppercase tracking-wider flex items-center gap-0.5 select-none">
                    <BookmarkCheck className="w-2.5 h-2.5" /> AI VERIFIED
                  </div>

                  <div>
                    {/* Product Image */}
                    <div className="relative h-40 w-full bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden rounded">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain p-2 group-hover:scale-102 transition duration-300"
                      />
                    </div>

                    {/* Card Descriptions */}
                    <div className="pt-3 text-left space-y-1">
                      <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition">
                        {product.name}
                      </h4>
                      
                      {/* Brand name */}
                      <p className="text-[10px] text-sky-700 font-bold">
                        {product.sellerName || 'Amazon Certified'}
                      </p>

                      {/* Ratings stars count */}
                      <div className="flex items-center gap-1 text-xs text-slate-600 pt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= Math.round(product.healthCard.sustainabilityRating)
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-amber-600 font-extrabold text-[11px] mt-0.5">
                          {product.healthCard.sustainabilityRating}
                        </span>
                        <span className="text-slate-400 text-[10px]">({reviewCounts[featured.indexOf(product)]})</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Qty Selector */}
                  <div className="pt-3 flex flex-col text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-[#b12704]">
                        {formatPrice(product.resalePrice)}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getConditionColorClass(product.condition)}`}>
                        {getConditionLabel(product.condition)}
                      </span>

                      {/* Qty Selector Button Group */}
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <span className="text-amazon-secondary font-extrabold">Qty:</span>
                        <div className="flex items-center border border-amazon-secondary rounded overflow-hidden bg-amazon-secondary text-white shadow-xs">
                          <button 
                            type="button" 
                            onClick={() => handleQtyChange(product.id, -1)}
                            className="px-2 py-0.5 hover:bg-amazon-blue text-white transition font-extrabold cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 bg-amazon-blue text-white font-extrabold text-[11px] border-x border-amazon-secondary min-w-4 text-center">
                            {qty}
                          </span>
                          <button 
                            type="button" 
                            onClick={() => handleQtyChange(product.id, 1)}
                            className="px-2 py-0.5 hover:bg-amazon-blue text-white transition font-extrabold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Delivery Routing Badge */}
                    <div className="px-1 pt-1 border-t border-slate-100">
                      <DeliveryBadge productId={product.id} />
                    </div>

                    {/* Yellow Add to Cart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, qty);
                      }}
                      className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0c14b] border border-[#a88734] rounded-md py-1.5 px-3 text-xs font-bold text-slate-900 transition mt-3.5 flex items-center justify-center gap-1 cursor-pointer shadow-xs active:shadow-inner"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corporate AI Inspector banner */}
        <div className="bg-[#19222d] text-slate-300 rounded-xl p-6 border border-slate-800 flex flex-col sm:flex-row items-center gap-6 mt-4 shadow">
          <div className="w-12 h-12 bg-amazon-secondary rounded-xl flex items-center justify-center shrink-0 border border-slate-700 text-[#10b981]">
            <Cpu className="w-6 h-6 stroke-[1.5]" />
          </div>
          <div className="text-left space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Amazon SecondLife Artificial Intelligence Inspector <Leaf className="w-4 h-4 text-[#10b981]" />
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Amazon SecondLife inspects returned items using automated optical scan algorithms, verifying component completeness, tracking cosmetics, and establishing a secure Digital Product Passport (DPP). Verified items are immediately listed on the marketplace to eliminate waste, bypass carbon overheads, and find their next best owner.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
