'use client';

import { useState } from 'react';
import { ReactionTray } from './ReactionTray';
import { CommentDrawer } from './CommentDrawer';
import { useAuth } from '../../lib/AuthContext';
import { Post, REACTIONS_PER_TICKET } from '../../lib/postsClient';

const timeAgo = (createdAt: Post['createdAt']) => {
  if (!createdAt || typeof createdAt.toMillis !== 'function') return '✨';
  const seconds = Math.floor((Date.now() - createdAt.toMillis()) / 1000);
  if (seconds < 60) return `${Math.max(seconds, 1)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

const SITE_URL = 'https://emojiworld-195a0.web.app';

export const FeedCard = ({ post, onDelete }: { post: Post; onDelete?: () => void }) => {
  const { user } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [reactionCount, setReactionCount] = useState(0);
  const [shared, setShared] = useState(false);

  const isMine = user?.uid === post.userId;

  const handleShare = async () => {
    const text = `${post.caption} — Picto 🪩🌍 No words. Just emoji.`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url: SITE_URL });
      } else {
        await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // 사용자가 공유 시트를 닫은 경우 등 — 무시
    }
  };

  return (
    <article className="feed-card">
      <div className="card-header">
        <div className="user-avatar">{post.authorEmoji || '🙂'}</div>
        <div className="user-info">
          <div className="user-name">
            {post.countryEmoji || '🌍'} {isMine && <span className="mine-badge">⭐</span>}
          </div>
          <div className="post-time">🕐 {timeAgo(post.createdAt)}</div>
        </div>
        <div className="mood-emoji">{post.moodEmoji}</div>
        {isMine && onDelete && (
          <button className="delete-btn" onClick={onDelete} aria-label="🗑️">
            🗑️
          </button>
        )}
      </div>

      {post.imageUrl && (
        <div className="card-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt={post.caption} loading="lazy" />
          <span className="photo-badge">📸</span>
        </div>
      )}

      <div className="card-body">
        <p className="caption">{post.caption}</p>
      </div>

      {isMine && reactionCount > 0 && (
        <div className="ticket-progress" title="반응을 모으면 사진 티켓을 얻어요!">
          📸 {reactionCount % REACTIONS_PER_TICKET}/{REACTIONS_PER_TICKET}
        </div>
      )}

      <div className="card-footer">
        <ReactionTray postId={post.id} onCountChange={setReactionCount} />
        <div className="footer-actions">
          <button className="comment-trigger" onClick={handleShare} aria-label="share">
            {shared ? '✅' : '📤'}
          </button>
          <button
            className="comment-trigger"
            onClick={() => setIsCommentsOpen(true)}
            aria-label="💬"
          >
            💬
          </button>
        </div>
      </div>

      <CommentDrawer
        postId={post.id}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      <style jsx>{`
        .feed-card {
          background: #fff;
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 16px;
          display: grid;
          gap: 12px;
          position: relative;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 46px;
          height: 46px;
          border-radius: 999px;
          background: linear-gradient(135deg, #fff1f7, #eef0ff);
          display: grid;
          place-items: center;
          font-size: 26px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        .user-info {
          flex: 1;
        }
        .user-name {
          font-weight: 600;
          font-size: 16px;
        }
        .mine-badge {
          font-size: 12px;
        }
        .post-time {
          font-size: 12px;
          color: #999;
        }
        .mood-emoji {
          font-size: 26px;
        }
        .delete-btn {
          border: none;
          background: #f6f6fb;
          border-radius: 10px;
          width: 34px;
          height: 34px;
          cursor: pointer;
          font-size: 14px;
        }
        .card-image {
          position: relative;
        }
        .card-image img {
          width: 100%;
          height: auto;
          border-radius: 18px;
          object-fit: cover;
          display: block;
        }
        .photo-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 13px;
        }
        .caption {
          margin: 0;
          font-size: 34px;
          line-height: 1.35;
          word-break: break-word;
        }
        .ticket-progress {
          justify-self: start;
          background: linear-gradient(135deg, #fff7d6, #ffeff9);
          border-radius: 999px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 700;
          color: #7a5b00;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .footer-actions {
          display: flex;
          gap: 6px;
        }
        .comment-trigger {
          background: #f8f9fa;
          border: none;
          padding: 10px 14px;
          border-radius: 999px;
          font-size: 17px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .comment-trigger:hover {
          background: #ececf4;
        }
      `}</style>
    </article>
  );
};
