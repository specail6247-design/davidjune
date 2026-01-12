export type MissionType = 'photo' | 'checkin';

export type MissionDefinition = {
  id: string;
  mission_emoji: string;
  banner_emoji: string;
  type: MissionType;
  active: boolean;
};

export type UserMission = {
  id?: string;
  user_id: string;
  mission_id: string;
  assigned_date: string;
  completed: boolean;
  completed_at?: unknown;
  media_url?: string | null;
};

export type MissionWithUser = {
  mission: MissionDefinition;
  userMission: UserMission;
  userMissionId: string;
};
