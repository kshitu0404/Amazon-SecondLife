'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Leaf, Filter, RefreshCw, Star, ShoppingCart, ArrowRight, X, Activity, BarChart2, ShieldAlert, Search } from 'lucide-react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { formatPrice, getConditionColorClass, getConditionLabel } from '@/lib/utils';
import { DeliveryBadge } from '@/src/components/DeliveryBadge';
import { useCart } from '@/src/context/CartContext';
import { useNovaMarketplace } from '@/src/components/nova/useNovaPage';

const CHANNELS = [
  { id: "certified_preloved", name: "Certified Preloved", desc: "AI-graded used products with full condition disclosure" },
  { id: "rental", name: "Rental", desc: "Rent for days, weeks, or months" },
  { id: "exchange", name: "Exchange", desc: "Direct item swaps — no money changes hands" },
  { id: "donation", name: "Donation", desc: "Match donors with verified NGOs" },
  { id: "parts", name: "Parts & Materials", desc: "Harvest value from end-of-life products" },
  { id: "p2p", name: "Peer-to-Peer Resale", desc: "C2C resale inside trusted rails" },
];

const SYNONYMS: Record<string, string[]> = {
  'shoe': ['nike', 'sneaker', 'footwear', 'boot', 'air force', 'apparel'],
  'shoes': ['nike', 'sneaker', 'footwear', 'boot', 'air force', 'apparel'],
  'phone': ['iphone', 'smartphone', 'mobile', 'apple', 'samsung', 'electronics'],
  'phones': ['iphone', 'smartphone', 'mobile', 'apple', 'samsung', 'electronics'],
  'laptop': ['macbook', 'dell', 'thinkpad', 'computer', 'pc', 'electronics'],
  'laptops': ['macbook', 'dell', 'thinkpad', 'computer', 'pc', 'electronics'],
  'clothes': ['apparel', 'shirt', 'jacket', 'wear', 'hoodie'],
  'watch': ['apple watch', 'smartwatch', 'timepiece'],
  'tv': ['television', 'screen', 'display', 'samsung', 'electronics'],
  'apple': ['iphone', 'macbook', 'ipad', 'watch'],
};

export default function MarketplaceClient(props: any) {
  return (
    <React.Suspense fallback={
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amazon-orange animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading Circular Marketplace...</p>
        </div>
      </div>
    }>
      <MarketplaceContent {...props} />
    </React.Suspense>
  );
}

