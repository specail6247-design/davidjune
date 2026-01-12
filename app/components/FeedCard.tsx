'use client';

type FeedCardProps = {
  roomEmoji: string;
  moodEmoji: string;
  captionEmoji: string;
  mediaUrl?: string | null;
  avatarEmoji?: string;
};

export const FeedCard = ({
  roomEmoji,
  moodEmoji,
  captionEmoji,
  mediaUrl,
  avatarEmoji = '🙂',
}: FeedCardProps) => {
  return (
    <div className="feed-card">
      <div className="feed-header">
        <span className="avatar">{avatarEmoji}</span>
        <span className="room">{roomEmoji}</span>
        <span className="mood">{moodEmoji}</span>
      </div>
      {mediaUrl && <img className="media" src={mediaUrl} alt="" />}
      <div className="caption">{captionEmoji}</div>
      <style jsx>{`
        .feed-card {
          background: #fff;
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 12px;
        }
        .feed-header {
          display: flex;
          gap: 10px;
          align-items: center;
          font-size: var(--emoji-size);
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: #f4f4fb;
          display: grid;
          place-items: center;
        }
        .media {
          width: 100%;
          border-radius: 16px;
          object-fit: cover;
          aspect-ratio: 4 / 3;
        }
        .caption {
          font-size: var(--emoji-size);
        }
      `}</style>
    </div>
  );
};
