'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, ShoppingCart, ChevronDown, Globe, Leaf } from 'lucide-react';
import LocationSelector from '@/src/components/LocationSelector';
import { useCart } from '@/src/context/CartContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/marketplace?search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(searchCategory)}`);
    } else {
      router.push(`/marketplace?category=${encodeURIComponent(searchCategory)}`);
    }
  };

  return (
    <header className="bg-amazon-blue text-white flex items-center justify-between px-4 py-2 h-16 w-full select-none shrink-0 gap-4">
      {/* Left Area: Logo & Location */}
      <div className="flex items-center gap-4">
        {/* Amazon Logo with SecondLife Tagline */}
        <Link href="/" className="flex items-center gap-1 border border-transparent hover:border-white px-2 py-1.5 rounded transition">
          <div className="flex flex-col items-start leading-none pt-1">
            <div className="flex items-start">
              <svg viewBox="0 0 603 182" className="h-7 mt-1 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="m 374.00642,142.18404 c -34.99948,25.79739 -85.72909,39.56123 -129.40634,39.56123 -61.24255,0 -116.37656,-22.65135 -158.08757,-60.32496 -3.2771,-2.96252 -0.34083,-6.9999 3.59171,-4.69283 45.01431,26.19064 100.67269,41.94697 158.16623,41.94697 38.774689,0 81.4295,-8.02237 120.6499,-24.67006 5.92501,-2.51683 10.87999,3.88009 5.08607,8.17965" fill="#ff9900" />
                <path d="m 388.55678,125.53635 c -4.45688,-5.71527 -29.57261,-2.70033 -40.84585,-1.36327 -3.43442,0.41947 -3.95874,-2.56925 -0.86517,-4.71905 20.00346,-14.07844 52.82696,-10.01483 56.65462,-5.2958 3.82764,4.74526 -0.99624,37.64741 -19.79373,53.35128 -2.88385,2.41195 -5.63662,1.12734 -4.35198,-2.07113 4.2209,-10.53917 13.68519,-34.16054 9.20211,-39.90203" fill="#ff9900" />
                <path d="M 348.49744,20.06598 V 6.38079 c 0,-2.07113 1.57301,-3.46062 3.46062,-3.46062 h 61.26875 c 1.96628,0 3.53929,1.41571 3.53929,3.46062 v 11.71893 c -0.0262,1.96626 -1.67788,4.53551 -4.61418,8.59912 l -31.74859,45.32893 c 11.79759,-0.28837 24.25059,1.46814 34.94706,7.49802 2.41195,1.36327 3.06737,3.35575 3.25089,5.32203 V 99.4506 c 0,1.99248 -2.20222,4.32576 -4.5093,3.1198 -18.84992,-9.88376 -43.887,-10.95865 -64.72939,0.10487 -2.12356,1.15354 -4.35199,-1.15354 -4.35199,-3.14602 V 85.66054 c 0,-2.22843 0.0262,-6.02989 2.25463,-9.41186 l 36.78224,-52.74829 h -32.01076 c -1.96626,0 -3.53927,-1.38948 -3.53927,-3.43441" />
                <path d="m 124.99883,105.45424 h -18.64017 c -1.78273,-0.13107 -3.19845,-1.46813 -3.32954,-3.17224 V 6.61676 c 0,-1.91383 1.59923,-3.43442 3.59171,-3.43442 h 17.38176 c 1.80898,0.0786 3.25089,1.46814 3.38199,3.19845 v 12.50545 h 0.34082 c 4.53551,-12.08598 13.05597,-17.7226 24.53896,-17.7226 11.66649,0 18.95477,5.63662 24.19814,17.7226 4.5093,-12.08598 14.76008,-17.7226 25.74495,-17.7226 7.81262,0 16.35931,3.22467 21.57646,10.46052 5.89879,8.04857 4.69281,19.74128 4.69281,29.99208 l -0.0262,60.37739 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061 h -18.61397 c -1.86138,-0.13107 -3.35574,-1.62543 -3.35574,-3.46061 V 51.29025 c 0,-4.03739 0.36702,-14.10466 -0.52434,-17.93233 -1.38949,-6.42311 -5.55797,-8.23209 -10.95865,-8.23209 -4.5093,0 -9.22833,3.01494 -11.14216,7.83885 -1.91383,4.8239 -1.73031,12.89867 -1.73031,18.32557 v 50.70338 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061 h -18.61395 c -1.88761,-0.13107 -3.35576,-1.62543 -3.35576,-3.46061 L 152.946,51.29025 c 0,-10.67025 1.75651,-26.37415 -11.48298,-26.37415 -13.39682,0 -12.87248,15.31063 -12.87248,26.37415 v 50.70338 c 0,1.91383 -1.59923,3.46061 -3.59171,3.46061" />
                <path d="m 469.51439,1.16364 c 27.65877,0 42.62858,23.75246 42.62858,53.95427 0,29.17934 -16.54284,52.32881 -42.62858,52.32881 -27.16066,0 -41.94697,-23.75246 -41.94697,-53.35127 0,-29.78234 14.96983,-52.93181 41.94697,-52.93181 m 0.15729,19.53156 c -13.73761,0 -14.60278,18.71881 -14.60278,30.38532 0,11.69271 -0.18352,36.65114 14.44549,36.65114 14.44548,0 15.12712,-20.13452 15.12712,-32.40403 0,-8.07477 -0.34082,-17.72257 -2.779,-25.3779 -2.09735,-6.65906 -6.26581,-9.25453 -12.19083,-9.25453" />
                <path d="M 548.00762,105.45424 H 529.4461 c -1.86141,-0.13107 -3.35577,-1.62543 -3.35577,-3.46061 l -0.0262,-95.69149 c 0.1573,-1.75653 1.7041,-3.1198 3.59171,-3.1198 h 17.27691 c 1.62543,0.0786 2.96249,1.17976 3.32954,2.67412 v 14.62899 h 0.3408 c 5.21717,-13.0822 12.53165,-19.32181 25.40412,-19.32181 8.36317,0 16.51662,3.01494 21.75999,11.27324 4.87633,7.65532 4.87633,20.5278 4.87633,29.78233 v 60.22011 c -0.20973,1.67786 -1.75653,3.01492 -3.59169,3.01492 h -18.69262 c -1.70411,-0.13107 -3.11982,-1.38948 -3.30332,-3.01492 V 50.47753 c 0,-10.46052 1.20597,-25.77117 -11.66651,-25.77117 -4.5355,0 -8.70399,3.04117 -10.77512,7.65532 -2.62167,5.84637 -2.96249,11.66651 -2.96249,18.11585 v 51.5161 c -0.0262,1.91383 -1.65166,3.46061 -3.64414,3.46061" />
                <path d="M 55.288261,59.75829 V 55.7209 c -13.475471,0 -27.711211,2.88385 -27.711211,18.77125 0,8.04857 4.16847,13.50169 11.32567,13.50169 5.24337,0 9.93618,-3.22467 12.8987,-8.46805 3.670341,-6.44935 3.486841,-12.50544 3.486841,-19.7675 m 18.79747,45.43378 c -1.23219,1.10111 -3.01495,1.17976 -4.40444,0.4457 -6.18716,-5.1385 -7.28828,-7.52423 -10.69647,-12.42678 -10.224571,10.4343 -17.460401,13.55409 -30.726141,13.55409 -15.67768,0 -27.89471,-9.67401 -27.89471,-29.04824 0,-15.12713 8.20587,-25.43035 19.87236,-30.46398 10.1197,-4.45688 24.25058,-5.24337 35.051931,-6.47556 v -2.41195 c 0,-4.43066 0.34082,-9.67403 -2.25465,-13.50167 -2.280881,-3.43442 -6.632861,-4.85013 -10.460531,-4.85013 -7.10475,0 -13.44924,3.64414 -14.99603,11.19459 -0.31461,1.67789 -1.5468,3.32955 -3.22467,3.4082 L 6.26276,32.67628 C 4.74218,32.33548 3.0643,31.10327 3.48377,28.76999 7.65225,6.85271 27.44596,0.24605 45.16856,0.24605 c 9.071011,0 20.921021,2.41195 28.078221,9.28076 9.07104,8.46804 8.20587,19.7675 8.20587,32.06321 v 29.04826 c 0,8.73022 3.61794,12.55786 7.02613,17.27691 1.20597,1.67786 1.46814,3.69656 -0.05244,4.95497 -3.80144,3.17225 -10.56538,9.07104 -14.28819,12.37436 l -0.05242,-0.0525" />
                <path d="M 55.288261,59.75829 V 55.7209 c -13.475471,0 -27.711211,2.88385 -27.711211,18.77125 0,8.04857 4.16847,13.50169 11.32567,13.50169 5.24337,0 9.93618,-3.22467 12.8987,-8.46805 3.670341,-6.44935 3.486841,-12.50544 3.486841,-19.7675 m 18.79747,45.43378 c -1.23219,1.10111 -3.01495,1.17976 -4.40444,0.4457 -6.18716,-5.1385 -7.28828,-7.52423 -10.69647,-12.42678 -10.224571,10.4343 -17.460401,13.55409 -30.726141,13.55409 -15.67768,0 -27.89471,-9.67401 -27.89471,-29.04824 0,-15.12713 8.20587,-25.43035 19.87236,-30.46398 10.1197,-4.45688 24.25058,-5.24337 35.051931,-6.47556 v -2.41195 c 0,-4.43066 0.34082,-9.67403 -2.25465,-13.50167 -2.280881,-3.43442 -6.632861,-4.85013 -10.460531,-4.85013 -7.10475,0 -13.44924,3.64414 -14.99603,11.19459 -0.31461,1.67789 -1.5468,3.32955 -3.22467,3.4082 L 6.26276,32.67628 C 4.74218,32.33548 3.0643,31.10327 3.48377,28.76999 7.65225,6.85271 27.44596,0.24605 45.16856,0.24605 c 9.071011,0 20.921021,2.41195 28.078221,9.28076 9.07104,8.46804 8.20587,19.7675 8.20587,32.06321 v 29.04826 c 0,8.73022 3.61794,12.55786 7.02613,17.27691 1.20597,1.67786 1.46814,3.69656 -0.05244,4.95497 -3.80144,3.17225 -10.56538,9.07104 -14.28819,12.37436 l -0.05242,-0.0525" transform="translate(244.36719)" />
              </svg>
              <span className="text-white text-[15px] font-medium tracking-tight mt-[1px] ml-0.5">.in</span>
            </div>
            <span className="text-[10px] font-bold text-amazon-orange tracking-wide mt-[-2px] ml-[24px] flex items-center gap-0.5">
              SecondLife <Leaf className="w-2.5 h-2.5 fill-amber-500/10" />
            </span>
          </div>
        </Link>

        {/* Dynamic Location Pin Selector */}
        <LocationSelector />
      </div>

      {/* Center Area: Search Bar (Authentic Amazon style) */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="flex flex-grow max-w-2xl h-10 rounded-md overflow-hidden bg-white border border-transparent focus-within:ring-2 focus-within:ring-amazon-orange shadow-sm items-center"
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
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow w-full min-w-0 px-3 text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none h-full"
        />

        {/* Yellow Search Action Button */}
        <button 
          type="submit" 
          className="bg-[#febd69] hover:bg-[#f3a847] flex items-center justify-center px-6 transition cursor-pointer h-full shrink-0"
        >
          <Search className="w-5 h-5 text-slate-900 stroke-[2.5]" />
        </button>
      </form>

      {/* Right Area: Action Anchors */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        
        {/* Language selector (EN) */}
        <div 
          onClick={() => alert('Language options: English (EN)')}
          className="hidden sm:flex items-center gap-1 border border-transparent hover:border-white px-2 py-2 rounded transition cursor-pointer text-xs font-extrabold"
        >
          <Globe className="w-4 h-4 text-slate-300" />
          <span className="text-white">EN</span>
          <ChevronDown className="w-3 h-3 text-slate-400 mt-1" />
        </div>

        {/* Admin Link */}
        <Link 
          href="/admin"
          className="hidden sm:flex flex-col text-left border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer leading-tight select-none"
        >
          <span className="text-[11px] text-slate-300">Command Center</span>
          <span className="text-xs font-extrabold text-white flex items-center gap-0.5">
            Admin Portal
          </span>
        </Link>

        {/* Driver App Link */}
        <Link 
          href="/driver"
          className="hidden sm:flex flex-col text-left border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer leading-tight select-none"
        >
          <span className="text-[11px] text-slate-300">Delivery Partner</span>
          <span className="text-xs font-extrabold text-white flex items-center gap-0.5">
            Driver App
          </span>
        </Link>

        {/* Seller Copilot Link */}
        <Link 
          href="/seller-dashboard"
          className={`hidden sm:flex flex-col text-left border border-transparent hover:border-white px-2 py-1.5 rounded transition cursor-pointer leading-tight select-none group ${
            pathname === '/seller-dashboard' ? 'border-white' : ''
          }`}
        >
          <span className="text-[11px] text-slate-300">Merchant Tools</span>
          <span className={`text-xs font-extrabold flex items-center gap-0.5 transition-colors ${
            pathname === '/seller-dashboard' ? 'text-amber-500' : 'text-white group-hover:text-amber-500'
          }`}>
            Seller Copilot
          </span>
        </Link>

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
          <span className="text-[11px] text-amazon-orange font-bold">New</span>
          <span className="text-xs font-extrabold text-white">SecondLife</span>
        </Link>

        {/* Shopping Cart Icon (outline style with circular badge) */}
        <button
          onClick={() => router.push('/cart')}
          className="relative flex items-center gap-1.5 border border-transparent hover:border-white px-2.5 py-2 rounded transition cursor-pointer text-xs font-extrabold"
          title="Cart"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-white stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-amazon-blue text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center leading-none border-2 border-amazon-blue translate-x-1.5">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-white mt-3 hidden sm:inline">Cart</span>
        </button>

      </div>
    </header>
  );
}
