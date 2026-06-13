'use client';

import React, { useEffect, useState } from 'react';
import { useLocation } from '../hooks/useLocation';
import { MapPin, Zap } from 'lucide-react';

export const DeliveryBadge: React.FC<{ productId: string }> = ({ productId }) => {
  const { getDeliveryEstimate, location } = useLocation();
  const [estimate, setEstimate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getDeliveryEstimate(productId).then((res) => {
      if (isMounted) {
        setEstimate(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [productId, location.city, location.pincode, getDeliveryEstimate]);

  if (loading) {
    return (
      <div className="flex flex-col gap-1 mt-2 p-2 bg-slate-50 rounded border border-slate-100 animate-pulse">
        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!estimate) return null;

  return (
    <div className="flex flex-col gap-1 mt-2 text-[10px] sm:text-xs">
      <div className="flex items-start gap-1.5 text-slate-700">
        <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
        <div className="leading-tight">
          <span className="font-semibold">Deliver to {location.city} {location.pincode}</span>
          <br />
          {estimate.isLocal ? (
            <span className="font-extrabold text-[#10b981] flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 fill-[#10b981]" /> Local Hub Delivery (Tomorrow)
            </span>
          ) : (
            <span className="font-extrabold text-slate-800 block mt-0.5">
              Get it by {estimate.dateString}
            </span>
          )}
        </div>
      </div>
      {estimate.routingDiagnostic && (
        <p className="text-[9px] text-slate-400 italic ml-5">
          AI Diagnostic: {estimate.routingDiagnostic}
        </p>
      )}
    </div>
  );
};
