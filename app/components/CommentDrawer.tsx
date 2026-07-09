
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeToComments, addEmojiComment, Comment } from '../../lib/commentsClient';
import { mobileOptimizedSets } from '../../lib/emojiDataset';
import { useAuth } from '../../lib/AuthContext';

type CommentDrawerProps = {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
};

export const CommentDrawer = ({ postId, isOpen, onClose }: CommentDrawerProps) => {
  const { user } = useAuth();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToComments(postId, (data) => {
      setComments(data);
    });
    return () => unsubscribe();
  }, [postId, isOpen]);

  const handleAddComment = async (emoji: string) => {
    if (isSubmitting) return;
    if (!user) {
      router.push('/login');
      return;
    }
    setIsSubmitting(true);
    try {
      await addEmojiComment(postId, user.uid, emoji);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" onClick={onClose} />
        <div className="drawer-header">
          <h3>💬✨</h3>
        </div>
        
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="empty-state">🙊...</div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-bubble">
                <span className="comment-user">👤</span>
                <span className="comment-text">{c.emoji_comment}</span>
              </div>
            ))
          )}
        </div>

        <div className="comment-input-area">
          <p className="input-title">👇 이모지로 답하기 · Reply with emoji</p>
          <div className="emoji-picker-row">
            {mobileOptimizedSets.moodPicker.slice(0, 8).map((emoji) => (
              <button 
                key={emoji} 
                className="emoji-btn"
                onClick={() => handleAddComment(emoji)}
                disabled={isSubmitting}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: flex-end;
        }
        .drawer-content {
          background: #fff;
          width: 100%;
          max-height: 80vh;
          border-top-left-radius: 32px;
          border-top-right-radius: 32px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .drawer-handle {
          width: 40px;
          height: 5px;
          background: #ddd;
          border-radius: 999px;
          margin: 0 auto 16px;
          cursor: pointer;
        }
        .drawer-header h3 {
          margin: 0 0 16px;
          text-align: center;
          font-size: 24px;
        }
        .comments-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 20px;
          min-height: 200px;
        }
        .comment-bubble {
          background: #f8f9fa;
          padding: 12px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          align-self: flex-start;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
        }
        .comment-text {
          font-size: 20px;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          font-size: 32px;
          opacity: 0.5;
        }
        .comment-input-area {
          padding-top: 16px;
          border-top: 1px solid #eee;
        }
        .input-title {
          font-size: 14px;
          font-weight: 600;
          color: #666;
          margin-bottom: 12px;
        }
        .emoji-picker-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }
        .emoji-btn {
          font-size: 28px;
          background: #f0f0f5;
          border: none;
          border-radius: 12px;
          width: 52px;
          height: 52px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .emoji-btn:hover {
          transform: scale(1.1);
          background: #e5e5f0;
        }
        .emoji-btn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};
