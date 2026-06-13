'use client';

import { useContext } from 'react';
import { LocationContext, LocationContextType } from '../context/LocationContext';

export interface DeliveryEstimate {
  days: number;
  dateString: string;
  isLocal: boolean;
  warehouseCity: string;
}

export const useLocation = (): LocationContextType & {
  getDeliveryEstimate: (productId: string) => Promise<DeliveryEstimate & { co2Offset?: number, routingDiagnostic?: string }>;
} => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }

  // Deterministically assign a warehouse city to a product based on its ID
  const getProductWarehouseCity = (productId: string): string => {
    let charSum = 0;
    for (let i = 0; i < productId.length; i++) {
      charSum += productId.charCodeAt(i);
    }
    const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad'];
    return cities[charSum % cities.length];
  };

  const getDeliveryEstimate = async (productId: string): Promise<DeliveryEstimate & { co2Offset?: number, routingDiagnostic?: string }> => {
    const warehouseCity = getProductWarehouseCity(productId);
    const userCity = context.location.city;
    const userPincode = context.location.pincode;
    
    try {
      const res = await fetch('/api/ai-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCity, userPincode, warehouseCity, productId })
      });
      
      if (res.ok) {
        const data = await res.json();
        return { ...data, warehouseCity };
      }
    } catch (e) {
      console.error('Failed to fetch AI routing', e);
    }

    // Fallback if API fails
    const isLocal = userCity.toLowerCase() === warehouseCity.toLowerCase();
    const days = isLocal ? 1 : 3;
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + days);
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    
    return {
      days,
      dateString: deliveryDate.toLocaleDateString('en-IN', options),
      isLocal,
      warehouseCity,
      routingDiagnostic: "Standard fallback routing applied.",
      co2Offset: 0
    };
  };

  return {
    ...context,
    getDeliveryEstimate,
  };
};
