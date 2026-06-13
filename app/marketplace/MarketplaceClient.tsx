'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Leaf, Filter, RefreshCw, Star, ShoppingCart, ArrowRight, X, Activity } from 'lucide-react';
import { Product } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { formatPrice, getConditionColorClass, getConditionLabel } from '@/lib/utils';
import { DeliveryBadge } from '@/src/components/DeliveryBadge';
import { useCart } from '@/src/context/CartContext';

export default function MarketplaceClient({ initialItems = [] }: { initialItems: any[] }) {
  return (
    <React.Suspense fallback = {
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <RefreshCw className="w-10 h-10 text-amazon-orange animate-spin" />
          <p className="text-slate-500 text-sm font-semibold">Loading Circular Marketplace...</p>
        </div>
      </div>
    }>
      <MarketplaceContent initialItems={initialItems} />
    </React.Suspense>
  );
}

function MarketplaceContent({ initialItems }: { initialItems: any[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // State
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedPassport, setSelectedPassport] = useState<any>(null);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate lists with standard products + any custom uploaded product in localStorage
  useEffect(() => {
    const liveMapped = initialItems.map((item: any) => ({
      id: item.id,
      name: item.product?.name || 'Unknown Product',
      category: item.product?.category || 'Electronics',
      resalePrice: item.product?.price || 0,
      originalPrice: (item.product?.price || 0) * 1.3,
      condition: item.condition,
      conditionNotes: item.sellerNotes || '',
      image: '/images/products/placeholder.jpg',
      sellerName: 'Amazon Certified',
      co2SavedKg: 25,
      healthCard: item.productHealthCard ? {
        cosmeticScore: Math.floor(item.productHealthCard.conditionScore / 10) || 9,
        batteryHealth: item.productHealthCard.performanceHealth.includes('Battery') ? parseInt(item.productHealthCard.performanceHealth.match(/\d+/)?.[0] || '100') : 100,
        warrantyStatus: 'Certified',
        raw: item.productHealthCard
      } : {
        cosmeticScore: 9,
        batteryHealth: 100,
        warrantyStatus: 'Certified',
        raw: null
      }
    }));
    
    // Fallback to mock products if DB is empty for demo purposes
    let list = [...liveMapped];
    if (list.length === 0) {
      list = [...mockProducts];
    }
    setProducts(list);
  }, [initialItems]);

  // Synchronize state filters with query parameters
  useEffect(() => {
    const categoryQuery = searchParams.get('category') || 'All';
    const searchQueryParam = searchParams.get('search') || '';
    
    setSelectedCategory(categoryQuery);
    setSearchQuery(searchQueryParam);
  }, [searchParams]);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Condition
    if (selectedCondition !== 'All') {
      result = result.filter((p) => p.condition === selectedCondition);
    }

    // Filter by Price
    result = result.filter((p) => p.resalePrice <= maxPrice);

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || 
               p.conditionNotes.toLowerCase().includes(q) || 
               p.category.toLowerCase().includes(q)
      );
    }

    // Sort Results
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.resalePrice - b.resalePrice);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.resalePrice - a.resalePrice);
    } else if (sortBy === 'co2') {
      result.sort((a, b) => b.co2SavedKg - a.co2SavedKg);
    } else if (sortBy === 'grade') {
      result.sort((a, b) => b.healthCard.cosmeticScore - a.healthCard.cosmeticScore);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedCondition, maxPrice, sortBy, searchQuery]);

  const clearFilters = () => {
    setSelectedCategory('All');
    setSelectedCondition('All');
    setMaxPrice(1000);
    setSortBy('featured');
    setSearchQuery('');
    router.push('/marketplace');
  };

  const handleQtyChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  return (
    <div className="p-6 w-full flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* Search Header Info Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
        <div>
          <span className="text-xs text-slate-500 font-extrabold uppercase">Circular Catalogue</span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Certified Pre-Owned SecondLife Listings'}
          </h1>
          <p className="text-xs text-slate-605 mt-1 font-medium">
            Showing {filteredProducts.length} verified eco-listings matching your filters.
          </p>
        </div>
        
        {/* Sort box */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold shrink-0">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-slate-300 bg-white rounded-lg px-2.5 py-1.5 cursor-pointer text-slate-705 outline-none focus:border-amazon-orange font-bold"
          >
            <option value="featured">Featured Hub</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="co2">Highest CO2 Saved</option>
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
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold">
              {['All', 'Electronics', 'Home & Kitchen', 'Apparel', 'Books/Media'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    router.push(cat === 'All' ? '/marketplace' : `/marketplace?category=${encodeURIComponent(cat)}`);
                  }}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedCategory === cat ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {cat === 'Home & Kitchen' ? 'Kitchen' : cat === 'Books/Media' ? 'Books' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Facet 2: Condition */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Condition Grade</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-700 font-bold">
              {['All', 'like_new', 'very_good', 'good', 'acceptable'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => setSelectedCondition(cond)}
                  className={`text-left hover:text-amazon-orange transition cursor-pointer ${
                    selectedCondition === cond ? 'font-black text-amazon-orange pl-1 border-l-2 border-amazon-orange' : ''
                  }`}
                >
                  {cond === 'All' ? 'All Grades' : getConditionLabel(cond as Product['condition'])}
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
              onChange={(e) => setMaxPrice(Number(e.target.value))}
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
                          onClick={() => addToCart(product, qty)}
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
        </main>
      </div>

      {/* Modal Drawer for ProductHealthCard */}
      {selectedPassport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 flex items-center justify-between text-white">
              <h2 className="text-xl font-extrabold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Digital Product Passport
              </h2>
              <button onClick={() => setSelectedPassport(null)} className="text-slate-400 hover:text-white transition cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Product Name', value: selectedPassport.productName || 'N/A' },
                { label: 'Condition Score', value: `${selectedPassport.conditionScore || 90}/100` },
                { label: 'Damage Detection', value: selectedPassport.damageDetection || 'None' },
                { label: 'Repair History', value: selectedPassport.repairHistory || 'No repairs' },
                { label: 'Performance Health', value: selectedPassport.performanceHealth || 'Optimal' },
                { label: 'AI Recommendation', value: selectedPassport.aiRecommendation || 'Approved' },
                { label: 'Authenticity Verified', value: selectedPassport.authenticityVerified === false ? 'No' : 'Yes' }
              ].map((metric, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 text-left">
                  <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">{metric.label}</span>
                  <span className="text-sm font-extrabold text-slate-900 text-right max-w-[50%] leading-tight">{metric.value}</span>
                </div>
              ))}
            </div>
            <div className="bg-slate-50 p-5 border-t border-slate-200">
              <button 
                onClick={() => setSelectedPassport(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition cursor-pointer active:scale-[0.98]"
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
