import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { isEmojiOnly } from './emojiValidation';

export type UserProfile = {
  userId: string;
  avatarEmoji: string;
  countryEmoji: string;
  bio?: string; // Add bio field
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

export const upsertUserProfile = async (profile: Partial<UserProfile> & { userId: string }) => {
  if (profile.avatarEmoji && !isEmojiOnly(profile.avatarEmoji)) {
    throw new Error('Avatar emoji must be emoji-only');
  }
  if (profile.countryEmoji && !isEmojiOnly(profile.countryEmoji)) {
    throw new Error('Country emoji must be emoji-only');
  }

  await setDoc(
    doc(firestore, PROFILES_COLLECTION, profile.userId),
    { ...profile, updatedAt: serverTimestamp() },
    { merge: true },
  );
};
