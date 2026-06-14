// Green Credits economy (Section 9). 1 GC = 1 kg CO2e prevented; 1 GC = $0.10.

const ACTION_BANDS: Record<string, [number, number]> = {
  resale: [5, 50],
  list: [2, 10],
  buy_preloved: [10, 80],
  donation: [5, 30],
  repair: [15, 100],
  rental: [3, 20],
};

const LEVELS: [number, string][] = [
  [0, "Seedling"],
  [101, "Sprout"],
  [501, "Sapling"],
  [2001, "Tree"],
  [10001, "Forest"],
  [50001, "Ecosystem Guardian"],
];

export function creditsForAction(action: string, carbonSavedKg: number): number {
  const [lo, hi] = ACTION_BANDS[action] || [1, 50];
  return Math.max(lo, Math.min(hi, Math.round(carbonSavedKg)));
}

export function levelForBalance(totalGc: number): string {
  let level = LEVELS[0][1];
  for (const [t, name] of LEVELS) {
      if (totalGc >= t) level = name;
  }
  return level;
}

export function nextLevel(totalGc: number) {
  for (const [t, name] of LEVELS) {
      if (totalGc < t) return {
          name,
          gcToNext: Math.round((t - totalGc) * 10) / 10
      };
  }
  return {
      name: null,
      gcToNext: 0
  };
}

export async function awardCredits(client: any, {
  userId,
  delta,
  reason,
  action
}: {
  userId: string;
  delta: number;
  reason: string;
  action?: string;
}) {
  // Mock DB interaction
  const balance = 1500 + delta;
  const transaction = {
      user_id: userId,
      delta,
      reason,
      action: action || null,
      balance_after: balance,
      created_at: new Date()
  };
  
  return {
      transaction,
      balance
  };
}
