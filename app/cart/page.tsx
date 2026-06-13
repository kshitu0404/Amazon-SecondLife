'use client';

import React, { useState } from 'react';
import { useCart } from '@/src/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { Trash2, ShieldCheck, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cartItems, cartTotal, cartCount, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Simulate checkout process
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      setCheckoutSuccess(true);
    }, 1500);
  };

  if (checkoutSuccess) {
    return (
      <div className="max-w-4xl mx-auto w-full px-4 py-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-6">
          Thank you for shopping on Amazon SecondLife. You're giving these items a new home and saving carbon emissions!
        </p>
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-amazon-blue hover:bg-amazon-secondary text-white font-bold py-2 px-6 rounded transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto w-full px-4 py-12 flex flex-col items-center">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 w-full max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Amazon SecondLife Cart is empty.</h2>
          <p className="text-sm text-slate-600 mb-6">
            Check your Saved for later items below or continue shopping.
          </p>
          <button
            onClick={() => router.push('/marketplace')}
            className="bg-amazon-blue hover:bg-amazon-secondary text-white font-bold py-2 px-6 rounded transition shadow"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex flex-col lg:flex-row gap-6 items-start">
      {/* Left side: Cart Items List */}
      <div className="flex-grow w-full bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-6 text-left">
        <h1 className="text-2xl font-bold text-slate-900 mb-1 border-b border-slate-200 pb-4 flex justify-between items-end">
          Shopping Cart
          <span className="text-sm font-normal text-slate-500">Price</span>
        </h1>

        <div className="flex flex-col gap-6 pt-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 pb-6">
              {/* Product Image */}
              <div className="w-full sm:w-40 h-40 shrink-0 bg-slate-50 border border-slate-100 rounded p-2 flex items-center justify-center cursor-pointer" onClick={() => router.push(`/health-card?id=${item.product.id}`)}>
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              </div>

              {/* Product Details */}
              <div className="flex-grow flex flex-col">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 
                      onClick={() => router.push(`/health-card?id=${item.product.id}`)}
                      className="text-base font-bold text-sky-750 hover:text-sky-900 cursor-pointer line-clamp-2 leading-tight"
                    >
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5 fill-emerald-500/10" />
                      Saves {item.product.co2SavedKg} kg CO2
                    </p>
                    <p className="text-xs text-slate-500 mt-1 capitalize">
                      Condition: <span className="font-semibold text-slate-700">{item.product.condition.replace('_', ' ')}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sold by: <span className="text-sky-750">{item.product.sellerName || 'Amazon Certified'}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(item.product.resalePrice)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-auto pt-4">
                  <div className="flex items-center border border-slate-300 rounded overflow-hidden shadow-xs bg-slate-50">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 bg-white border-x border-slate-300 text-sm font-semibold min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 transition font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-slate-300">|</span>

                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-xs font-semibold text-sky-750 hover:text-sky-900 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end pt-4">
          <p className="text-lg font-normal">
            Subtotal ({cartCount} item{cartCount !== 1 && 's'}): <span className="font-bold">{formatPrice(cartTotal)}</span>
          </p>
        </div>
      </div>

      {/* Right side: Checkout Card */}
      <div className="w-full lg:w-72 shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 p-4 md:p-5 flex flex-col gap-4 text-left">
        <p className="text-lg font-normal">
          Subtotal ({cartCount} item{cartCount !== 1 && 's'}): <br/>
          <span className="font-bold text-slate-900">{formatPrice(cartTotal)}</span>
        </p>
        
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-100">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold">Your order qualifies for FREE AI Verified Delivery.</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="w-full bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0c14b] disabled:opacity-50 border border-[#a88734] rounded-md py-2 px-3 text-sm font-bold text-slate-900 transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {isCheckingOut ? (
            <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Proceed to Checkout'
          )}
        </button>
      </div>
    </div>
  );
}
