import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { firestore, storage } from './firebase';
import { isEmojiOnly } from './emojiValidation';
import { AUTO_POST_ON_MISSION } from './appConfig';
import { createPost } from './postsClient';
import type { MissionDefinition, MissionStatus, MissionWithUser, UserMission } from './missionsV2Types';

const MISSIONS_COLLECTION = 'missions';
const USER_MISSIONS_COLLECTION = 'userMissions';

const DEV_MISSIONS: MissionDefinition[] = [
  { id: 'ootd', roomEmoji: '👕', missionEmoji: '👕', bannerEmoji: '👕📸', type: 'photo', active: true },
  { id: 'sky', roomEmoji: '🌤️', missionEmoji: '🌤️', bannerEmoji: '🌤️📸', type: 'photo', active: true },
  { id: 'workout', roomEmoji: '💪', missionEmoji: '💪', bannerEmoji: '💪🔥', type: 'checkin', active: true },
  { id: 'create', roomEmoji: '🎨', missionEmoji: '🎨', bannerEmoji: '🎨🖌️', type: 'checkin', active: true },
  { id: 'pet', roomEmoji: '🐶', missionEmoji: '🐶', bannerEmoji: '🐶📸', type: 'photo', active: true },
];

const getLocalDateString = (date = new Date()) => date.toISOString().slice(0, 10);

const getLastMoodEmoji = () => {
  if (typeof window === 'undefined') {
    return '🙂';
  }
  return window.localStorage.getItem('emojiworld_mood') || '🙂';
};

export const seedDevMissionsV2 = async () => {
  const missionsRef = collection(firestore, MISSIONS_COLLECTION);
  await Promise.all(
    DEV_MISSIONS.map(async (mission) => {
      if (
        !isEmojiOnly(mission.missionEmoji) ||
        !isEmojiOnly(mission.bannerEmoji) ||
        !isEmojiOnly(mission.roomEmoji)
      ) {
        return;
      }
      await setDoc(doc(missionsRef, mission.id), mission, { merge: true });
    }),
  );
};

export const listActiveMissionsV2 = async () => {
  const snapshots = await getDocs(
    query(collection(firestore, MISSIONS_COLLECTION), where('active', '==', true)),
  );
  return snapshots.docs.map((docSnap) => docSnap.data() as MissionDefinition);
};

export const ensureDailyMission = async (userId: string) => {
  const today = getLocalDateString();
  const userMissionsRef = collection(firestore, USER_MISSIONS_COLLECTION);
  const existing = await getDocs(
    query(userMissionsRef, where('userId', '==', userId), where('date', '==', today)),
  );
  if (!existing.empty) {
    const docSnap = existing.docs[0];
    return { id: docSnap.id, data: docSnap.data() as UserMission };
  }

  const active = await listActiveMissionsV2();
  if (!active.length) {
    throw new Error('No active missions');
  }
  const mission = active[Math.floor(Math.random() * active.length)];
  const newMission: UserMission = {
    userId,
    missionId: mission.id,
    date: today,
    status: 'active',
    mediaUrl: null,
    missionEmoji: mission.missionEmoji,
  };
  const created = await addDoc(userMissionsRef, {
    ...newMission,
    createdAt: serverTimestamp(),
  });
  return { id: created.id, data: newMission };
};

export const getMissionWithUser = async (userId: string): Promise<MissionWithUser> => {
  const assignment = await ensureDailyMission(userId);
  const missionDoc = await getDoc(doc(firestore, MISSIONS_COLLECTION, assignment.data.missionId));
  if (!missionDoc.exists()) {
    throw new Error('Mission definition missing');
  }
  return {
    mission: missionDoc.data() as MissionDefinition,
    userMission: assignment.data,
    userMissionId: assignment.id,
  };
};

export const listRecentUserMissions = async (userId: string) => {
  const snapshots = await getDocs(
    query(
      collection(firestore, USER_MISSIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
    ),
  );
  return snapshots.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as UserMission),
  }));
};

export const expireOldMissions = async (userId: string) => {
  const today = getLocalDateString();
  const missions = await listRecentUserMissions(userId);
  await Promise.all(
    missions.map(async (mission) => {
      if (mission.status === 'active' && mission.date < today) {
        const ref = doc(firestore, USER_MISSIONS_COLLECTION, mission.id!);
        await updateDoc(ref, { status: 'expired' });
      }
    }),
  );
};

export const skipMission = async (userMissionId: string) => {
  const ref = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  await updateDoc(ref, { status: 'skipped' });
};

const createAutoPost = async ({
  userId,
  mission,
  mediaUrl,
}: {
  userId: string;
  mission: MissionDefinition;
  mediaUrl?: string | null;
}) => {
  await createPost({
    userId,
    roomEmoji: mission.roomEmoji,
    moodEmoji: getLastMoodEmoji(),
    captionEmoji: `${mission.missionEmoji}✨`,
    mediaUrl: mediaUrl ?? null,
    visibility: 'public',
  });
};

export const completeMissionCheckin = async ({
  userMissionId,
  userId,
  mission,
  shouldAutoPost,
}: {
  userMissionId: string;
  userId: string;
  mission: MissionDefinition;
  shouldAutoPost?: boolean;
}) => {
  const ref = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  const autoPost = shouldAutoPost ?? AUTO_POST_ON_MISSION;
  await updateDoc(ref, {
    status: 'completed',
    completedAt: serverTimestamp(),
    autoPosted: autoPost,
  });
  if (autoPost) {
    await createAutoPost({ userId, mission });
  }
};

export const completeMissionWithPhoto = async ({
  userMissionId,
  userId,
  mission,
  file,
  shouldAutoPost,
}: {
  userMissionId: string;
  userId: string;
  mission: MissionDefinition;
  file: File;
  shouldAutoPost?: boolean;
}) => {
  const timestamp = Date.now();
  const storageRef = ref(storage, `missions/${userId}/${mission.id}/${timestamp}.jpg`);
  await uploadBytes(storageRef, file);
  const mediaUrl = await getDownloadURL(storageRef);
  const autoPost = shouldAutoPost ?? AUTO_POST_ON_MISSION;
  const refDoc = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  await updateDoc(refDoc, {
    status: 'completed',
    completedAt: serverTimestamp(),
    mediaUrl,
    autoPosted: autoPost,
  });
  if (autoPost) {
    await createAutoPost({ userId, mission, mediaUrl });
  }
  return mediaUrl;
};

export const markMissionAutoPosted = async (userMissionId: string) => {
  const refDoc = doc(firestore, USER_MISSIONS_COLLECTION, userMissionId);
  await updateDoc(refDoc, { autoPosted: true });
};

export const statusOverlayEmoji = (status: MissionStatus) => {
  if (status === 'completed') return '✅';
  if (status === 'expired') return '🫥';
  if (status === 'skipped') return '💤';
  return '';
};
