import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { firestore } from './firebase';

export type LeaderboardEntry = {
  userId: string;
  score: number;
  streak: number;
  avatarEmoji?: string;
  countryEmoji?: string;
};

const DAILY_COLLECTION = 'leaderboardDaily';
const WEEKLY_COLLECTION = 'leaderboardWeekly';

export const getTodayKey = () => new Date().toISOString().slice(0, 10);

export const getWeekKey = () => {
  const date = new Date();
  const year = date.getUTCFullYear();
  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOffset = Math.floor((date.getTime() - firstDay.getTime()) / 86400000);
  const week = Math.ceil((dayOffset + firstDay.getUTCDay() + 1) / 7);
  return `${year}-W${week}`;
};

export const getDailyLeaderboard = async (dateKey = getTodayKey()) => {
  const entriesRef = collection(firestore, DAILY_COLLECTION, dateKey, 'entries');
  const snapshots = await getDocs(query(entriesRef, orderBy('score', 'desc'), limit(50)));
  return snapshots.docs.map((docSnap) => docSnap.data() as LeaderboardEntry);
};

export const getWeeklyLeaderboard = async (weekKey = getWeekKey()) => {
  const entriesRef = collection(firestore, WEEKLY_COLLECTION, weekKey, 'entries');
  const snapshots = await getDocs(query(entriesRef, orderBy('score', 'desc'), limit(50)));
  return snapshots.docs.map((docSnap) => docSnap.data() as LeaderboardEntry);
};

export const scoreToStars = (score: number) => '⭐'.repeat(Math.max(1, Math.min(5, score)));
