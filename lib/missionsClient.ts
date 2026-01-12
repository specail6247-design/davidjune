import {
  addDoc,
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firestore, storage } from './firebase';
import { isEmojiOnly } from './emojiValidation';
import { grantDailyStampIfNeeded, getWeeklyStampCount, grantStampRewardIfNeeded } from './rewardsClient';
import type { MissionDefinition, MissionWithUser, MissionType, UserMission } from './missionsTypes';

const MISSIONS_COLLECTION = 'missions';
const USER_MISSIONS_COLLECTION = 'user_missions';

const getTodayString = () => new Date().toISOString().slice(0, 10);

const DEV_MISSIONS: MissionDefinition[] = [
  { id: 'ootd', mission_emoji: '👕', banner_emoji: '👕📸', type: 'photo', active: true },
  { id: 'sky', mission_emoji: '🌤️', banner_emoji: '🌤️📸', type: 'photo', active: true },
  { id: 'workout', mission_emoji: '💪', banner_emoji: '💪🔥', type: 'checkin', active: true },
  { id: 'create', mission_emoji: '🎨', banner_emoji: '🎨🖌️', type: 'checkin', active: true },
  { id: 'pet', mission_emoji: '🐶', banner_emoji: '🐶📸', type: 'photo', active: true },
];

export const seedDevMissions = async () => {
  const missionsRef = collection(firestore, MISSIONS_COLLECTION);
  await Promise.all(
    DEV_MISSIONS.map(async (mission) => {
      if (!isEmojiOnly(mission.mission_emoji) || !isEmojiOnly(mission.banner_emoji)) {
        return;
      }
      await setDoc(doc(missionsRef, mission.id), mission, { merge: true });
    }),
  );
};

export const createMissionDefinition = async (mission: MissionDefinition) => {
  if (!isEmojiOnly(mission.mission_emoji) || !isEmojiOnly(mission.banner_emoji)) {
    throw new Error('Mission emoji must be emoji-only');
  }

  const missionsRef = collection(firestore, MISSIONS_COLLECTION);
  await setDoc(doc(missionsRef, mission.id), mission, { merge: true });
};

export const updateMissionDefinition = async (missionId: string, updates: Partial<MissionDefinition>) => {
  const missionRef = doc(firestore, MISSIONS_COLLECTION, missionId);
  const missionSnap = await getDoc(missionRef);
  if (!missionSnap.exists()) {
    throw new Error('Mission not found');
  }

  const next = { ...missionSnap.data(), ...updates } as MissionDefinition;
  if (!isEmojiOnly(next.mission_emoji) || !isEmojiOnly(next.banner_emoji)) {
    throw new Error('Mission emoji must be emoji-only');
  }

  await updateDoc(missionRef, updates);
};

export const listActiveMissions = async () => {
  const snapshots = await getDocs(
    query(collection(firestore, MISSIONS_COLLECTION), where('active', '==', true)),
  );
  return snapshots.docs.map((docSnap) => docSnap.data() as MissionDefinition);
};

export const ensureMissionForUser = async (userId: string) => {
  const today = getTodayString();
  const userMissionsRef = collection(firestore, USER_MISSIONS_COLLECTION);
  const existing = await getDocs(
    query(userMissionsRef, where('user_id', '==', userId), where('assigned_date', '==', today)),
  );

  if (!existing.empty) {
    const docSnap = existing.docs[0];
    return { id: docSnap.id, data: docSnap.data() as UserMission };
  }

  const active = await listActiveMissions();
  if (!active.length) {
    throw new Error('No active missions');
  }

  const mission = active[Math.floor(Math.random() * active.length)];
  const newMission: UserMission = {
    user_id: userId,
    mission_id: mission.id,
    assigned_date: today,
    completed: false,
    media_url: null,
  };

  const created = await addDoc(userMissionsRef, newMission);
  return { id: created.id, data: newMission };
};

export const getUserMissionWithDefinition = async (userId: string): Promise<MissionWithUser> => {
  const assignment = await ensureMissionForUser(userId);
  const missionDoc = await getDoc(doc(firestore, MISSIONS_COLLECTION, assignment.data.mission_id));
  if (!missionDoc.exists()) {
    throw new Error('Mission definition missing');
  }
  return {
    mission: missionDoc.data() as MissionDefinition,
    userMission: assignment.data,
    userMissionId: assignment.id,
  };
};

const handleMissionRewards = async (userId: string) => {
  const today = getTodayString();
  const stamped = await grantDailyStampIfNeeded(userId, today);
  const weeklyCount = await getWeeklyStampCount(userId);
  if (weeklyCount >= 7 && stamped) {
    await grantStampRewardIfNeeded(userId);
  }
};

export const completeMissionCheckin = async ({
  userMissionId,
  userId,
}: {
  userMissionId: string;
  userId: string;
}) => {
  const missionRef = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  await updateDoc(missionRef, {
    completed: true,
    completed_at: serverTimestamp(),
  });
  await handleMissionRewards(userId);
};

export const completeMissionWithPhoto = async ({
  userMissionId,
  userId,
  missionId,
  file,
}: {
  userMissionId: string;
  userId: string;
  missionId: string;
  file: File;
}) => {
  const timestamp = Date.now();
  const storageRef = ref(storage, `missions/${userId}/${missionId}/${timestamp}.jpg`);
  await uploadBytes(storageRef, file);
  const mediaUrl = await getDownloadURL(storageRef);
  const missionRef = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  await updateDoc(missionRef, {
    completed: true,
    completed_at: serverTimestamp(),
    media_url: mediaUrl,
  });
  await handleMissionRewards(userId);
};
