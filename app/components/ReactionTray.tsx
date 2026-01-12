'use client';

import { useState, useEffect } from 'react';
import { firestore } from '../../../lib/firebase';
import {
  collection,
  onSnapshot,
  addDoc,
  query,
  where,
  deleteDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { useAuth } from '../../../lib/AuthContext'; // Assuming you have AuthContext

const defaultReactions = ['😍', '😂', '😮', '😢', '😡', '🫶'];

type ReactionCounts = {
  [key: string]: number;
};

type UserReaction = {
  [key: string]: string | null;
};

export const ReactionTray = ({ postId }: { postId: string }) => {
  const { user } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({});
  const [userReactions, setUserReactions] = useState<UserReaction>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;

    const q = query(collection(firestore, 'reactions'), where('postId', '==', postId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const counts: ReactionCounts = {};
      const userSpecificReactions: UserReaction = {};

      snapshot.docs.forEach((doc) => {
        const { emoji, uid } = doc.data();
        counts[emoji] = (counts[emoji] || 0) + 1;
        if (user && uid === user.uid) {
          userSpecificReactions[emoji] = doc.id;
        }
      });

      setReactionCounts(counts);
      setUserReactions(userSpecificReactions);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [postId, user]);

  const handleReaction = async (emoji: string) => {
    if (!user) {
      alert('Please log in to react.');
      return;
    }

    setIsLoading(true);
    const existingReactionDocId = userReactions[emoji];

    try {
      if (existingReactionDocId) {
        // User is removing their reaction
        await deleteDoc(doc(firestore, 'reactions', existingReactionDocId));
      } else {
        // User is adding a new reaction
        await addDoc(collection(firestore, 'reactions'), {
          postId,
          emoji,
          uid: user.uid,
        });
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  return (
    <div className="reaction-tray-wrap">
      {defaultReactions.map((emoji) => {
        const count = reactionCounts[emoji] || 0;
        const hasReacted = userReactions[emoji];

        return (
          <button
            key={emoji}
            className={`reaction-chip ${hasReacted ? 'selected' : ''} ${count > 0 ? 'has-count' : ''}`}
            onClick={() => handleReaction(emoji)}
            disabled={isLoading}
            aria-label={`React with ${emoji}`}>
            <span className="reaction-emoji">{emoji}</span>
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
      <style jsx>{`
        .reaction-tray-wrap {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 8px;
          background-color: rgba(255, 255, 255, 0.7);
          border-radius: 999px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .reaction-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          border: none;
          background-color: #f0f0f5;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        .reaction-chip:hover {
          transform: translateY(-2px);
          background-color: #e0e0e5;
        }
        .reaction-chip.selected {
          background-color: var(--lime);
          box-shadow: 0 0 0 3px rgba(209, 255, 79, 0.4);
        }
        .reaction-emoji {
          font-size: 18px;
          line-height: 1;
        }
        .reaction-count {
          font-weight: 600;
          font-size: 13px;
        }
        .reaction-chip.has-count:not(.selected) {
          background-color: #e8e8ee;
        }
      `}</style>
    </div>
  );
};
