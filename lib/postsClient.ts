import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { isEmojiOnly } from './emojiValidation';

export type Post = {
  id: string;
  userId: string;
  authorEmoji: string;
  countryEmoji: string;
  moodEmoji: string;
  caption: string; // emoji-only string (1–16 emojis)
  imageUrl?: string | null; // compressed data URL for v1
  visibility: 'public';
  createdAt?: { toMillis: () => number } | null;
};

export type NewPost = Omit<Post, 'id' | 'createdAt'>;

export type Reaction = {
  uid: string;
  emoji: string;
};

const POSTS_COLLECTION = 'posts';
export const REACTION_EMOJIS = ['❤️', '😂', '😮', '🥺', '🔥', '👏'] as const;

/** 좋아요(반응) 몇 개당 사진 티켓 1장 */
export const REACTIONS_PER_TICKET = 5;
/** 신규 유저 무료 사진 티켓 */
export const FREE_TICKETS = 1;
export const MAX_CAPTION_EMOJIS = 16;

export const createPost = async (post: NewPost) => {
  if (!isEmojiOnly(post.caption)) {
    throw new Error('Captions must be emoji-only ✨');
  }
  if (!isEmojiOnly(post.moodEmoji) || !isEmojiOnly(post.authorEmoji)) {
    throw new Error('Post emojis must be emoji-only');
  }

  const postsRef = collection(firestore, POSTS_COLLECTION);
  const created = await addDoc(postsRef, {
    ...post,
    createdAt: serverTimestamp(),
  });
  return created.id;
};

export const subscribeToFeed = (
  callback: (posts: Post[]) => void,
  onError?: (error: Error) => void,
) => {
  const feedQuery = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(50),
  );
  return onSnapshot(
    feedQuery,
    (snapshot) => {
      const posts = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Omit<Post, 'id'>),
        id: docSnap.id,
      }));
      callback(posts);
    },
    (error) => onError?.(error),
  );
};

export const deletePost = async (postId: string) => {
  await deleteDoc(doc(firestore, POSTS_COLLECTION, postId));
};

/** 유저당 게시물 1개에 반응 1개. 같은 이모지를 다시 누르면 취소. */
export const setReaction = async (postId: string, uid: string, emoji: string | null) => {
  const reactionRef = doc(firestore, POSTS_COLLECTION, postId, 'reactions', uid);
  if (!emoji) {
    await deleteDoc(reactionRef);
    return;
  }
  if (!isEmojiOnly(emoji)) {
    throw new Error('Reactions must be emoji ✨');
  }
  await setDoc(reactionRef, { uid, emoji, createdAt: serverTimestamp() });
};

export const subscribeToReactions = (
  postId: string,
  callback: (reactions: Reaction[]) => void,
) => {
  const reactionsRef = collection(firestore, POSTS_COLLECTION, postId, 'reactions');
  return onSnapshot(reactionsRef, (snapshot) => {
    callback(snapshot.docs.map((docSnap) => docSnap.data() as Reaction));
  });
};

export type PhotoTicketStatus = {
  tickets: number;
  totalReactions: number;
  photosPosted: number;
  /** 다음 티켓까지 필요한 반응 수 */
  reactionsToNext: number;
};

/**
 * 사진 티켓 = 무료 1장 + (받은 반응 수 ÷ 5) − 이미 올린 사진 수.
 * "좋아요를 모으면 사진을 올릴 수 있다"는 EmojiWorld의 핵심 차별화 루프.
 */
export const getPhotoTicketStatus = async (userId: string): Promise<PhotoTicketStatus> => {
  const myPostsQuery = query(
    collection(firestore, POSTS_COLLECTION),
    where('userId', '==', userId),
    limit(100),
  );
  const myPosts = await getDocs(myPostsQuery);

  let totalReactions = 0;
  let photosPosted = 0;

  await Promise.all(
    myPosts.docs.map(async (docSnap) => {
      if (docSnap.data().imageUrl) {
        photosPosted += 1;
      }
      const countSnap = await getCountFromServer(
        collection(firestore, POSTS_COLLECTION, docSnap.id, 'reactions'),
      );
      totalReactions += countSnap.data().count;
    }),
  );

  const earned = FREE_TICKETS + Math.floor(totalReactions / REACTIONS_PER_TICKET);
  const tickets = Math.max(0, earned - photosPosted);
  const reactionsToNext = REACTIONS_PER_TICKET - (totalReactions % REACTIONS_PER_TICKET);

  return { tickets, totalReactions, photosPosted, reactionsToNext };
};
