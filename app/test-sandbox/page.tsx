'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  CheckCircle, 
  PackageSearch, 
  RotateCcw, 
  Search, 
  Truck, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function TestSandbox() {
  // Step 1: Buyer B State
  const [buyerBProduct, setBuyerBProduct] = useState('prod_ipad_pro_11');
  const [buyerBAddress, setBuyerBAddress] = useState('Indiranagar, Bangalore, 560038');
  const [buyerBOrderId, setBuyerBOrderId] = useState<string | null>(null);
  const [buyerBStatus, setBuyerBStatus] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);

  // Step 2: Buyer A State
  const [buyerAAddress, setBuyerAAddress] = useState('Domlur, Bangalore, 560071'); // Very close to Indiranagar
  const [buyerAHasAsset, setBuyerAHasAsset] = useState(false);
  const [buyerAReturnInitiated, setBuyerAReturnInitiated] = useState(false);

  // Step 3: Trade-In State
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectionPassed, setInspectionPassed] = useState(false);
  const [tradeInId, setTradeInId] = useState<string | null>(null);

  // Step 4: Interception Routing State
  const [isRouting, setIsRouting] = useState(false);
  const [routeResult, setRouteResult] = useState<any | null>(null);

  // Handlers
  const handlePlaceOrder = async () => {
    setIsOrdering(true);
    const mockOrderId = `ord_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      const res = await fetch('/api/webhooks/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: mockOrderId,
          productId: buyerBProduct,
          shippingAddress: buyerBAddress,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setBuyerBOrderId(data.data.id);
        setBuyerBStatus(data.data.status);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order.');
    } finally {
      setIsOrdering(false);
    }
  };

  const handleSimulateInspection = async () => {
    setIsInspecting(true);
    // Simulate Gemini Vision processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    setInspectionPassed(true);
    setIsInspecting(false);
    setTradeInId(`trd_${Math.random().toString(36).substring(2, 9)}`);
  };

  const handleRunRoutingEngine = async () => {
    setIsRouting(true);
    try {
      const res = await fetch('/api/trade-in/route-allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tradeInId: tradeInId,
          productId: buyerBProduct, // Must match the order for a successful interception
          addressString: buyerAAddress,
          condition: 'Like New',
          sellerNotes: 'Opened box but barely used.',
        }),
      });
      
      const data = await res.json();
      setRouteResult(data);
    } catch (err) {
      console.error(err);
      alert('Routing engine failed.');
    } finally {
      setIsRouting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-amazon-blue flex items-center justify-center gap-2">
            <RotateCcw className="w-8 h-8 text-amazon-orange" />
            Hyper-Local P2P Sandbox
          </h1>
          <p className="text-slate-500 mt-2">End-to-End Simulation Control Center for SecondLife Forward-Deployment</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* SECTION 1: Buyer B Demand */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg"><ShoppingBag className="w-5 h-5 text-blue-700" /></div>
              <h2 className="font-bold text-lg">Step 1: Future Demand (Buyer B)</h2>
            </div>
            <div className="p-6 flex-grow space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Product</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amazon-orange outline-none"
                  value={buyerBProduct}
                  onChange={(e) => setBuyerBProduct(e.target.value)}
                >
                  <option value="prod_ipad_pro_11">Apple iPad Pro 11-inch</option>
                  <option value="prod_sony_wh1000xm5">Sony WH-1000XM5 Headphones</option>
                  <option value="prod_kindle_paperwhite">Kindle Paperwhite</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shipping Address
                </label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amazon-orange outline-none"
                  value={buyerBAddress}
                  onChange={(e) => setBuyerBAddress(e.target.value)}
                />
              </div>

              {!buyerBOrderId ? (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isOrdering}
                  className="w-full bg-[#febd69] hover:bg-[#f3a847] text-slate-900 font-bold py-2.5 rounded-md transition shadow-sm disabled:opacity-50 mt-4"
                >
                  {isOrdering ? 'Placing Order...' : 'Place Buyer B Order'}
                </button>
              ) : (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-emerald-800">Order Placed Successfully</p>
                    <p className="text-xs text-emerald-600 font-mono mt-1">ID: {buyerBOrderId}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wider rounded border border-amber-200">
                      {buyerBStatus}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Original Asset (Buyer A) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col opacity-100 transition-opacity duration-300">
            <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg"><PackageSearch className="w-5 h-5 text-purple-700" /></div>
              <h2 className="font-bold text-lg">Step 2: Asset History (Buyer A)</h2>
            </div>
            <div className="p-6 flex-grow space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Buyer A Address
                </label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-amazon-orange outline-none"
                  value={buyerAAddress}
                  onChange={(e) => setBuyerAAddress(e.target.value)}
                  disabled={buyerAHasAsset}
                />
                <p className="text-[10px] text-slate-400 mt-1">Must be geographically close to Buyer B for P2P match.</p>
              </div>

              {!buyerAHasAsset ? (
                <button 
                  onClick={() => setBuyerAHasAsset(true)}
                  disabled={!buyerBOrderId}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-md transition shadow-sm disabled:opacity-50"
                >
                  Simulate Delivery to Buyer A
                </button>
              ) : !buyerAReturnInitiated ? (
                <div className="space-y-4">
                  <div className="bg-slate-100 rounded-lg p-4 text-center">
                    <p className="text-sm font-semibold text-slate-700">📦 Asset currently held by Buyer A</p>
                  </div>
                  <button 
                    onClick={() => setBuyerAReturnInitiated(true)}
                    className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-2.5 rounded-md transition"
                  >
                    Initiate Return Workflow
                  </button>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Return Workflow Active</p>
                    <p className="text-xs text-amber-600 mt-0.5">Asset handed off to Inspection Portal.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3 & 4 (Only visible if return initiated) */}
        {buyerAReturnInitiated && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* SECTION 3: Inspection Portal */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg"><Search className="w-5 h-5 text-emerald-700" /></div>
                <h2 className="font-bold text-lg">Step 3: SecondLife Trade-In Portal Inspection</h2>
              </div>
              <div className="p-6 text-center space-y-4">
                {!inspectionPassed ? (
                  <div className="py-6">
                    {isInspecting ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-medium text-slate-600">Gemini Vision is analyzing multi-angle photos...</p>
                      </div>
                    ) : (
                      <button 
                        onClick={handleSimulateInspection}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-6 rounded-md transition shadow-sm"
                      >
                        Simulate Image Upload & Gemini Inspection
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                    <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    <h3 className="text-lg font-bold text-emerald-800">INSPECTED_PASSED</h3>
                    <p className="text-sm text-emerald-600">Product structural integrity verified via AI. Ready for routing.</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 4: Routing Engine */}
            {inspectionPassed && (
              <div className="bg-white rounded-xl shadow-lg border border-amazon-orange overflow-hidden relative">
                {/* Decorative border top */}
                <div className="h-1.5 w-full bg-gradient-to-r from-amazon-orange via-[#ff9900] to-amber-300 absolute top-0 left-0"></div>
                
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3 bg-white mt-1">
                  <div className="bg-orange-100 p-2 rounded-lg"><Truck className="w-5 h-5 text-amazon-orange" /></div>
                  <h2 className="font-bold text-xl text-amazon-blue">Step 4: Live Interception & Routing Console</h2>
                </div>
                
                <div className="p-6 bg-slate-50">
                  <div className="text-center mb-6">
                    <button 
                      onClick={handleRunRoutingEngine}
                      disabled={isRouting}
                      className="bg-amazon-blue hover:bg-slate-800 text-white font-extrabold py-3.5 px-8 rounded-lg shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mx-auto text-lg w-full max-w-md"
                    >
                      {isRouting ? (
                        <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Calculating Hexagons...</>
                      ) : (
                        <>Run Route Allocation Engine <ArrowRight className="w-5 h-5" /></>
                      )}
                    </button>
                  </div>

                  {routeResult && (
                    <div className="mt-8 animate-in zoom-in-95 duration-300">
                      {routeResult.success && routeResult.routeType === 'P2P_LOCAL_COURIER' ? (
                        <div className="bg-white border-2 border-emerald-400 rounded-xl overflow-hidden shadow-xl max-w-2xl mx-auto">
                          <div className="bg-emerald-500 text-white px-6 py-4 flex items-center justify-center gap-2">
                            <span className="text-xl">🌟</span>
                            <h3 className="font-bold text-lg tracking-wide">Hyper-Local Match Confirmed! Rerouting Peer-to-Peer.</h3>
                          </div>
                          
                          <div className="p-6 space-y-6">
                            {/* Stub Dispatch Ticket */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 font-mono text-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 bg-slate-200 text-slate-500 text-[10px] px-2 py-1 rounded-bl-lg font-bold">3PL DISPATCH STUB</div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">DISPATCH PROVIDER</p>
                                  <p className="font-bold text-slate-800">{routeResult.dispatchPayload?.dispatchProvider || 'Uber Direct'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">MATCH ID</p>
                                  <p className="font-bold text-slate-800">{routeResult.matchDetails?.matchId}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
                                <div className="flex gap-3">
                                  <div className="w-6 flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-2 ring-blue-500"></div>
                                    <div className="w-0.5 h-full bg-slate-300 my-1"></div>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-xs">PICKUP (Buyer A)</p>
                                    <p className="font-medium text-slate-700">{buyerAAddress}</p>
                                  </div>
                                </div>
                                <div className="flex gap-3">
                                  <div className="w-6 flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500"></div>
                                  </div>
                                  <div>
                                    <p className="text-slate-400 text-xs">DROPOFF (Buyer B)</p>
                                    <p className="font-medium text-slate-700">{buyerBAddress}</p>
                                  </div>
                                </div>
                              </div>

                            </div>

                            {/* Timer */}
                            <div className="flex items-center gap-3 bg-orange-50 text-orange-800 border border-orange-200 rounded-lg px-4 py-3">
                              <Clock className="w-5 h-5 text-orange-500 animate-pulse" />
                              <div className="text-sm">
                                <span className="font-bold">2-Hour Holding Window Active:</span> Awaiting courier acceptance. If missed, defaults to warehouse.
                              </div>
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-slate-300 rounded-xl overflow-hidden shadow-lg max-w-xl mx-auto">
                           <div className="bg-slate-700 text-white px-6 py-4 flex items-center justify-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            <h3 className="font-bold text-lg tracking-wide">No Local Match Found. Standard Routing.</h3>
                          </div>
                          <div className="p-6 text-center space-y-4">
                            <p className="text-slate-600 text-sm">We expanded the search radius up to 50km, but no active orders for this product were found.</p>
                            <div className="bg-slate-100 border border-slate-200 border-dashed rounded-lg p-6 max-w-sm mx-auto">
                              <PackageSearch className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                              <p className="font-mono font-bold text-slate-800 text-lg">RETURN TO WAREHOUSE</p>
                              <p className="text-xs text-slate-500 mt-2">Please pack the item and attach the standard shipping label.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