function MarketplaceContent({ 
  initialItems = [],
  totalCount = 0,
  totalPages = 1,
  currentPage = 1,
  uniqueBrands = [],
  uniqueLocations = []
}: { 
  initialItems: any[];
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  uniqueBrands?: string[];
  uniqueLocations?: string[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // URL States
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedCondition = searchParams.get('condition') || 'All';
  const selectedBrand = searchParams.get('brand') || 'All';
  const selectedLocation = searchParams.get('location') || 'All';
  const maxPrice = parseInt(searchParams.get('maxPrice') || '1000', 10);
  const sortBy = searchParams.get('sortBy') || 'featured';
  const searchQuery = searchParams.get('search') || '';

  // Local State
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedPassport, setSelectedPassport] = useState<any>(null);

  // New Reference Features State
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [selectedQty, setSelectedQty] = useState<number>(1);
  const [prediction, setPrediction] = useState<any>(null);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [sizeAdvice, setSizeAdvice] = useState<any>(null);
  const [loadingSize, setLoadingSize] = useState(false);
  const [pageMountTime] = useState(Date.now());

  const { novaSearchBuyers, novaMatchFound } = useNovaMarketplace();

  // Helper to push URL changes
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'All' && value !== '1000') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '1');
    router.push(`/marketplace?${params.toString()}`);
  };

  // Map incoming items
  const filteredProducts = initialItems.map((item: any) => ({
    id: item.id,
    name: item.product?.name || 'Unknown Product',
    category: item.product?.category || 'Electronics',
    brand: item.product?.brand || 'Unknown',
    location: item.city || 'Unknown',
    resalePrice: item.product?.price || 0,
    originalPrice: (item.product?.price || 0) * 1.3,
    condition: item.condition,
    conditionNotes: item.sellerNotes || '',
    image: item.product?.image || '/images/products/placeholder.jpg',
    sellerName: item.sellerName || 'Amazon Certified',
    co2SavedKg: 25,
    healthCard: item.productHealthCard ? {
      cosmeticScore: Math.floor(item.productHealthCard.conditionScore / 10) || 9,
      batteryHealth: item.productHealthCard.performanceHealth?.includes('Battery') ? parseInt(item.productHealthCard.performanceHealth.match(/\d+/)?.[0] || '100') : 100,
      warrantyStatus: 'Certified',
      raw: item.productHealthCard
    } : {
      cosmeticScore: 9,
      batteryHealth: 100,
      warrantyStatus: 'Certified',
      raw: null
    }
  }));

  // Sort logic (client side for simplicity since we want these exact sorts and DB might not match)
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.resalePrice - b.resalePrice);
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.resalePrice - a.resalePrice);
  } else if (sortBy === 'grade') {
    filteredProducts.sort((a, b) => b.healthCard.cosmeticScore - a.healthCard.cosmeticScore);
  }

  // Nova AI Integration
  useEffect(() => {
    if (filteredProducts.length > 0) {
      novaSearchBuyers();
      const timer = setTimeout(() => {
        novaMatchFound({
          count: totalCount * 3 + Math.floor(Math.random() * 5),
          radius: 5,
          productType: selectedCategory === 'All' ? 'items' : selectedCategory.toLowerCase()
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [totalCount]);

  const clearFilters = () => {
    router.push('/marketplace');
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleBuyClick = async (product: any, qty: number) => {
    setSelectedListing(product);
    setSelectedQty(qty);
    setLoadingPredict(true);
    setPrediction(null);
    setLoadingSize(true);
    setSizeAdvice(null);

    const timeSpentSec = Math.round((Date.now() - pageMountTime) / 1000);
    const mockBehavior = { timeOnPage: Math.min(300, timeSpentSec || 25) };

    try {
      const pRes = await fetch('/api/marketplace/predict-return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ behavior: mockBehavior, category: product.category })
      });
      const pData = await pRes.json();
      setPrediction(pData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPredict(false);
    }

    try {
      const sRes = await fetch(`/api/marketplace/size-advice?category=${encodeURIComponent(product.category)}`);
      const sData = await sRes.json();
      setSizeAdvice(sData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSize(false);
    }
  };

  const confirmPurchase = () => {
    addToCart(selectedListing, selectedQty);
    setSelectedListing(null);
    setPrediction(null);
    setSizeAdvice(null);
  };

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* 6 Interconnected Channels (Added without altering the surrounding styles) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CHANNELS.map((c) => (
          <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition text-left cursor-pointer group">
            <div className="font-extrabold text-slate-800 text-sm group-hover:text-amazon-orange transition">{c.name}</div>
            <div className="mt-1 text-[10px] text-slate-500 font-medium leading-tight">{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Search Header Info Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
        <div>
          <span className="text-xs text-slate-500 font-extrabold uppercase">Circular Catalogue</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Certified Pre-Owned SecondLife Listings'}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Showing {filteredProducts.length} verified eco-listings matching your filters.
          </p>
        </div>
        
        {/* Local Search Bar */}
        <div className="relative flex-grow max-w-md mx-4 hidden lg:block">
          <input 
            type="text" 
            placeholder="Search circular catalogue (Press Enter)..." 
            defaultValue={searchQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateFilter('search', e.currentTarget.value);
            }}
            onBlur={(e) => updateFilter('search', e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-amazon-orange focus:ring-1 focus:ring-amazon-orange transition shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Sort box */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold shrink-0">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 cursor-pointer text-slate-700 outline-none focus:border-amazon-orange font-bold"
          >
            <option value="featured">Featured Hub</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="grade">Highest Health Grade</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Filter Sidebar */}
        <aside className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6 h-fit text-left">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" /> Filters
            </h3>
            {(selectedCategory !== 'All' || selectedCondition !== 'All' || maxPrice !== 1000 || searchQuery) && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-extrabold text-sky-700 hover:text-sky-850 hover:underline uppercase cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Facet 1: Category */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Category</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold max-h-48 overflow-y-auto">
              {['All', 'Electronics', 'Home & Kitchen', 'Apparel', 'Books/Media', 'Shoes'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateFilter('category', cat)}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedCategory === cat ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {cat === 'Home & Kitchen' ? 'Kitchen' : cat === 'Books/Media' ? 'Books' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Facet 2: Brand */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Brand</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold max-h-40 overflow-y-auto">
              <button
                onClick={() => updateFilter('brand', 'All')}
                className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                  selectedBrand === 'All' ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                }`}
              >
                All Brands
              </button>
              {uniqueBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => updateFilter('brand', brand)}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedBrand === brand ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Facet 3: Condition */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Condition Grade</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold">
              {['All', 'like_new', 'very_good', 'good', 'acceptable'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => updateFilter('condition', cond)}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedCondition === cond ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {cond === 'All' ? 'All Grades' : getConditionLabel(cond as Product['condition'])}
                </button>
              ))}
            </div>
          </div>

          {/* Facet 4: Location */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Location</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold max-h-40 overflow-y-auto">
              <button
                onClick={() => updateFilter('location', 'All')}
                className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                  selectedLocation === 'All' ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                }`}
              >
                Anywhere
              </button>
              {uniqueLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => updateFilter('location', loc)}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedLocation === loc ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Facet 3: Price range */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Max Price</span>
              <span className="text-[#b12704] font-black">{formatPrice(maxPrice)}</span>
            </h4>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
              className="w-full accent-amazon-orange cursor-pointer h-1.5 bg-slate-200 rounded"
            />
          </div>

          {/* Environmental Stamp Info */}
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-600 leading-normal flex items-start gap-2 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
            <Leaf className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
            <p className="font-semibold">
              Every listing shown is **AI certified** for condition accuracy, verified cosmetic parameters, and carbon savings credits.
            </p>
          </div>
        </aside>

        {/* Right Column: Listing Grid */}
        <main className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
              <RefreshCw className="w-8 h-8 text-slate-300" />
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-slate-900">No Listings Match Filters</h3>
                <p className="text-xs text-slate-500 max-w-sm font-semibold">
                  Try clearing your search query, adjusting your price limits, or selecting a different category.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="bg-[#ffd814] hover:bg-[#f7ca00] text-black font-extrabold py-2 px-4.5 rounded-lg transition text-xs shadow-sm cursor-pointer border border-[#a88734]"
              >
                Reset Catalogue Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const qty = quantities[product.id] || 1;
                return (
                  <div
                    key={product.id}
                    className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between p-4"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="relative h-44 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center rounded">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                        
                        {/* AI Verified Stamp */}
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 py-0.5 px-2 rounded flex items-center gap-1 shadow-xs select-none">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
                          <span className="text-[10px] font-extrabold text-slate-700">AI VERIFIED</span>
                        </div>

                        {/* Condition badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm ${getConditionColorClass(product.condition)}`}>
                            {getConditionLabel(product.condition)}
                          </span>
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="pt-4 space-y-1.5 text-left">
                        <div className="flex justify-between items-center text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                          <span>{product.category}</span>
                          {product.sellerName === 'You (Trader)' && (
                            <span className="text-[#10b981] bg-[#10b981]/10 px-1.5 rounded uppercase font-black text-[9px]">YOURS</span>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug hover:text-amber-600 transition">
                          <Link href={`/health-card?id=${product.id}`}>{product.name}</Link>
                        </h3>

                        {/* AI pricing badge */}
                        <div className="mt-1.5 text-[10px] text-emerald-600 flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 w-fit font-bold">
                          <span>♺</span>
                          <span>AI Price Recommended · expected sale in 5 days</span>
                        </div>
                        
                        {/* Health Passport summary metrics */}
                        <div className="flex flex-col gap-1 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200 mt-2 shadow-xs">
                          <div className="flex justify-between items-center">
                            <span>Cosmetic Health:</span>
                            <strong className="text-slate-800 font-bold">{product.healthCard.cosmeticScore}/10</strong>
                          </div>
                          {product.healthCard.batteryHealth !== null && (
                            <div className="flex justify-between items-center">
                              <span>Battery Health:</span>
                              <strong className="text-slate-800 font-bold">{product.healthCard.batteryHealth}%</strong>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span>Warranty Status:</span>
                            <strong className="text-slate-800 font-bold">{product.healthCard.warrantyStatus}</strong>
                          </div>
                        </div>

                        {/* Carbon Saved Badge */}
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5 mt-2">
                          <Leaf className="w-3.5 h-3.5 fill-emerald-500/10" />
                          <span>Offset: {product.co2SavedKg} kg CO2</span>
                        </div>
                        
                        {/* AI Delivery Routing Badge */}
                        <DeliveryBadge productId={product.id} />
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex flex-col text-left">
                      <div className="flex items-baseline justify-between items-center">
                        <div>
                          <span className="text-xs text-slate-400 line-through mr-1.5 font-medium">
                            {formatPrice(product.originalPrice)}
                          </span>
                          <span className="text-base font-extrabold text-[#b12704]">
                            {formatPrice(product.resalePrice)}
                          </span>
                        </div>

                        {/* Qty button group */}
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

                      {/* Cart and Passport CTAs */}
                      <div className="grid grid-cols-3 gap-2 mt-3.5">
                        <button
                          onClick={() => setSelectedPassport(product.healthCard?.raw || { productName: product.name, conditionScore: product.healthCard.cosmeticScore * 10 })}
                          className="col-span-1 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold py-2 px-1 rounded border border-slate-300 text-center transition shadow-xs cursor-pointer"
                        >
                          Passport
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleBuyClick(product, qty)}
                          className="col-span-2 bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0c14b] border border-[#a88734] rounded py-2 px-2 text-[11px] font-bold text-slate-900 transition flex items-center justify-center gap-1 cursor-pointer shadow-xs active:shadow-inner"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button 
                disabled={currentPage <= 1}
                onClick={() => updateFilter('page', String(currentPage - 1))}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition shadow-sm text-slate-700"
              >
                Previous
              </button>
              <div className="text-sm font-extrabold text-slate-600 px-4 bg-slate-100 py-2 rounded-lg border border-slate-200">
                Page {currentPage} of {totalPages}
              </div>
              <button 
                disabled={currentPage >= totalPages}
                onClick={() => updateFilter('page', String(currentPage + 1))}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold disabled:opacity-50 hover:bg-slate-50 hover:border-slate-400 cursor-pointer transition shadow-sm text-slate-700"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Checkout Return Prediction Modal - Styled consistently with Amazon SecondLife */}
      {selectedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className={`w-full ${selectedListing?.category === "Apparel" ? "max-w-4xl" : "max-w-xl"} bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]`}>
            
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between text-slate-900">
              <div>
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  Review & Checkout
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Previewing circular return intent & pricing diagnostics.</p>
              </div>
              <button onClick={() => { setSelectedListing(null); setPrediction(null); setSizeAdvice(null); }} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-left">
              {/* Item Summary */}
              <div className="flex gap-4 rounded-xl bg-slate-50 border border-slate-200 p-4 items-center shadow-sm">
                <div className="relative h-20 w-20 flex-shrink-0 bg-white overflow-hidden rounded-lg border border-slate-200 p-1">
                  <img src={selectedListing.image} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg text-slate-900 truncate">{selectedListing.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xl font-black text-[#b12704]">{formatPrice(selectedListing.resalePrice)}</span>
                    {selectedListing.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">{formatPrice(selectedListing.originalPrice)}</span>
                    )}
                    <span className="bg-slate-100 text-slate-600 border border-slate-300 text-[10px] rounded px-2 py-0.5 uppercase tracking-wider font-extrabold">
                      Qty: {selectedQty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid Wrapper for Side-by-Side Cards */}
              <div className={selectedListing?.category === "Apparel" ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-6"}>
                
                {/* RIP Analysis Card */}
                <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-slate-400" />
                      <span className="text-sm font-extrabold text-slate-800 tracking-wide">AI Return Risk Assessment</span>
                    </div>
                    {prediction && (
                      <span className={`text-[10px] font-extrabold tracking-wider capitalize border px-2 py-0.5 rounded shadow-sm ${
                        prediction.riskLevel === "HIGH" 
                          ? "bg-rose-50 text-rose-700 border-rose-200" 
                          : prediction.riskLevel === "MEDIUM" 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}>
                        {prediction.riskLevel} RISK
                      </span>
                    )}
                  </div>

                  {loadingPredict ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-3">
                      <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
                      <p className="text-xs text-slate-500 font-semibold">Evaluating circular return patterns...</p>
                    </div>
                  ) : prediction ? (
                    <div className="space-y-4">
                      {/* Visual Gauge */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Return Probability</span>
                          <span className={`font-black text-sm ${
                            prediction.riskLevel === "HIGH" ? "text-rose-600" : prediction.riskLevel === "MEDIUM" ? "text-amber-500" : "text-emerald-600"
                          }`}>{prediction.returnProbability ?? 0}%</span>
                        </div>
                        <div className="relative pt-1">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <div className={`h-full rounded-full transition-all duration-500 relative ${
                              prediction.riskLevel === "HIGH" ? "bg-rose-500" : prediction.riskLevel === "MEDIUM" ? "bg-amber-500" : "bg-emerald-500"
                            }`} style={{ width: `${prediction.returnProbability || 0}%` }} />
                          </div>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      {prediction.topFactors && prediction.topFactors.length > 0 && (
                        <div className="space-y-2 rounded-lg bg-rose-50 border border-rose-100 p-3">
                          <div className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5" /> Top Risk Factors
                          </div>
                          <ul className="text-xs text-slate-700 font-semibold space-y-1.5 pl-1">
                            {prediction.topFactors.map((f: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-rose-400 mt-0.5">•</span>
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <div className="space-y-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                          <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Leaf className="w-3.5 h-3.5" /> Recommended Mitigation
                          </div>
                          <ul className="text-xs text-slate-700 font-semibold space-y-1.5 pl-1">
                            {prediction.recommendations.map((r: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
   
                {/* SSA Smart Size Advisor */}
                {selectedListing?.category === "Apparel" && (
                  <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sky-500 text-lg">👕</span>
                        <span className="text-sm font-extrabold text-slate-800 tracking-wide">Smart Size Advisor</span>
                      </div>
                      {sizeAdvice && sizeAdvice.confidenceScore && (
                        <span className="text-[10px] font-extrabold tracking-wider border border-sky-200 bg-sky-50 text-sky-700 rounded px-2 py-0.5 shadow-sm">
                          {sizeAdvice.confidenceScore}% FIT CONFIDENCE
                        </span>
                      )}
                    </div>
    
                    {loadingSize ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6 text-slate-300 animate-spin" />
                      </div>
                    ) : sizeAdvice && sizeAdvice.recommendedSize ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-sky-50 border border-sky-100 rounded-lg p-3 shadow-sm">
                          <span className="text-xs text-slate-600 font-bold">Recommended Size</span>
                          <span className="text-sm font-black text-sky-800 bg-white border border-sky-200 px-3 py-1 rounded shadow-sm">
                            Size {sizeAdvice.recommendedSize} ({sizeAdvice.fitPrediction})
                          </span>
                        </div>
                        {sizeAdvice.reasoning && (
                          <div className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-start gap-2 font-medium">
                            <span className="italic leading-relaxed">"{sizeAdvice.reasoning}"</span>
                          </div>
                        )}
                        
                        {sizeAdvice.alternativeSizes && sizeAdvice.alternativeSizes.length > 0 && (
                          <div className="text-[11px] text-slate-600 leading-normal border-t border-slate-100 pt-3">
                            <span className="font-extrabold text-slate-800">Fit Alternatives:</span>
                            <ul className="space-y-1 mt-1.5 pl-0.5 font-medium">
                              {sizeAdvice.alternativeSizes.map((a: any, i: number) => (
                                <li key={i} className="flex justify-between border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                                  <span className="font-bold text-sky-700">Size {a?.size}</span>
                                  <span className="text-slate-500">{a?.tradeoff}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 font-bold text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                        Sizing metrics unavailable. Proceed with selection.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dynamic Circular Price Protected */}
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-slate-700 flex gap-3 items-start shadow-sm">
                <Leaf className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-emerald-800 mb-0.5 text-sm">Dynamic Circular Price Protected</div>
                  <span className="text-emerald-700 font-medium leading-relaxed">This preloved price is calculated based on brand retention and regional demand velocity. If unsold, prices update automatically per circular scheduling.</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-5 border-t border-slate-200 flex gap-3">
              <button 
                onClick={() => { setSelectedListing(null); setPrediction(null); setSizeAdvice(null); }} 
                className="flex-1 py-3 text-sm rounded-lg font-extrabold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPurchase}
                className="flex-1 py-3 text-sm rounded-lg font-extrabold bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734] shadow-sm transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Confirm & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Product Passport Modal */}
      {selectedPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm font-sans">
          <div className="bg-[#FFFBEA] border-4 border-amazon-orange rounded-xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            {/* Passport Cover / Header */}
            <div className="bg-amazon-blue p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white tracking-widest uppercase">Digital Passport</h3>
                <p className="text-amazon-orange font-bold text-xs tracking-widest uppercase mt-1">Amazon SecondLife Verified</p>
              </div>
              <ShieldCheck className="w-10 h-10 text-amazon-orange" />
            </div>
            
            <div className="p-6 relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Leaf className="w-32 h-32 text-emerald-900" />
              </div>

              <div className="space-y-6 relative z-10">
                {/* Product Info */}
                <div className="border-b-2 border-dashed border-slate-300 pb-4">
                  <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Product Identity</div>
                  <div className="text-xl font-black text-slate-900">{selectedPassport.productName || 'Pre-owned Item'}</div>
                  {selectedPassport.brand && <div className="text-sm font-bold text-slate-500 mt-1">Brand: {selectedPassport.brand}</div>}
                </div>

                {/* Condition & Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Cosmetic Score</div>
                    <div className="text-2xl font-black text-amazon-blue">{selectedPassport.conditionScore || 'N/A'}<span className="text-sm text-slate-400">/100</span></div>
                  </div>
                  
                  {selectedPassport.functionalScore && (
                    <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Functional Score</div>
                      <div className="text-2xl font-black text-emerald-600">{selectedPassport.functionalScore}<span className="text-sm text-slate-400">/100</span></div>
                    </div>
                  )}
                  
                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm col-span-2">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Diagnostics</div>
                    <div className="text-sm font-medium text-slate-700">
                      {selectedPassport.diagnostics ? selectedPassport.diagnostics : 'Standard visual AI inspection passed. Functional integrity maintained.'}
                    </div>
                  </div>
                </div>

                {/* Sustainability Impact */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                  <Leaf className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-black text-emerald-800 uppercase tracking-wider mb-1">Eco-Impact</div>
                    <div className="text-sm font-medium text-emerald-700">
                      Purchasing this pre-owned item extends its lifecycle and prevents an estimated <strong>25 kg</strong> of CO2 emissions compared to buying new.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedPassport(null)} 
                className="py-2.5 px-6 text-sm rounded font-extrabold bg-[#ffd814] hover:bg-[#f7ca00] text-slate-900 border border-[#a88734] shadow-sm transition"
              >
                Close Passport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
