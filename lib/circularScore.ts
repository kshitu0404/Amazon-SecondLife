// Circular Score — a 0-100 measure of a user's circular-economy impact.
// Deterministic, capped contributions so no single action dominates.

const TIERS: [number, string][] = [
  [0, "Beginner"],
  [20, "Recycler"],
  [40, "Advocate"],
  [60, "Champion"],
  [80, "Legend"],
];

export function tierFor(score: number): string {
  let t = TIERS[0][1];
  for (const [threshold, name] of TIERS) {
      if (score >= threshold) t = name;
  }
  return t;
}

export function computeScore({
  resells,
  donations,
  repairs,
  prelovedBuys,
  carbonKg,
  wasteKg
}: {
  resells?: number;
  donations?: number;
  repairs?: number;
  prelovedBuys?: number;
  carbonKg?: number;
  wasteKg?: number;
}) {
  const breakdown = {
      resells: Math.min((resells || 0) * 6, 30),
      donations: Math.min((donations || 0) * 5, 20),
      repairs: Math.min((repairs || 0) * 8, 24),
      preloved_purchases: Math.min((prelovedBuys || 0) * 4, 16),
      carbon_saved: Math.min((carbonKg || 0) * 0.05, 20),
      waste_diverted: Math.min((wasteKg || 0) * 0.2, 10),
  };
  const raw = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  
  return {
      score,
      tier: tierFor(score),
      breakdown
  };
}

export async function scoreAllUsers(query: any) {
  // Mock DB fetch for user aggregates
  const rows = [
      { id: '1', name: 'Sarah J.', city: 'Seattle', resells: 5, donations: 2, repairs: 1, preloved: 4, carbon: 450, waste: 20 },
      { id: '2', name: 'Michael T.', city: 'Austin', resells: 4, donations: 1, repairs: 2, preloved: 2, carbon: 320, waste: 15 },
  ];

  const scored = rows.map((r) => {
      const s = computeScore({
          resells: Number(r.resells),
          donations: Number(r.donations),
          repairs: Number(r.repairs),
          prelovedBuys: Number(r.preloved),
          carbonKg: Number(r.carbon),
          wasteKg: Number(r.waste),
      });
      return {
          id: r.id,
          name: r.name,
          city: r.city,
          score: s.score,
          tier: s.tier,
          breakdown: s.breakdown
      };
  });
  
  scored.sort((a, b) => b.score - a.score);
  return scored;
}
