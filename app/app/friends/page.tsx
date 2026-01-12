'use client';

import { emojiMenus } from '../../../lib/emojiMenus';

const FriendsPage = () => {
  return (
    <div className="friends">
      <div className="row">
        {emojiMenus.friendsMenu
          .filter((item) => item.id !== 'slot')
          .map((item) => (
            <button key={item.id} className="chip" aria-label={item.emoji}>
              {item.emoji}
            </button>
          ))}
      </div>
      <div className="slots">
        {['⭐', '⭐', '⭐'].map((star, index) => (
          <span key={`${star}-${index}`} className="slot" aria-label={star}>
            {star}
          </span>
        ))}
      </div>
      <style jsx>{`
        .friends {
          display: grid;
          gap: 16px;
        }
        .row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .chip {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          border: none;
          background: #fff;
          font-size: 22px;
          display: grid;
          place-items: center;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .slots {
          display: flex;
          gap: 8px;
        }
        .slot {
          font-size: 22px;
        }
      `}</style>
    </div>
  );
};

export default FriendsPage;
