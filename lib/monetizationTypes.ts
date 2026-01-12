import type { PlanId } from './monetizationConfig';

export type Subscription = {
  userId: string;
  plan: PlanId;
  status: 'active' | 'canceled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

export type InfoReveal = {
  viewerId: string;
  targetUserId: string;
  createdAt?: unknown;
  periodKey: string;
  planAtTime: PlanId;
};

export type EmojiGift = {
  id: string;
  tier: 'basic' | 'plus' | 'premium' | 'legend';
  emoji: string;
};

export type UserGift = {
  userId: string;
  giftId: string;
  emoji: string;
  active: boolean;
  createdAt?: unknown;
};
