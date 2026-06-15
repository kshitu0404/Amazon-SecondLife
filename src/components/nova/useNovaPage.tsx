'use client';

// components/nova/useNovaPage.tsx
// Page-specific Nova hooks. Each hook targets one section of the application
// and internally calls useNova() to drive the correct mood + message sequences.
//
// Import only the hooks you need per page — tree-shakeable.

import { useEffect } from 'react';
import { useNova } from './NovaContext';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface ScanResultParams {
  /** 0–100 condition score from AI inspection */
  score: number;
}

export interface DecisionParams {
  /** Human-readable action name, e.g. "Local Redistribution" */
  recommendation: string;
  /** Amount saved in ₹ */
  saving: number;
  /** Carbon reduction percentage */
  carbonReduction: number;
}

export interface MarketplaceMatchParams {
  count: number;
  radius: number;
  productType: string;
}

export interface HealthReportParams {
  conditionScore: number;
  batteryHealth: number;
  authentic: boolean;
  confidence: number;
}

export type RewardAction = 'local-redistribution' | 'donation' | 'relist';

export interface RewardParams {
  credits: number;
  action: RewardAction;
  /** Amazon logistics saving in ₹, used to calculate dynamic reward messaging */
  saving?: number;
}

export interface SellerInsightParams {
  issue: string;
  action: string;
  revenue?: number;
}

export interface PriceRecommendationParams {
  price: number;
  conditionScore: number;
}

export interface ReturnWarningParams {
  issue: string;
  suggestion: string;
}

import { NovaMood } from "./NovaBee";

// ─── 1. Landing page ─────────────────────────────────────────────────────────
// Auto-rotates intro messages on mount.

export function useNovaLanding() {
  const { nova } = useNova();

  useEffect(() => {
    const messages: Array<{ text: string; mood: NovaMood }> = [
      { text: 'Hi, I\'m Nova 🐝\nMillions of perfectly usable products are discarded every day.', mood: 'happy' },
      { text: 'I help every product find its next best life.', mood: 'proud' },
      { text: 'Last month I helped save 12,000 products from being wasted.', mood: 'excited' },
      { text: 'Together we can make every return count. 🌱', mood: 'happy' },
    ];

    let i = 0;
    const show = () => {
      nova(messages[i].text, { mood: messages[i].mood, duration: 3800 });
      i = (i + 1) % messages.length;
    };

    show();
    const interval = setInterval(show, 4200);
    return () => clearInterval(interval);
  }, [nova]);
}

// ─── 2. Exit intent ───────────────────────────────────────────────────────────
// Fires when the user's cursor leaves the viewport upward.

export function useNovaExitIntent() {
  const { nova } = useNova();

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        nova('🐝 See you soon.\nTogether we gave products another journey. 🌍', {
          mood: 'happy',
          duration: 5000,
        });
      }
    };
    document.addEventListener('mouseleave', handle);
    return () => document.removeEventListener('mouseleave', handle);
  }, [nova]);
}

// ─── 3. Product scan page ─────────────────────────────────────────────────────

export function useNovaProductScan() {
  const { novaThink, novaDone } = useNova();

  /**
   * Call when the user uploads an image. Returns an interval ID — call
   * clearInterval(id) once the scan completes if you want to stop early.
   */
  const novaStartScan = (): ReturnType<typeof setInterval> => {
    const steps = [
      '🐝 Nova is checking product surface condition...',
      '🐝 Detecting packaging damage...',
      '🐝 Running AI quality inspection...',
    ];
    let i = 0;
    novaThink(steps[0]);
    return setInterval(() => {
      i++;
      if (i < steps.length) novaThink(steps[i]);
    }, 1800);
  };

  /** Call with the condition score once your AWS Rekognition response arrives. */
  const novaScanResult = ({ score }: ScanResultParams): void => {
    const mood = score >= 85 ? 'excited' : score >= 60 ? 'happy' : 'thinking';
    novaDone(
      `🐝 Condition score generated: ${score}%\nNova Vision Engine — powered by Amazon Rekognition.`,
      { mood, duration: 6000 }
    );
  };

  return { novaStartScan, novaScanResult };
}

