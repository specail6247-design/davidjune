'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/AuthContext';
import {
  REACTION_EMOJIS,
  Reaction,
  ReactionLimitError,
  setReaction,
  subscribeToReactions,
} from '../../lib/postsClient';

export const ReactionTray = ({
  postId,
  onCountChange,
}: {
  postId: string;
  onCountChange?: (count: number) => void;
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [pending, setPending] = useState(false);
  const [limitHit, setLimitHit] = useState(false);

  useEffect(() => {
    if (!postId) return;
    const unsubscribe = subscribeToReactions(postId, (data) => {
      setReactions(data);
      onCountChange?.(data.length);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const myReaction = user ? reactions.find((r) => r.uid === user.uid)?.emoji ?? null : null;

  const counts: Record<string, number> = {};
  reactions.forEach((r) => {
    counts[r.emoji] = (counts[r.emoji] || 0) + 1;
  });

  const handleReaction = async (emoji: string) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      await setReaction(postId, user.uid, myReaction === emoji ? null : emoji, {
        isGuest: user.isAnonymous,
      });
    } catch (error) {
      if (error instanceof ReactionLimitError) {
        setLimitHit(true);
        setTimeout(() => setLimitHit(false), 2600);
      } else {
        console.error('Reaction failed:', error);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="reaction-tray-wrap">
      {REACTION_EMOJIS.map((emoji) => {
        const count = counts[emoji] || 0;
        const selected = myReaction === emoji;
        return (
          <button
            key={emoji}
            className={`reaction-chip ${selected ? 'selected' : ''}`}
            onClick={() => handleReaction(emoji)}
            aria-label={`React ${emoji}`}
          >
            <span className="reaction-emoji">{emoji}</span>
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
      {limitHit && (
        <span className="limit-pill" role="status">
          🚦 ⏳ 24h
        </span>
      )}
      <style jsx>{`
        .limit-pill {
          font-size: 12px;
          font-weight: 700;
          color: #7a5b00;
          background: linear-gradient(135deg, #fff7d6, #ffeff9);
          border-radius: 999px;
          padding: 5px 10px;
          animation: riseIn 0.2s ease both;
        }
        .reaction-tray-wrap {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }
        .reaction-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 10px;
          border-radius: 999px;
          border: none;
          background-color: #f0f0f5;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.15s ease;
        }
        .reaction-chip:hover {
          transform: translateY(-2px) scale(1.05);
          background-color: #e6e6ef;
        }
        .reaction-chip.selected {
          background: linear-gradient(135deg, #ffe3f6, #e6e2ff);
          box-shadow: 0 0 0 2px rgba(107, 91, 255, 0.35);
        }
        .reaction-emoji {
          font-size: 17px;
          line-height: 1;
        }
        .reaction-count {
          font-weight: 700;
          font-size: 12px;
          color: #444;
        }
      `}</style>
    </div>
  );
};
