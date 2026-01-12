import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { firestore } from './firebase';
import type { AdminSettings, AdminUser, LocalIdentity } from './adminTypes';

const SETTINGS_DOC_ID = 'global';
const SETTINGS_COLLECTION = 'admin_settings';
const USERS_COLLECTION = 'admin_users';

const DEFAULT_SETTINGS: AdminSettings = {
  auth_mode: 'uid',
  available_scopes: ['content_management', 'user_management'],
};

const getLocalUid = () => {
  if (typeof window === 'undefined') {
    return 'demo-user';
  }
  const key = 'emojiworld_uid';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const generated = crypto.randomUUID();
  window.localStorage.setItem(key, generated);
  return generated;
};

export const getLocalIdentity = (): LocalIdentity => {
  if (typeof window === 'undefined') {
    return { uid: 'demo-user', email: '', domain: '' };
  }
  const uid = getLocalUid();
  const emailKey = 'emojiworld_admin_email';
  const email = window.localStorage.getItem(emailKey) || '';
  const domain = email.includes('@') ? email.split('@')[1] : '';
  return { uid, email, domain };
};

export const setLocalAdminEmail = (email: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem('emojiworld_admin_email', email);
};

export const getAdminSettings = async () => {
  const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  const snapshot = await getDoc(settingsRef);
  if (!snapshot.exists()) {
    await setDoc(settingsRef, DEFAULT_SETTINGS, { merge: true });
    return DEFAULT_SETTINGS;
  }
  return snapshot.data() as AdminSettings;
};

export const updateAdminSettings = async (updates: Partial<AdminSettings>) => {
  const settingsRef = doc(firestore, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(settingsRef, updates, { merge: true });
};

export const listAdminUsers = async () => {
  const snapshots = await getDocs(collection(firestore, USERS_COLLECTION));
  return snapshots.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as AdminUser),
  }));
};

export const upsertAdminUser = async (user: AdminUser, createdBy: string) => {
  const docId = `${user.identity_type}:${user.identity_value}`;
  const userRef = doc(firestore, USERS_COLLECTION, docId);
  await setDoc(
    userRef,
    {
      ...user,
      created_at: serverTimestamp(),
      created_by: createdBy,
    },
    { merge: true },
  );
};

export const removeAdminUser = async (docId: string) => {
  await deleteDoc(doc(firestore, USERS_COLLECTION, docId));
};
