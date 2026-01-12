import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { isEmojiOnly } from './emojiValidation';

export type Post = {
  id?: string;
  userId: string;
  roomEmoji: string;
  moodEmoji: string;
  captionEmoji: string;
  mediaUrl?: string | null;
  visibility: 'public' | 'friends';
  createdAt?: unknown;
};

const POSTS_COLLECTION = 'posts';

export const createPost = async (post: Post) => {
  if (!isEmojiOnly(post.roomEmoji) || !isEmojiOnly(post.moodEmoji) || !isEmojiOnly(post.captionEmoji)) {
    throw new Error('Post emojis must be emoji-only');
  }

  const postsRef = collection(firestore, POSTS_COLLECTION);
  const created = await addDoc(postsRef, {
    ...post,
    createdAt: serverTimestamp(),
  });
  return created.id;
};

export const listRecentPosts = async () => {
  const snapshots = await getDocs(
    query(collection(firestore, POSTS_COLLECTION), orderBy('createdAt', 'desc')),
  );
  return snapshots.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Post),
  }));
};

export const listPublicPosts = async () => {
  const snapshots = await getDocs(
    query(
      collection(firestore, POSTS_COLLECTION),
      where('visibility', '==', 'public'),
      orderBy('createdAt', 'desc'),
    ),
  );
  return snapshots.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Post),
  }));
};
