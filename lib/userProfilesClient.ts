import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { isEmojiOnly } from './emojiValidation';

export type UserProfile = {
  userId: string;
  avatarEmoji: string;
  countryEmoji: string;
  visualIntensity?: 'S' | 'M' | 'L';
  createdAt?: unknown;
  updatedAt?: unknown;
};

const PROFILES_COLLECTION = 'userProfiles';

export const getUserProfile = async (userId: string) => {
  const snapshot = await getDoc(doc(firestore, PROFILES_COLLECTION, userId));
  if (!snapshot.exists()) {
    return null;
  }
  return snapshot.data() as UserProfile;
};

export const upsertUserProfile = async (profile: UserProfile) => {
  if (!isEmojiOnly(profile.avatarEmoji) || !isEmojiOnly(profile.countryEmoji)) {
    throw new Error('Profile emojis must be emoji-only');
  }
  await setDoc(
    doc(firestore, PROFILES_COLLECTION, profile.userId),
    { ...profile, updatedAt: serverTimestamp(), createdAt: serverTimestamp() },
    { merge: true },
  );
};
