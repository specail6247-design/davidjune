'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FeedCard } from '../../components/FeedCard';
import { Post, subscribeToFeed, deletePost } from '../../../lib/postsClient';

const FeedPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToFeed(
      (data) => {
        setPosts(data);
        setIsLoading(false);
        setLoadError(false);
      },
      () => {
        setIsLoading(false);
        setLoadError(true);
      },
    );
    return () => unsubscribe();
  }, []);

  const handleDelete = async (postId: string) => {
    if (window.confirm('🗑️ 정말 삭제할까요? / Delete this post?')) {
      await deletePost(postId);
    }
  };

  return (
    <div className="feed-page">
      <header className="page-header">
        <h1>🌍✨</h1>
        <p className="page-sub">전 세계의 지금 · The world right now</p>
      </header>

      {isLoading && <div className="loading-state">⏳✨</div>}

      {!isLoading && loadError && (
        <div className="empty-state">
          <div className="empty-emoji">📡😢</div>
          <p>연결에 문제가 있어요. 새로고침 해주세요!</p>
        </div>
      )}

      {!isLoading && !loadError && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🌱</div>
          <p>
            아직 게시물이 없어요. 첫 이모지를 남겨보세요!
            <br />
            Be the first to post an emoji!
          </p>
          <Link href="/app/post" className="first-post-btn">
            ➕ 첫 게시물 올리기
          </Link>
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map((post) => (
            <FeedCard key={post.id} post={post} onDelete={() => handleDelete(post.id)} />
          ))}
        </div>
      )}

      <style jsx>{`
        .feed-page {
          display: grid;
          gap: 20px;
        }
        .page-header h1 {
          font-size: 34px;
          margin: 0;
        }
        .page-sub {
          margin: 4px 0 0;
          font-size: 13px;
          color: #8a8a9a;
        }
        .posts-grid {
          display: grid;
          gap: 16px;
        }
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          font-size: 40px;
          animation: pulse 1.2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        .empty-state {
          text-align: center;
          padding: 48px 20px;
          background: rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          display: grid;
          gap: 12px;
          justify-items: center;
        }
        .empty-emoji {
          font-size: 56px;
        }
        .empty-state p {
          margin: 0;
          color: #6b6b7a;
          line-height: 1.6;
        }
        .empty-state :global(.first-post-btn) {
          display: inline-block;
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
          text-decoration: none;
          font-weight: 700;
          padding: 12px 24px;
          border-radius: 999px;
          box-shadow: 0 10px 24px rgba(107, 91, 255, 0.35);
        }
      `}</style>
    </div>
  );
};

export default FeedPage;
