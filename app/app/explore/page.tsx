'use client';

import { emojiDataset } from '../../../lib/emojiDataset';

const ExplorePage = () => {
  return (
    <div className="explore">
      <div className="block">
        {emojiDataset.rooms.map((emoji) => (
          <div key={emoji} className="chip" aria-label={emoji}>
            {emoji}
          </div>
        ))}
      </div>
      <div className="block">
        {emojiDataset.dailyActivitiesChallenges.map((emoji) => (
          <div key={emoji} className="chip" aria-label={emoji}>
            {emoji}
          </div>
        ))}
      </div>
      <style jsx>{`
        .explore {
          display: grid;
          gap: 16px;
        }
        .block {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          background: rgba(255, 255, 255, 0.8);
          padding: 16px;
          border-radius: 18px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        .chip {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #fff;
          font-size: 22px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ExplorePage;
