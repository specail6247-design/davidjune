import { httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { functions, firestore } from './firebase';
import { PLAN_CONFIG } from './monetizationConfig';
import type { Subscription, UserGift } from './monetizationTypes';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const INFO_REVEALS_COLLECTION = 'info_reveals';
const USER_GIFTS_COLLECTION = 'user_gifts';

export const getSubscription = async (userId: string) => {
  const snapshot = await getDoc(doc(firestore, SUBSCRIPTIONS_COLLECTION, userId));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as Subscription;
};

export const getRevealCountForPeriod = async (viewerId: string, periodKey: string) => {
  const snapshots = await getDocs(
    query(
      collection(firestore, INFO_REVEALS_COLLECTION),
      where('viewerId', '==', viewerId),
      where('periodKey', '==', periodKey),
    ),
  );
  return snapshots.size;
};

export const revealInfo = async (targetUserId: string) => {
  const callable = httpsCallable(functions, 'revealInfo');
  const result = await callable({ targetUserId });
  return result.data as {
    remaining: number;
    periodKey: string;
    payload: {
      avatarEmoji: string;
      countryEmoji: string;
      learnEmoji: string;
      recentMissionEmojis: string[];
      engagementLevel: number;
      activityStatus: string;
    };
  };
};

export const purchaseGift = async (tier: string, emoji: string, receiverId: string) => {
  const callable = httpsCallable(functions, 'purchaseGift');
  const result = await callable({ tier, emoji, receiverId });
  return result.data as { ok: boolean };
};

export const setGiftActive = async (userGiftId: string, active: boolean) => {
  await updateDoc(doc(firestore, USER_GIFTS_COLLECTION, userGiftId), { active });
};

export const listUserGifts = async (userId: string) => {
  const snapshots = await getDocs(
    query(collection(firestore, USER_GIFTS_COLLECTION), where('userId', '==', userId)),
  );
  return snapshots.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as UserGift),
  }));
};

export const devSimulateSubscription = async (userId: string, plan: Subscription['plan']) => {
  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 1);
  const end = endDate.toISOString().slice(0, 10);
  await setDoc(
    doc(firestore, SUBSCRIPTIONS_COLLECTION, userId),
    {
      userId,
      plan,
      status: 'active',
      currentPeriodStart: start,
      currentPeriodEnd: end,
    },
    { merge: true },
  );
};

export const devGrantGift = async (userId: string, emoji: string) => {
  await setDoc(
    doc(collection(firestore, USER_GIFTS_COLLECTION)),
    {
      userId,
      giftId: `${userId}-${emoji}`,
      emoji,
      active: true,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const getPlanRevealLimit = (plan: Subscription['plan']) => PLAN_CONFIG[plan].infoRevealLimit;
