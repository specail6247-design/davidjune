'use client';

type BannerCardProps = {
  emoji: string;
  overlayEmoji?: string;
  onClick?: () => void;
  completed?: boolean;
  badgeEmoji?: string;
};

const gradients = [
  'linear-gradient(135deg, #ffe29f, #ffa99f)',
  'linear-gradient(135deg, #c6ffdd, #fbd786)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
];

export const BannerCard = ({
  emoji,
  overlayEmoji,
  onClick,
  completed,
  badgeEmoji,
}: BannerCardProps) => {
  const gradient = gradients[emoji.codePointAt(0)! % gradients.length];

  return (
    <button
      className={`banner ${completed ? 'completed' : ''}`}
      style={{ background: gradient }}
      onClick={onClick}
      aria-label={emoji}
    >
      <div className="banner-emoji">{emoji}</div>
      {overlayEmoji && <div className="overlay">{overlayEmoji}</div>}
      {badgeEmoji && <div className="badge">{badgeEmoji}</div>}
      <style jsx>{`
        .banner {
          border: none;
          width: 100%;
          min-height: 170px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .banner:hover {
          transform: translateY(-2px);
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.22);
        }
        .banner.completed {
          opacity: 0.65;
          filter: saturate(0.7);
        }
        .banner-emoji {
          font-size: calc(var(--emoji-size) * 2);
        }
        .overlay {
          position: absolute;
          top: 16px;
          left: 16px;
          font-size: 24px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          padding: 6px 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }
        .badge {
          position: absolute;
          bottom: 16px;
          right: 16px;
          font-size: 22px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          padding: 6px 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </button>
  );
};
