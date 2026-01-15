export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

export type PlanId = 'basic' | 'plus' | 'elite';

export const PLAN_CONFIG: Record<
  PlanId,
  {
    name: string;
    price: string;
    amount: number;
    currency: string;
    friendSlotBonus: number;
    infoRevealLimit: number;
    missionBonus: number;
    autoPostOnMission: boolean;
    rankHighlight: boolean;
    visuals: string[];
    features: string[];
  }
> = {
  basic: {
    name: 'Basic Plan',
    price: '$4.99',
    amount: 499,
    currency: 'usd',
    friendSlotBonus: 5,
    infoRevealLimit: 3,
    missionBonus: 1,
    autoPostOnMission: false,
    rankHighlight: true,
    visuals: [],
    features: ['5 Friend slots', '3 Reveals/mo', 'Rank Highlight'],
  },
  plus: {
    name: 'Plus Plan',
    price: '$9.99',
    amount: 999,
    currency: 'usd',
    friendSlotBonus: 15,
    infoRevealLimit: 10,
    missionBonus: 1,
    autoPostOnMission: true,
    rankHighlight: true,
    visuals: [],
    features: ['15 Friend slots', '10 Reveals/mo', 'Auto-post', 'Rank Highlight'],
  },
  elite: {
    name: 'Elite Plan',
    price: '$29.99',
    amount: 2999,
    currency: 'usd',
    friendSlotBonus: 50,
    infoRevealLimit: 50,
    missionBonus: 1,
    autoPostOnMission: true,
    rankHighlight: true,
    visuals: ['Emoji Aura', 'Explorer Status'],
    features: ['50 Friend slots', '50 Reveals/mo', 'Emoji Aura', 'Explorer Status'],
  },
};

export const GIFT_TIERS = [
  { id: 'basic', price: '$0.99', amount: 99, currency: 'usd', emojis: ['💛', '😊', '🌱'] },
  { id: 'plus', price: '$2.99', amount: 299, currency: 'usd', emojis: ['🔥', '💎', '🌈'] },
  { id: 'premium', price: '$4.99', amount: 499, currency: 'usd', emojis: ['👑', '🪽', '🌟'] },
  { id: 'legend', price: '$9.99', amount: 999, currency: 'usd', emojis: ['🐉', '🌌', '🧿'] },
] as const;
