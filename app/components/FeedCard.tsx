'use client';

import { ReactionTray } from './ReactionTray';

export type FeedCardData = {
  id: string;
  userEmoji: string;
  moodEmoji: string;
  comment: string;
  imageUrl?: string;
  timestamp: any;
};

export const FeedCard = ({ data }: { data: FeedCardData }) => {
  const timeAgo = (timestamp: any) => {
    if (!timestamp) return 'just now';
    const now = Date.now();
    const seconds = Math.floor((now - timestamp.toMillis()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="feed-card">
      <div className="card-header">
        <div className="user-avatar">{data.userEmoji}</div>
        <div className="user-info">
          <div className="user-name">User Name</div>
          <div className="post-time">{timeAgo(data.timestamp)}</div>
        </div>
        <div className="mood-emoji">{data.moodEmoji}</div>
      </div>

      {data.imageUrl && (
        <div className="card-image">
          <img src={data.imageUrl} alt={data.comment} />
        </div>
      )}

      <div className="card-body">
        <p>{data.comment}</p>
      </div>

      <div className="card-footer">
        <ReactionTray postId={data.id} />
      </div>

      <style jsx>{`
        .feed-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          padding: 16px;
          display: grid;
          gap: 12px;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #f0f0f5;
          display: grid;
          place-items: center;
          font-size: 24px;
        }
        .user-info {
          flex: 1;
        }
        .user-name {
          font-weight: 600;
        }
        .post-time {
          font-size: 13px;
          color: #666;
        }
        .mood-emoji {
          font-size: 22px;
        }
        .card-image img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          object-fit: cover;
        }
        .card-body p {
          margin: 0;
          font-size: 15px;
          line-height: 1.5;
        }
        .card-footer {
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
};
