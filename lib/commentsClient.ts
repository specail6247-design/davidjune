
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { isEmojiOnly } from './emojiValidation';

export type Comment = {
  id: string;
  user_id: string;
  emoji_comment: string;
  created_at: any;
};

export const addEmojiComment = async (postId: string, userId: string, emoji: string) => {
  if (!isEmojiOnly(emoji)) {
    throw new Error('Comments must be emoji-only! ✨');
  }

  const commentsRef = collection(firestore, `posts/${postId}/comments`);
  await addDoc(commentsRef, {
    user_id: userId,
    emoji_comment: emoji,
    created_at: serverTimestamp(),
  });
};

export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
  const commentsRef = collection(firestore, `posts/${postId}/comments`);
  const q = query(commentsRef, orderBy('created_at', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
    callback(comments);
  });
};