// ─── 4. Decision engine page ──────────────────────────────────────────────────

export function useNovaDecision() {
  const { novaThink, novaDone } = useNova();

  const novaStartDecision = (): void => {
    novaThink('Nova is evaluating 6 decision factors...');
  };

  const novaDecide = ({ recommendation, saving, carbonReduction }: DecisionParams): void => {
    novaDone(
      `🐝 Based on logistics cost and demand analysis,\nI recommend ${recommendation.toUpperCase()}.\n\nThis saves ₹${saving.toLocaleString()} and reduces carbon emissions by ${carbonReduction}%.`,
      { mood: 'proud', duration: 8000 }
    );
  };

  return { novaStartDecision, novaDecide };
}

// ─── 5. Hyperlocal marketplace ────────────────────────────────────────────────

export function useNovaMarketplace() {
  const { nova, novaThink } = useNova();

  const novaSearchBuyers = (): void => {
    novaThink('Scanning hyperlocal demand clusters...');
  };

  const novaMatchFound = ({ count, radius, productType }: MarketplaceMatchParams): void => {
    nova(
      `🐝 I analyzed your 5 products. 5 need attention — about $863 recoverable and 229.2 kg CO₂ to save.`,
      { 
        mood: 'excited', 
        duration: 4000,
        action: { label: "Open Product Advisor", href: "/concierge" }
      }
    );
  };

  return { novaSearchBuyers, novaMatchFound };
}

// ─── 6. Product health card ───────────────────────────────────────────────────

export function useNovaHealthCard() {
  const { nova } = useNova();

  useEffect(() => {
    nova('🐝 Welcome to the Digital Product Passport! Here you can see my complete diagnostic report and verify the product\'s authenticity before you buy.', { mood: 'proud', duration: 8000 });
  }, [nova]);

  const novaHealthReport = ({ conditionScore, batteryHealth, authentic, confidence }: HealthReportParams): void => {
    nova(
      `🐝 I completed a full product health evaluation.\n\nCondition Score: ${conditionScore}%\nBattery Health: ${batteryHealth}%\n${authentic ? '✅ Authenticity Verified' : '⚠️ Authenticity Unconfirmed'}\n\nConfidence in recommendation: ${confidence}%`,
      { mood: 'proud', duration: 9000 }
    );
  };

  return { novaHealthReport };
}

// ─── 7. Nectar credits / rewards ──────────────────────────────────────────────

export function useNovaRewards() {
  const { nova } = useNova();

  const novaReward = ({ credits, action, saving }: RewardParams): void => {
    const messages: Record<RewardAction, string> = {
      'local-redistribution': '🐝 Sweet choice.\nYou selected local redistribution instead of warehouse return.',
      'donation': '🐝 You donated a reusable product — amazing!',
      'relist': '🐝 Smart move! This product is back in circulation.',
    };

    nova(messages[action], {
      mood: 'excited',
      duration: 6000,
      reward: {
        credits,
        reason: saving ? `Amazon saved ₹${saving.toLocaleString()} in logistics` : undefined,
      },
    });
  };

  return { novaReward };
}

// ─── 8. Seller dashboard ──────────────────────────────────────────────────────

export function useNovaSeller() {
  const { nova } = useNova();

  const novaSellerInsight = ({ issue, action, revenue }: SellerInsightParams): void => {
    nova(
      `🐝 ${issue}\n\nSuggested action: ${action}${revenue ? `\n\nEstimated revenue recovery: ₹${revenue.toLocaleString()}` : ''}`,
      { mood: 'thinking', duration: 8000 }
    );
  };

  const novaPriceRecommendation = ({ price, conditionScore }: PriceRecommendationParams): void => {
    nova(
      `🐝 Based on condition score (${conditionScore}%) and demand patterns,\nrecommended resale price: ₹${price.toLocaleString()}`,
      { mood: 'proud', duration: 7000 }
    );
  };

  return { novaSellerInsight, novaPriceRecommendation };
}

