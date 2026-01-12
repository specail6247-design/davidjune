export const DEV_MODE =
  process.env.NEXT_PUBLIC_DEV_MODE === '1' || process.env.NODE_ENV === 'development';

export const AUTO_POST_ON_MISSION = process.env.NEXT_PUBLIC_AUTO_POST_ON_MISSION === 'true';

export const MOBILE_MAX_WIDTH = 680;
