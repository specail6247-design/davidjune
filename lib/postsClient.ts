import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
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

/**
 * 하루에 누를 수 있는 반응 수. 게스트는 계정을 무한히 만들 수 있어 더 낮게 잡는다.
 * 티켓 경제를 지키는 건 MAX_REACTIONS_COUNTED_PER_FAN 쪽이고,
 * 이 상한은 대량 스팸/쓰기 남용을 막는 용도라 실제 유저는 닿지 않을 선으로 둔다.
 */
export const DAILY_REACTION_LIMIT = 120;
export const DAILY_REACTION_LIMIT_GUEST = 40;
/**
 * 한 사람이 내 티켓에 기여할 수 있는 반응 수 상한.
 * 열성 팬 한 명(또는 봇 한 마리)이 내 글 전부에 반응해도 티켓을 무한 발행하지 못하게 한다.
 */
export const MAX_REACTIONS_COUNTED_PER_FAN = 3;

const QUOTA_COLLECTION = 'reaction_quota';

export const dailyReactionLimit = (isGuest: boolean) =>
  isGuest ? DAILY_REACTION_LIMIT_GUEST : DAILY_REACTION_LIMIT;

export class ReactionLimitError extends Error {
  constructor(readonly limit: number) {
    super(`Daily reaction limit (${limit}) reached`);
    this.name = 'ReactionLimitError';
  }
}

/**
 * 쿼터 문서의 날짜 키. firestore.rules의 utcDayKey()와 반드시 같은 형식이어야 한다
 * (`string(request.time.year()) + '-' + ...`), 그래야 클라이언트가 날짜를 조작해
 * 새 버킷을 만들 수 없다.
 */
export const reactionQuotaDay = (at: Date): string =>
  `${at.getUTCFullYear()}-${at.getUTCMonth() + 1}-${at.getUTCDate()}`;

/** UTC 자정 경계에서 클라이언트/서버 시각이 어긋날 때 쓸 후보 키들 */
const dayKeyCandidates = (): string[] => {
  const now = Date.now();
  const keys = [reactionQuotaDay(new Date(now))];
  for (const skewMs of [5 * 60_000, -5 * 60_000]) {
    const key = reactionQuotaDay(new Date(now + skewMs));
    if (!keys.includes(key)) keys.push(key);
  }
  return keys;
};

const isPermissionDenied = (error: unknown) =>
  (error as { code?: string })?.code === 'permission-denied';

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

/**
 * 유저당 게시물 1개에 반응 1개. 같은 이모지를 다시 누르면 취소.
 *
 * 새 반응은 하루 쿼터를 1 소모하며, 반응 문서와 쿼터 증가를 한 트랜잭션으로 묶는다.
 * rules가 getAfter()로 쿼터 증가를 검증하므로 클라이언트를 우회해도 상한을 넘길 수 없다.
 * 이미 누른 반응의 이모지를 바꾸는 것은 무료(총량이 늘지 않음),
 * 취소는 쿼터를 돌려주지 않는다 — 껐다 켜기로 상한을 무력화하지 못하게.
 */
export const setReaction = async (
  postId: string,
  uid: string,
  emoji: string | null,
  options: { isGuest?: boolean } = {},
) => {
  const reactionRef = doc(firestore, POSTS_COLLECTION, postId, 'reactions', uid);
  if (!emoji) {
    await deleteDoc(reactionRef);
    return;
  }
  if (!isEmojiOnly(emoji)) {
    throw new Error('Reactions must be emoji ✨');
  }

  const limit = dailyReactionLimit(!!options.isGuest);
  const candidates = dayKeyCandidates();

  for (let i = 0; i < candidates.length; i += 1) {
    const day = candidates[i];
    try {
      await runTransaction(firestore, async (tx) => {
        const existing = await tx.get(reactionRef);
        if (existing.exists()) {
          tx.update(reactionRef, { emoji, updatedAt: serverTimestamp() });
          return;
        }
        const quotaRef = doc(firestore, QUOTA_COLLECTION, `${uid}_${day}`);
        const quotaSnap = await tx.get(quotaRef);
        const used = quotaSnap.exists() ? ((quotaSnap.data().count as number) ?? 0) : 0;
        if (used >= limit) {
          throw new ReactionLimitError(limit);
        }
        tx.set(quotaRef, { uid, day, count: used + 1, updatedAt: serverTimestamp() });
        tx.set(reactionRef, { uid, emoji, createdAt: serverTimestamp() });
      });
      return;
    } catch (error) {
      // 자정 경계에서 날짜 키가 어긋난 경우에만 다음 후보로 재시도
      if (isPermissionDenied(error) && i < candidates.length - 1) continue;
      throw error;
    }
  }
};

