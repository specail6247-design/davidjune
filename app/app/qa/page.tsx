'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { DEV_MODE } from '../../../lib/appConfig';
import {
  getMissionWithUser,
  seedDevMissionsV2,
  completeMissionCheckin,
} from '../../../lib/missionsV2Client';
import { simulatePhotoCompletion, markMissionExpired } from '../../../lib/qaToolsClient';
import { getDailyLeaderboard, getWeeklyLeaderboard } from '../../../lib/leaderboardClient';
import { getQaState, setQaState } from '../../../lib/qaState';

const QaPage = () => {
  const [userId, setUserId] = useState('demo-user');
  const [status, setStatus] = useState('🧪');
  const [toggles, setToggles] = useState(getQaState());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? 'demo-user');
    });
    return () => unsubscribe();
  }, []);

  if (!DEV_MODE) {
    return null;
  }

  return (
    <div className="qa">
      <div className="toggle-row">
        {[
          { key: 'simulateRevealAnimation', label: '🎬' },
          { key: 'forceLimitExceeded', label: '🚫' },
          { key: 'showEliteEffectsPreview', label: '🌟' },
          { key: 'simulateResetClock', label: '⏳' },
          { key: 'simulateGiftSend', label: '🎁' },
        ].map((item) => (
          <button
            key={item.key}
            className={`chip ${toggles[item.key as keyof typeof toggles] ? 'active' : ''}`}
            onClick={() => {
              const next = {
                ...toggles,
                [item.key]: !toggles[item.key as keyof typeof toggles],
              };
              setToggles(next);
              setQaState({ [item.key]: next[item.key as keyof typeof toggles] });
            }}
            aria-label={item.label}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        className="chip"
        onClick={async () => {
          await seedDevMissionsV2();
          setStatus('✅');
        }}
        aria-label="🌱"
      >
        🌱
      </button>
      <button
        className="chip"
        onClick={async () => {
          const mission = await getMissionWithUser(userId);
          await simulatePhotoCompletion(mission, userId, true);
          setStatus('📸✅');
        }}
        aria-label="📸"
      >
        📸
      </button>
      <button
        className="chip"
        onClick={async () => {
          const mission = await getMissionWithUser(userId);
          await completeMissionCheckin({
            userMissionId: mission.userMissionId,
            userId,
            mission: mission.mission,
            shouldAutoPost: true,
          });
          setStatus('✅');
        }}
        aria-label="✅"
      >
        ✅
      </button>
      <button
        className="chip"
        onClick={async () => {
          const mission = await getMissionWithUser(userId);
          await markMissionExpired(mission.userMissionId);
          setStatus('🫥');
        }}
        aria-label="🫥"
      >
        🫥
      </button>
      <button
        className="chip"
        onClick={async () => {
          await getDailyLeaderboard();
          await getWeeklyLeaderboard();
          setStatus('🏆');
        }}
        aria-label="🏆"
      >
        🏆
      </button>
      <div className="status" aria-label={status}>
        {status}
      </div>
      <style jsx>{`
        .qa {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }
        .toggle-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          width: 100%;
        }
        .chip {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          border: none;
          background: #fff;
          font-size: 22px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
          cursor: pointer;
        }
        .chip.active {
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
        }
        .status {
          font-size: 22px;
          padding: 10px 14px;
          border-radius: 999px;
          background: #fff;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
};

export default QaPage;
