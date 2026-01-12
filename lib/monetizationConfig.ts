export type PlanId = 'basic' | 'plus' | 'elite';

export const PLAN_CONFIG: Record<
  PlanId,
  {
    price: string;
    friendSlotBonus: number;
    infoRevealLimit: number;
    missionBonus: number;
    autoPostOnMission: boolean;
    rankHighlight: boolean;
    visuals: string[];
  }
> = {
  basic: {
    price: '$4.99',
    friendSlotBonus: 5,
    infoRevealLimit: 3,
    missionBonus: 1,
    autoPostOnMission: false,
    rankHighlight: true,
    visuals: [],
  },
  plus: {
    price: '$9.99',
    friendSlotBonus: 15,
    infoRevealLimit: 10,
    missionBonus: 1,
    autoPostOnMission: true,
    rankHighlight: true,
    visuals: [],
  },
  elite: {
    price: '$29.99',
    friendSlotBonus: 50,
    infoRevealLimit: 50,
    missionBonus: 1,
    autoPostOnMission: true,
    rankHighlight: true,
    visuals: ['Emoji Aura', 'Explorer Status'],
  },
};

export const GIFT_TIERS = [
  { id: 'basic', price: '$0.99', emojis: ['💛', '😊', '🌱'] },
  { id: 'plus', price: '$2.99', emojis: ['🔥', '💎', '🌈'] },
  { id: 'premium', price: '$4.99', emojis: ['👑', '🪽', '🌟'] },
  { id: 'legend', price: '$9.99', emojis: ['🐉', '🌌', '🧿'] },
] as const;
