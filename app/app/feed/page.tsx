'use client';

import { useEffect, useState } from 'react';
import { FeedCard } from '../../components/FeedCard';
import { listPublicPosts } from '../../../lib/postsClient';

type FeedItem = {
  id: string;
  roomEmoji: string;
  moodEmoji: string;
  captionEmoji: string;
  mediaUrl?: string | null;
  userId: string;
};

const FeedPage = () => {
  const [posts, setPosts] = useState<FeedItem[]>([]);

  useEffect(() => {
    listPublicPosts()
      .then((items) => setPosts(items as FeedItem[]))
      .catch(() => setPosts([]));
  }, []);

  if (!posts.length) {
    return (
      <div className="empty">
        <div className="emoji">🌊✨</div>
        <style jsx>{`
          .empty {
            display: grid;
            place-items: center;
            min-height: 40vh;
          }
          .emoji {
            font-size: 40px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="feed-list">
      <section className="info-card">
        <div className="info-title">EmojiWorld 시작하기</div>
        <p>이 앱은 이모지로만 소통합니다. 텍스트는 안내용으로만 보여요.</p>
        <div className="info-row">
          <span>🏠 피드 보기</span>
          <span>➕ 포스트 만들기</span>
          <span>🎯 미션 완료</span>
        </div>
        <a className="info-cta" href="/intro">
          사용 방법 자세히
        </a>
        <div className="info-links">
          <a href="/privacy">개인정보 처리방침</a>
          <a href="/terms">이용약관</a>
          <a href="/adsense">광고 및 정책 안내</a>
          <a href="/faq">FAQ</a>
          <a href="/safety">신고/차단 안내</a>
        </div>
      </section>
      <a className="intro-banner" href="/intro" aria-label="📣">
        <span className="intro-emoji">📣</span>
        <span className="intro-text">사용 방법 보기</span>
      </a>
      {posts.map((post) => (
        <FeedCard
          key={post.id}
          roomEmoji={post.roomEmoji}
          moodEmoji={post.moodEmoji}
          captionEmoji={post.captionEmoji}
          mediaUrl={post.mediaUrl}
        />
      ))}
      <style jsx>{`
        .feed-list {
          display: grid;
          gap: 16px;
        }
        .info-card {
          background: #fff;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 10px;
        }
        .info-title {
          font-weight: 700;
          font-size: 18px;
        }
        .info-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 13px;
          color: #4b4b5a;
        }
        .info-cta {
          width: fit-content;
          padding: 8px 12px;
          border-radius: 12px;
          background: #6b5bff;
          color: #fff;
          text-decoration: none;
          font-weight: 600;
          font-size: 13px;
        }
        .info-links {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          font-size: 12px;
        }
        .info-links a {
          color: #4b4b5a;
          text-decoration: none;
        }
        .intro-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border-radius: 18px;
          padding: 14px 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          text-decoration: none;
          color: #11121a;
          font-weight: 600;
        }
        .intro-emoji {
          font-size: 24px;
        }
        .intro-text {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default FeedPage;
