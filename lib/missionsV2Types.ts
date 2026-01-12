export type MissionType = 'photo' | 'checkin';
export type MissionStatus = 'active' | 'completed' | 'skipped' | 'expired';

export type MissionDefinition = {
  id: string;
  roomEmoji: string;
  missionEmoji: string;
  bannerEmoji: string;
  type: MissionType;
  active: boolean;
  createdAt?: unknown;
};

export type UserMission = {
  id?: string;
  userId: string;
  missionId: string;
  date: string;
  status: MissionStatus;
  completedAt?: unknown;
  mediaUrl?: string | null;
  createdAt?: unknown;
  autoPosted?: boolean;
  missionEmoji?: string;
};

export type MissionWithUser = {
  mission: MissionDefinition;
  userMission: UserMission;
  userMissionId: string;
};
