'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { BannerCard } from '../../components/BannerCard';
import { PhotoUploadModal } from '../../components/PhotoUploadModal';
import { Toast } from '../../components/Toast';
import {
  completeMissionCheckin,
  completeMissionWithPhoto,
  expireOldMissions,
  getMissionWithUser,
  listRecentUserMissions,
  seedDevMissionsV2,
  skipMission,
  statusOverlayEmoji,
} from '../../../lib/missionsV2Client';
import { AUTO_POST_ON_MISSION, DEV_MODE } from '../../../lib/appConfig';
import { createPost } from '../../../lib/postsClient';
import type { MissionWithUser, UserMission } from '../../../lib/missionsV2Types';
import { getDailyLeaderboard, getWeeklyLeaderboard, scoreToStars } from '../../../lib/leaderboardClient';
import { getSubscription } from '../../../lib/monetizationClient';
import { getQaState } from '../../../lib/qaState';

const MissionsPage = () => {
  const [userId, setUserId] = useState('demo-user');
  const [missionData, setMissionData] = useState<MissionWithUser | null>(null);
  const [history, setHistory] = useState<UserMission[]>([]);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [pendingPost, setPendingPost] = useState<{
    mission: MissionWithUser;
    mediaUrl?: string | null;
  } | null>(null);
  const [dailyBoard, setDailyBoard] = useState<Array<{ userId: string; score: number; avatarEmoji?: string }>>(
    [],
  );
  const [weeklyBoard, setWeeklyBoard] = useState<Array<{ userId: string; score: number; avatarEmoji?: string }>>(
    [],
  );
  const [isElite, setIsElite] = useState(false);
  const [missionBurst, setMissionBurst] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? 'demo-user');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      if (DEV_MODE) {
        await seedDevMissionsV2();
      }
      await expireOldMissions(userId);
      const data = await getMissionWithUser(userId);
      const recent = await listRecentUserMissions(userId);
      setMissionData(data);
      setHistory(recent.slice(0, 7));
      const daily = await getDailyLeaderboard();
      const weekly = await getWeeklyLeaderboard();
      setDailyBoard(daily ?? []);
      setWeeklyBoard(weekly ?? []);
      const sub = await getSubscription(userId);
      setIsElite(sub?.plan === 'elite' || getQaState().showEliteEffectsPreview);
    };
    init().catch(() => {});
  }, [userId]);

  const handleComplete = async (file?: File) => {
    if (!missionData) return;
    const autoPost = AUTO_POST_ON_MISSION;
    if (missionData.mission.type === 'photo') {
      if (!file) return;
      const mediaUrl = await completeMissionWithPhoto({
        userMissionId: missionData.userMissionId,
        userId,
        mission: missionData.mission,
        file,
        shouldAutoPost: autoPost,
      });
      setMissionData({
        ...missionData,
        userMission: { ...missionData.userMission, status: 'completed', autoPosted: autoPost, mediaUrl },
      });
      if (!autoPost) {
        setPendingPost({ mission: missionData, mediaUrl });
      } else {
        setToast('📸✅');
        setMissionBurst(true);
        setTimeout(() => setMissionBurst(false), 300);
      }
      return;
    }
    await completeMissionCheckin({
      userMissionId: missionData.userMissionId,
      userId,
      mission: missionData.mission,
      shouldAutoPost: autoPost,
    });
    setMissionData({
      ...missionData,
      userMission: { ...missionData.userMission, status: 'completed', autoPosted: autoPost },
    });
    if (!autoPost) {
      setPendingPost({ mission: missionData });
    } else {
      setToast('✅');
      setMissionBurst(true);
      setTimeout(() => setMissionBurst(false), 300);
    }
  };

  const handlePostNow = async () => {
    if (!pendingPost) return;
    await createPost({
      userId,
      roomEmoji: pendingPost.mission.mission.roomEmoji,
      moodEmoji: '🙂',
      captionEmoji: `${pendingPost.mission.mission.missionEmoji}✨`,
      mediaUrl: pendingPost.mediaUrl ?? null,
      visibility: 'public',
    });
    const { markMissionAutoPosted } = await import('../../../lib/missionsV2Client');
    await markMissionAutoPosted(pendingPost.mission.userMissionId);
    setMissionData({
      ...pendingPost.mission,
      userMission: { ...pendingPost.mission.userMission, autoPosted: true },
    });
    setPendingPost(null);
    setToast('✅');
  };

  const handleSaveOnly = () => {
    setPendingPost(null);
    setToast('🕒');
  };

  const badge = useMemo(() => {
    if (!missionData) return '';
    if (missionData.userMission.status !== 'completed') return '';
    return missionData.userMission.autoPosted ? '📸✅' : '✅';
  }, [missionData]);

  if (!missionData) {
    return null;
  }

  const overlay = statusOverlayEmoji(missionData.userMission.status);
  const isCompleted = missionData.userMission.status === 'completed';

  return (
    <div className="missions">
      <BannerCard
        emoji={missionData.mission.bannerEmoji}
        overlayEmoji={overlay || missionData.mission.missionEmoji}
        badgeEmoji={badge}
        completed={isCompleted}
        onClick={() => {
          if (missionData.userMission.status !== 'active') return;
          if (missionData.mission.type === 'photo') {
            setPhotoOpen(true);
          } else {
            handleComplete();
          }
        }}
      />
      {missionBurst && <div className="mission-burst">🎉✨</div>}
      <div className="mission-actions">
        <button
          className="action"
          onClick={async () => {
            await skipMission(missionData.userMissionId);
            setMissionData({
              ...missionData,
              userMission: { ...missionData.userMission, status: 'skipped' },
            });
          }}
          aria-label="💤"
        >
          💤
        </button>
      </div>
      <div className="history">
        {history.map((mission) => (
          <div key={mission.id} className="history-tile" aria-label={mission.status}>
            {statusOverlayEmoji(mission.status) || '⏳'}
          </div>
        ))}
      </div>
      <div className="leaderboard">
        <div className="board">
          <div className="board-title" aria-label="🏆🗓️">
            🏆🗓️
          </div>
          <div className="board-list">
            {dailyBoard.slice(0, 50).map((entry, index) => (
              <div
                key={entry.userId}
                className={`board-row ${entry.userId === userId ? 'me' : ''} ${
                  entry.userId === userId && isElite ? 'elite' : ''
                }`}
              >
                <span className="rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}</span>
                <span className="avatar">{entry.avatarEmoji ?? '🙂'}</span>
                <span className="score">{scoreToStars(entry.score)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="board">
          <div className="board-title" aria-label="🏆📅">
            🏆📅
          </div>
          <div className="board-list">
            {weeklyBoard.slice(0, 50).map((entry, index) => (
              <div
                key={entry.userId}
                className={`board-row ${entry.userId === userId ? 'me' : ''} ${
                  entry.userId === userId && isElite ? 'elite' : ''
                }`}
              >
                <span className="rank">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}</span>
                <span className="avatar">{entry.avatarEmoji ?? '🙂'}</span>
                <span className="score">{scoreToStars(entry.score)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PhotoUploadModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSelect={(file) => handleComplete(file)}
      />
      {pendingPost && (
        <div className="decision">
          <div className="panel">
            <button className="choice" onClick={handlePostNow} aria-label="✅">
              ✅
            </button>
            <button className="choice" onClick={handleSaveOnly} aria-label="🕒">
              🕒
            </button>
          </div>
        </div>
      )}
      <Toast message={toast} isOpen={!!toast} />
      <style jsx>{`
        .missions {
          display: grid;
          gap: 16px;
        }
        .mission-burst {
          font-size: 22px;
          animation: burst 0.3s ease;
          justify-self: end;
        }
        .mission-actions {
          display: flex;
          gap: 12px;
        }
        .action {
          border: none;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: #fff;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .history {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .history-tile {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #fff;
          display: grid;
          place-items: center;
          font-size: 20px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.06);
        }
        .decision {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 20, 0.4);
          display: grid;
          place-items: center;
          z-index: 50;
        }
        .panel {
          background: #fff;
          padding: 20px;
          border-radius: 20px;
          display: flex;
          gap: 16px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .choice {
          border: none;
          width: 60px;
          height: 60px;
          border-radius: 18px;
          font-size: 26px;
          cursor: pointer;
        }
        .leaderboard {
          display: grid;
          gap: 16px;
        }
        .board {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 12px;
        }
        .board-title {
          font-size: 20px;
        }
        .board-list {
          display: grid;
          gap: 8px;
        }
        .board-row {
          display: grid;
          grid-template-columns: 36px 36px 1fr;
          align-items: center;
          gap: 8px;
          background: #fff;
          border-radius: 14px;
          padding: 8px 10px;
          font-size: 16px;
        }
        .board-row.me {
          box-shadow: inset 0 0 0 2px rgba(107, 91, 255, 0.4);
        }
        .board-row.elite {
          background: linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(255, 79, 216, 0.12));
          animation: shimmer 1.6s ease-in-out infinite;
          background-size: 200% 200%;
        }
        .rank {
          text-align: center;
        }
        .avatar {
          font-size: 20px;
        }
        .score {
          font-size: 16px;
        }
        @keyframes burst {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default MissionsPage;
