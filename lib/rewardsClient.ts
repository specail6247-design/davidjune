import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';

const STAMPS_COLLECTION = 'user_stamps';
const SLOT_LEDGER_COLLECTION = 'slot_ledger';
const NOTIFICATIONS_COLLECTION = 'user_notifications';

const getWeekKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + firstDay.getUTCDay() + 1) / 7);
  return `${year}-W${week}`;
};

export const grantDailyStampIfNeeded = async (userId: string, dateString: string) => {
  const stampsRef = collection(firestore, STAMPS_COLLECTION);
  const existing = await getDocs(
    query(stampsRef, where('user_id', '==', userId), where('date', '==', dateString)),
  );

  if (!existing.empty) {
    return false;
  }

  await addDoc(stampsRef, {
    user_id: userId,
    date: dateString,
    created_at: serverTimestamp(),
  });

  return true;
};

export const getWeeklyStampCount = async (userId: string) => {
  const stampsRef = collection(firestore, STAMPS_COLLECTION);
  const since = Timestamp.fromDate(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const snapshots = await getDocs(
    query(stampsRef, where('user_id', '==', userId), where('created_at', '>=', since)),
  );
  return snapshots.size;
};

export const grantStampRewardIfNeeded = async (userId: string) => {
  const weekKey = getWeekKey(new Date());
  const ledgerRef = collection(firestore, SLOT_LEDGER_COLLECTION);
  const existing = await getDocs(
    query(ledgerRef, where('user_id', '==', userId), where('reward_key', '==', weekKey)),
  );

  if (!existing.empty) {
    return false;
  }

  await addDoc(ledgerRef, {
    user_id: userId,
    delta: 1,
    reason: 'stamp_reward',
    reward_key: weekKey,
    created_at: serverTimestamp(),
  });

  const notificationsRef = collection(firestore, NOTIFICATIONS_COLLECTION);
  await addDoc(notificationsRef, {
    user_id: userId,
    emoji: '🎁',
    created_at: serverTimestamp(),
  });

  return true;
};
