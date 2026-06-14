import { Product, AIAnalysis, HealthCard, RoutingResult } from '../types';
import { mockProducts } from '../data/mockProducts';

// Format price utility
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

// Map condition value to user-friendly string
export function getConditionLabel(condition: Product['condition']): string {
  const map = {
    like_new: 'Like New',
    very_good: 'Very Good',
    good: 'Good',
    acceptable: 'Acceptable',
  };
  return map[condition] || condition;
}

// Map condition to badge colors
export function getConditionColorClass(condition: Product['condition']): string {
  const map = {
    like_new: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    very_good: 'bg-teal-50 text-teal-700 border-teal-200',
    good: 'bg-amber-50 text-amber-700 border-amber-200',
    acceptable: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return map[condition] || 'bg-slate-50 text-slate-700 border-slate-200';
}

// Save uploaded product to localStorage
export function saveUploadedProduct(product: Product): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastUploadedProduct', JSON.stringify(product));
  }
}

// Get the current active product (uploaded product or default fallback)
export function getActiveProduct(): Product {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('lastUploadedProduct');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing saved product, falling back to mock data', e);
      }
    }
  }
  return mockProducts[0]; // Fallback to iPhone 14 Pro
}

// Generate a simulated product from user inputs
export function generateSimulatedProduct(name: string, category: string, conditionNotes: string, imageSrc?: string): Product {
  // Use default images based on category if none provided
  const categoryImages: Record<string, string> = {
    'Electronics': 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600',
    'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
    'Apparel': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=600',
    'Books/Media': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
  };
  
  const image = imageSrc || categoryImages[category] || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600';
  
  // Set prices and scores based on category and notes lengths as mock logic
  const originalPrice = category === 'Electronics' ? 599 : category === 'Home & Kitchen' ? 149 : category === 'Apparel' ? 89 : 29;
  const conditionScore = conditionNotes.toLowerCase().includes('scratch') ? 78 : conditionNotes.toLowerCase().includes('broken') ? 45 : 92;
  
  let condition: Product['condition'] = 'like_new';
  if (conditionScore < 60) condition = 'acceptable';
  else if (conditionScore < 80) condition = 'good';
  else if (conditionScore < 90) condition = 'very_good';
  
  const resalePrice = Math.round(originalPrice * (conditionScore / 100) * 0.75);
  
  const cosmeticScore = Number((conditionScore / 10).toFixed(1));
  const batteryHealth = category === 'Electronics' ? Math.round(85 + Math.random() * 14) : null;
  
  // Custom AI analysis details
  const aiAnalysis: AIAnalysis = {
    conditionScore,
    scratchDetection: conditionNotes.toLowerCase().includes('scratch') 
      ? 'Surface abrasions detected on side bezels. Minor screen micro-scratch (0.1mm).' 
      : 'No visible surface scratches identified under high-contrast spectrum scanning.',
    damageAssessment: conditionNotes.toLowerCase().includes('dent') || conditionNotes.toLowerCase().includes('broken')
      ? 'Structural deformity / micro-impact point detected. Internal components register fully functional.'
      : 'Pristine structural integrity. Internal diagnostic sensors indicate nominal parameters.',
    missingPartsAssessment: conditionNotes.toLowerCase().includes('box') || conditionNotes.toLowerCase().includes('cable')
      ? 'Original box packaging missing. Accessory bundle includes 1x compatible charging cable.'
      : 'All primary hardware accessories identified. Ships in secondary generic eco-packaging.',
    confidenceScore: 94 + Math.round(Math.random() * 5),
    overallRecommendation: conditionScore > 85 
      ? 'Exceptional cosmetic score. Recommended for direct relisting to maximize profit margin.'
      : conditionScore > 65 
      ? 'Minor refurbishing required (deep cleaning and packaging renewal) prior to marketplace placement.'
      : 'Functional, but exhibits high visual wear. Route to peer-exchange or local community donation channels.',
  };

  // Determine smart routing
  let route: RoutingResult['route'] = 'relist';
  let reasoning = 'High value retention and excellent condition justify immediate reselling.';
  let costSavings = Math.round(originalPrice * 0.2);
  
  if (conditionScore < 60) {
    route = 'donation';
    reasoning = 'Refurbishment costs outweigh the potential retail margins. Direct donation provides a tax write-off and maximum community value.';
    costSavings = Math.round(originalPrice * 0.15);
  } else if (conditionScore < 75) {
    route = 'refurbishment';
    reasoning = 'Deep sanitization and replacement of minor wear parts increases recovery value significantly.';
    costSavings = Math.round(originalPrice * 0.25);
  } else if (category === 'Apparel') {
    route = 'peer_exchange';
    reasoning = 'Apparel is highly suited for direct peer-to-peer exchanges to prevent landfill routing and foster community trade.';
    costSavings = Math.round(originalPrice * 0.3);
  }

  const routing: RoutingResult = {
    route,
    reasoning,
    expectedRecoveryValue: resalePrice,
    costSavings,
    confidenceLevel: 88 + Math.round(Math.random() * 11),
  };

  const healthCard: HealthCard = {
    cosmeticScore,
    batteryHealth,
    purchaseDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000 * (1 + Math.random() * 2)).toISOString().split('T')[0],
    estimatedUsageDuration: `${1 + Math.floor(Math.random() * 3)} Years`,
    returnHistory: ['Customer trade-in via digital upload portal'],
    warrantyStatus: conditionScore > 85 ? '6 Months Remaining' : 'Expired',
    sustainabilityRating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
    estimatedResaleValue: resalePrice,
  };

  return {
    id: `prod-${Date.now()}`,
    name,
    category,
    condition,
    conditionNotes,
    image,
    originalPrice,
    resalePrice,
    co2SavedKg: category === 'Electronics' ? 70 : category === 'Home & Kitchen' ? 40 : category === 'Apparel' ? 12 : 5,
    wasteDivertedKg: category === 'Electronics' ? 0.3 : category === 'Home & Kitchen' ? 5 : category === 'Apparel' ? 0.5 : 0.2,
    packagingSavedCount: 1,
    milesAvoided: Math.round(200 + Math.random() * 600),
    healthCard,
    aiAnalysis,
    routing,
    status: 'processing',
    sellerName: 'You (Trader)',
    sellerRating: 5.0,
  };
}