// ─── 9. Return prevention (pre-purchase) ─────────────────────────────────────

export function useNovaReturnPrevention() {
  const { nova } = useNova();

  const novaReturnWarning = ({ issue, suggestion }: ReturnWarningParams): void => {
    nova(
      `🐝 ${issue}\n\n💡 ${suggestion}`,
      { mood: 'thinking', duration: 8000 }
    );
  };

  return { novaReturnWarning };
}

// ─── 10. Admin portal ───────────────────────────────────────────────────────────

export function useNovaAdmin() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 System status optimal. You have full visibility over logistics, fraud detection, and overall network health.', { mood: 'proud', duration: 6000 });
  }, [nova]);
}

// ─── 11. Circular Wallet ──────────────────────────────────────────────────────

export function useNovaWallet() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Welcome to your Circular Wallet! You can view your Nectar Trust Score, track your green credits, and see your total carbon savings here.', { mood: 'happy', duration: 6000 });
  }, [nova]);
}

// ─── 12. Product Advisor ───────────────────────────────────────────────────

export function useNovaConcierge() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Here is your personalized inventory dashboard. I\'ve analyzed your items to find the best resale and donation opportunities!', { mood: 'excited', duration: 7000 });
  }, [nova]);
}

// ─── 13. Smart Return Wizard ──────────────────────────────────────────────────

export function useNovaReturnWizard() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Hi! Let\'s get your item returned or re-homed. I\'ll guide you through the AI inspection process.', { mood: 'happy', duration: 6000 });
  }, [nova]);
}

// ─── 14. Cart ─────────────────────────────────────────────────────────────────

export function useNovaCartWelcome(isEmpty: boolean = false) {
  const { nova } = useNova();
  useEffect(() => {
    if (isEmpty) {
      nova('🐝 Oh no, your cart is empty! That makes me a little sad. Let\'s go find some great circular products!', { mood: 'thinking', duration: 6000 });
    } else {
      nova('🐝 Your cart is looking good! Opting for Amazon Day Delivery or Eco-Pickup will earn you extra Green Credits.', { mood: 'happy', duration: 6000 });
    }
  }, [nova, isEmpty]);
}

// ─── 15. Impact Dashboard ─────────────────────────────────────────────────────

export function useNovaImpact() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Look at all the good you\'ve done! Your choices are actively reducing carbon emissions and keeping products in the loop.', { mood: 'proud', duration: 6000 });
  }, [nova]);
}

// ─── 16. Seller Dashboard ─────────────────────────────────────────────────────

export function useNovaSellerWelcome() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Welcome to your Seller Hub! Use my Copilot to get AI-powered pricing and market insights for your listings.', { mood: 'happy', duration: 6000 });
  }, [nova]);
}

// ─── 17. Driver Portal ────────────────────────────────────────────────────────

export function useNovaDriver() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Hello Pickup Partner! I\'ve optimized your route for maximum efficiency and minimum carbon footprint today.', { mood: 'proud', duration: 6000 });
  }, [nova]);
}

// ─── 18. NGO Portal ───────────────────────────────────────────────────────────

export function useNovaNGO() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Welcome to the Local NGO Portal! We have fresh inventory from community donations ready to be claimed and redistributed.', { mood: 'excited', duration: 7000 });
  }, [nova]);
}

// ─── 19. Smart Marketplace ────────────────────────────────────────────────────

export function useNovaSmartMarketplace() {
  const { nova } = useNova();
  useEffect(() => {
    nova('🐝 Exploring our geo-intelligent map? I can help you filter local products by AI-verified condition grades to find the perfect match nearby!', { mood: 'happy', duration: 7500 });
  }, [nova]);
}

