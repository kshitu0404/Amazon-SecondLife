'use client';

import React, { createContext, useState, useEffect } from 'react';

export interface Location {
  city: string;
  pincode: string;
}

export interface LocationContextType {
  location: Location;
  recentLocations: Location[];
  isModalOpen: boolean;
  toast: string | null;
  updateLocation: (city: string, pincode: string) => void;
  clearRecentLocations: () => void;
  setIsModalOpen: (open: boolean) => void;
}

export const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>({ city: 'Delhi', pincode: '110020' });
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load from localStorage on client-side mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('shipping_location');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Failed to parse shipping location', e);
      }
    }

    const savedRecents = localStorage.getItem('recent_locations');
    if (savedRecents) {
      try {
        setRecentLocations(JSON.parse(savedRecents));
      } catch (e) {
        console.error('Failed to parse recent locations', e);
      }
    }
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    // Remove toast after 3 seconds
    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const updateLocation = (city: string, pincode: string) => {
    // Normalize city name (Capitalize First Letter)
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    const newLocation = { city: formattedCity, pincode };
    
    setLocation(newLocation);
    localStorage.setItem('shipping_location', JSON.stringify(newLocation));

    // Update recent locations (limit to 5, avoid duplicates)
    setRecentLocations((prev) => {
      const filtered = prev.filter(
        (loc) => loc.pincode !== pincode && loc.city.toLowerCase() !== formattedCity.toLowerCase()
      );
      const updated = [newLocation, ...filtered].slice(0, 5);
      localStorage.setItem('recent_locations', JSON.stringify(updated));
      return updated;
    });

    setIsModalOpen(false);
    showToast(`Shipping location updated to ${formattedCity} - ${pincode}`);
  };

  const clearRecentLocations = () => {
    setRecentLocations([]);
    localStorage.removeItem('recent_locations');
    showToast('Recent locations cleared');
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        recentLocations,
        isModalOpen,
        toast,
        updateLocation,
        clearRecentLocations,
        setIsModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};
