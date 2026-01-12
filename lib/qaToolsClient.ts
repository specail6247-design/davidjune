import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from './firebase';
import { completeMissionWithPhoto } from './missionsV2Client';
import type { MissionWithUser } from './missionsV2Types';

export const simulatePhotoCompletion = async (
  mission: MissionWithUser,
  userId: string,
  shouldAutoPost: boolean,
) => {
  const blob = new Blob(['emojiworld'], { type: 'image/jpeg' });
  const file = new File([blob], 'dev.jpg', { type: 'image/jpeg' });
  await completeMissionWithPhoto({
    userMissionId: mission.userMissionId,
    userId,
    mission: mission.mission,
    file,
    shouldAutoPost,
  });
};

export const markMissionExpired = async (userMissionId: string) => {
  const ref = doc(firestore, 'userMissions', userMissionId);
  await updateDoc(ref, { status: 'expired' });
};