export type ReactionQuotaStatus = {
  used: number;
  limit: number;
  remaining: number;
};

/** 오늘 남은 반응 수 (UI 안내용) */
export const getReactionQuota = async (
  uid: string,
  isGuest: boolean,
): Promise<ReactionQuotaStatus> => {
  const limit = dailyReactionLimit(isGuest);
  const day = reactionQuotaDay(new Date());
  try {
    const snap = await getDoc(doc(firestore, QUOTA_COLLECTION, `${uid}_${day}`));
    const used = snap.exists() ? ((snap.data().count as number) ?? 0) : 0;
    return { used, limit, remaining: Math.max(0, limit - used) };
  } catch {
    return { used: 0, limit, remaining: limit };
  }
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
  /** 실제로 받은 반응 총합 (표시용) */
  totalReactions: number;
  /** 팬별 상한을 적용해 티켓 계산에 실제로 쓰인 반응 수 */
  countedReactions: number;
  /** 나에게 반응한 서로 다른 사람 수 */
  uniqueFans: number;
  photosPosted: number;
  /** 다음 티켓까지 필요한 반응 수 */
  reactionsToNext: number;
};

/**
 * 사진 티켓 = 무료 1장 + (인정된 반응 수 ÷ 5) − 이미 올린 사진 수.
 * "좋아요를 모으면 사진을 올릴 수 있다"는 Picto의 핵심 차별화 루프.
 *
 * 인정된 반응은 (1) 셀프 반응 제외, (2) 한 사람당 최대 3개까지만 집계한다.
 * 서로 다른 사람에게 닿아야 사진을 얻는 구조라, 계정 몇 개를 찍어내는 것만으로는
 * 티켓을 불릴 수 없다.
 */
export const getPhotoTicketStatus = async (userId: string): Promise<PhotoTicketStatus> => {
  const myPostsQuery = query(
    collection(firestore, POSTS_COLLECTION),
    where('userId', '==', userId),
    limit(100),
  );
  const myPosts = await getDocs(myPostsQuery);

  let photosPosted = 0;
  const reactionsByFan = new Map<string, number>();

  await Promise.all(
    myPosts.docs.map(async (docSnap) => {
      if (docSnap.data().imageUrl) {
        photosPosted += 1;
      }
      const reactionsSnap = await getDocs(
        query(collection(firestore, POSTS_COLLECTION, docSnap.id, 'reactions'), limit(300)),
      );
      reactionsSnap.docs.forEach((reactionDoc) => {
        const fanId = (reactionDoc.data() as Reaction).uid ?? reactionDoc.id;
        if (fanId === userId) return;
        reactionsByFan.set(fanId, (reactionsByFan.get(fanId) ?? 0) + 1);
      });
    }),
  );

  const perFan = Array.from(reactionsByFan.values());
  const totalReactions = perFan.reduce((sum, n) => sum + n, 0);
  const countedReactions = perFan.reduce(
    (sum, n) => sum + Math.min(n, MAX_REACTIONS_COUNTED_PER_FAN),
    0,
  );

  const earned = FREE_TICKETS + Math.floor(countedReactions / REACTIONS_PER_TICKET);
  const tickets = Math.max(0, earned - photosPosted);
  const reactionsToNext = REACTIONS_PER_TICKET - (countedReactions % REACTIONS_PER_TICKET);

  return {
    tickets,
    totalReactions,
    countedReactions,
    uniqueFans: reactionsByFan.size,
    photosPosted,
    reactionsToNext,
  };
};
