import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';

const FOLLOWS_COLLECTION = 'follows';

// docId = `${followerId}_${targetId}` — 중복 팔로우 원천 차단
const followDocId = (followerId: string, targetId: string) => `${followerId}_${targetId}`;

export const followUser = async (followerId: string, targetId: string) => {
  if (followerId === targetId) return;
  await setDoc(doc(firestore, FOLLOWS_COLLECTION, followDocId(followerId, targetId)), {
    followerId,
    targetId,
    createdAt: serverTimestamp(),
  });
};

export const unfollowUser = async (followerId: string, targetId: string) => {
  await deleteDoc(doc(firestore, FOLLOWS_COLLECTION, followDocId(followerId, targetId)));
};

export const isFollowing = async (followerId: string, targetId: string) => {
  const snapshot = await getDoc(
    doc(firestore, FOLLOWS_COLLECTION, followDocId(followerId, targetId)),
  );
  return snapshot.exists();
};

export const getFollowerCount = async (userId: string) => {
  const snapshot = await getCountFromServer(
    query(collection(firestore, FOLLOWS_COLLECTION), where('targetId', '==', userId)),
  );
  return snapshot.data().count;
};

export const getFollowingCount = async (userId: string) => {
  const snapshot = await getCountFromServer(
    query(collection(firestore, FOLLOWS_COLLECTION), where('followerId', '==', userId)),
  );
  return snapshot.data().count;
};
