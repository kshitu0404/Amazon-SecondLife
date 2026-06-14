import { productTwin } from "./twin";
import { calculateCarbon } from "./carbon";
import { creditsForAction } from "./greenCredits";

const LIQUID = new Set(["electronics", "apparel", "home", "books"]);

const initialInventory = [
  {
    id: "inv-1",
    purchase_price: 399,
    age_months: 14,
    status: "owned",
    title: "Sony WH-1000XM4 Wireless Headphones",
    brand: "Sony",
    category: "electronics",
    msrp: 348,
    weight_kg: 0.25,
    embedded_carbon_kg: 24,
    monthly_depreciation: 2.5,
    image_url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80",
    eco_score: 85,
    size: "One Size"
  },
  {
    id: "inv-2",
    purchase_price: 120,
    age_months: 24,
    status: "owned",
    title: "Patagonia Better Sweater",
    brand: "Patagonia",
    category: "apparel",
    msrp: 149,
    weight_kg: 0.4,
    embedded_carbon_kg: 18,
    monthly_depreciation: 1.2,
    image_url: "https://images.unsplash.com/photo-1578587018452-892bace94f12?auto=format&fit=crop&w=400&q=80",
    eco_score: 92,
    size: "M"
  },
  {
    id: "inv-3",
    purchase_price: 45,
    age_months: 36,
    status: "owned",
    title: "Amazon Echo Dot (4th Gen)",
    brand: "Amazon",
    category: "electronics",
    msrp: 49,
    weight_kg: 0.3,
    embedded_carbon_kg: 12,
    monthly_depreciation: 3.5,
    image_url: "https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=400&q=80",
    eco_score: 75,
    size: "Standard"
  },
  {
    id: "inv-4",
    purchase_price: 250,
    age_months: 4,
    status: "owned",
    title: "Nespresso Vertuo Plus",
    brand: "Nespresso",
    category: "home",
    msrp: 199,
    weight_kg: 4.5,
    embedded_carbon_kg: 45,
    monthly_depreciation: 0.8,
    image_url: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=400&q=80",
    eco_score: 65,
    size: "Standard"
  }
];

const globalAny: any = global;
if (!globalAny.__mockInventory) {
  globalAny.__mockInventory = initialInventory;
}
const mockInventory = globalAny.__mockInventory;

export async function scanInventory({ minPrice = 10, minAgeMonths = 3 } = {}) {
  const suggestions = [];

  for (const o of mockInventory) {
    if (!LIQUID.has(o.category)) continue;
    if (Number(o.purchase_price) < minPrice) continue;

    // Run Dynamic Pricing & Forecast Twin
    const twin = productTwin({ 
      msrp: o.msrp, 
      grade: "B", 
      ageMonths: o.age_months, 
      category: o.category, 
      monthlyDepreciation: o.monthly_depreciation 
    });

    const carbon = calculateCarbon({ 
      embeddedCarbonKg: o.embedded_carbon_kg, 
      weightKg: o.weight_kg, 
      grade: "B", 
      route: "zero_warehouse", 
      action: "resale" 
    });
    const gc = creditsForAction("resale", carbon.carbon_saved_kg);

    // Mock NBOE probability
    const maxProbability = o.category === 'electronics' ? 88 : o.category === 'apparel' ? 75 : 45;
    const buyerMatches = [
      { buyer: "Alex M.", city: "Seattle", purchaseProbability: maxProbability },
      { buyer: "Taylor S.", city: "Portland", purchaseProbability: maxProbability - 15 }
    ];

    const isEol = twin.forecast.m3 < 10 && twin.monthly_decay_pct >= 1;

    let action, reason;
    if (isEol) {
      action = "sell_now"; 
      reason = `Your item will reach near-zero resale value in ~3 months. List now for $${twin.current_value}.`;
    } else if (twin.current_value < 15) {
      action = "donate"; 
      reason = `Low resale value ($${twin.current_value}); donating maximizes impact and earns a tax receipt.`;
    } else if (maxProbability < 50) {
      action = "donate"; 
      reason = `Low resale likelihood (${maxProbability}% purchase probability); donating to a local NGO maximizes circular utility.`;
    } else if (o.age_months >= minAgeMonths && twin.monthly_decay_pct >= 2) {
      action = "sell_now"; 
      reason = `Idle ${o.age_months} months and losing ~${twin.monthly_decay_pct}%/mo — sell now to capture $${twin.current_value} (${maxProbability}% buy likelihood).`;
    } else if (o.age_months >= minAgeMonths) {
      action = "sell_now"; 
      reason = `Unused for ${o.age_months} months. Worth $${twin.current_value} today; high demand expected (${maxProbability}% buy likelihood).`;
    } else {
      action = "hold"; 
      reason = `Value stable ($${twin.current_value}); no urgency — the agent will keep watching.`;
    }

    suggestions.push({
      order_id: o.id,
      product: { 
        title: o.title, brand: o.brand, category: o.category, 
        image_url: o.image_url, eco_score: o.eco_score, size: o.size, msrp: Number(o.msrp) 
      },
      age_months: o.age_months, 
      action, 
      reason, 
      is_eol: isEol, 
      estimated_value: twin.current_value,
      forecast: twin.forecast, 
      best_resale_window: twin.best_resale_window,
      projected_carbon_kg: carbon.carbon_saved_kg, 
      projected_gc: gc, 
      resale_probability: maxProbability, 
      buyers: buyerMatches
    });
  }

  // Sort by action priority and estimated value
  const rank: Record<string, number> = { sell_now: 0, donate: 1, hold: 2 };
  suggestions.sort((a, b) => (rank[a.action] - rank[b.action]) || (b.estimated_value - a.estimated_value));

  return { suggestions };
}

export function addToInventory(item: any) {
  mockInventory.unshift(item);
  globalAny.__mockInventory = mockInventory;
}
