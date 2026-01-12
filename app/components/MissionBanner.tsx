'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  completeMissionCheckin,
  completeMissionWithPhoto,
  getUserMissionWithDefinition,
  seedDevMissions,
} from '../../lib/missionsClient';
import { getWeeklyStampCount } from '../../lib/rewardsClient';
import type { MissionWithUser } from '../../lib/missionsTypes';

const gradients = [
  'linear-gradient(135deg, #ffe29f, #ffa99f)',
  'linear-gradient(135deg, #c6ffdd, #fbd786)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #f6d365, #fda085)',
  'linear-gradient(135deg, #89f7fe, #66a6ff)',
];

const getSeededUserId = () => {
  if (typeof window === 'undefined') {
    return 'demo-user';
  }
  const key = 'emojiworld_uid';
  const existing = window.localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const generated = crypto.randomUUID();
  window.localStorage.setItem(key, generated);
  return generated;
};

export const MissionBanner = () => {
  const [userId, setUserId] = useState('demo-user');
  const [missionData, setMissionData] = useState<MissionWithUser | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [weeklyStamps, setWeeklyStamps] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setUserId(getSeededUserId());
  }, []);

  useEffect(() => {
    const init = async () => {
      if (process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NODE_ENV === 'development') {
        await seedDevMissions();
      }
      const data = await getUserMissionWithDefinition(userId);
      setMissionData(data);
      const stamps = await getWeeklyStampCount(userId);
      setWeeklyStamps(stamps);
    };

    init().catch(() => {
      setMissionData(null);
    });
  }, [userId]);

  const bannerGradient = useMemo(() => {
    if (!missionData) {
      return gradients[0];
    }
    const index = missionData.mission.id.charCodeAt(0) % gradients.length;
    return gradients[index];
  }, [missionData]);

  const handleBannerClick = () => {
    if (!missionData || missionData.userMission.completed || isUploading) {
      return;
    }
    if (missionData.mission.type === 'photo') {
      fileInputRef.current?.click();
      return;
    }
    completeMissionCheckin({ userMissionId: missionData.userMissionId, userId })
      .then(() => {
        setMissionData({
          ...missionData,
          userMission: { ...missionData.userMission, completed: true },
        });
        return getWeeklyStampCount(userId);
      })
      .then((count) => {
        setWeeklyStamps(Math.min(7, count));
      })
      .catch(() => {});
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!missionData || !event.target.files?.length) {
      return;
    }
    const file = event.target.files[0];
    if (!file) {
      return;
    }
    setIsUploading(true);
    try {
      await completeMissionWithPhoto({
        userMissionId: missionData.userMissionId,
        userId,
        missionId: missionData.mission.id,
        file,
      });
      setMissionData({
        ...missionData,
        userMission: { ...missionData.userMission, completed: true },
      });
      const count = await getWeeklyStampCount(userId);
      setWeeklyStamps(Math.min(7, count));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const renderStamps = () => {
    const total = 7;
    return Array.from({ length: total }).map((_, index) => (
      <span key={index} className="mission-stamp" aria-label={index < weeklyStamps ? '⭐' : '⚪'}>
        {index < weeklyStamps ? '⭐' : '⚪'}
      </span>
    ));
  };

  if (!missionData) {
    return (
      <div className="mission-banner" style={{ background: gradients[0] }} aria-label="⏳">
        <div className="mission-emoji" aria-label="⏳">
          ⏳
        </div>
      </div>
    );
  }

  const isCompleted = missionData.userMission.completed;

  return (
    <div className="mission-banner-wrap">
      <button
        className={`mission-banner ${isCompleted ? 'completed' : ''}`}
        style={{ background: bannerGradient }}
        aria-label={missionData.mission.banner_emoji}
        onClick={handleBannerClick}
      >
        <div className="mission-emoji">{missionData.mission.banner_emoji}</div>
        <div className="mission-overlay">
          <span className="mission-tag">{missionData.mission.mission_emoji}</span>
          {isCompleted && <span className="mission-check">✅</span>}
        </div>
        {isUploading && <div className="mission-upload">📸✨</div>}
      </button>
      <div className="mission-stamps" aria-label="⭐">
        {renderStamps()}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="mission-input"
        onChange={handleFileChange}
      />
    </div>
  );
};
