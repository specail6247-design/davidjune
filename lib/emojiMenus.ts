export const emojiMenus = {
  bottomTabs: [
    { emoji: '🏠', id: 'home' },
    { emoji: '🌍', id: 'explore' },
    { emoji: '➕', id: 'create' },
    { emoji: '🫶', id: 'friends' },
    { emoji: '🙂', id: 'profile' },
  ],
  postCreationSteps: [
    { emoji: '🌍', id: 'room' },
    { emoji: '😊', id: 'mood' },
    { emoji: '📸', id: 'media' },
    { emoji: '✅', id: 'publish' },
  ],
  topActions: [
    { emoji: '🔔', id: 'notifications' },
    { emoji: '🎁', id: 'rewards' },
    { emoji: '🎯', id: 'dailyChallenge' },
    { emoji: '⚙️', id: 'settings' },
    { emoji: '🛡️', id: 'moderation' },
  ],
  friendsMenu: [
    { emoji: '🧑‍🤝‍🧑', id: 'friendsList' },
    { emoji: '📩', id: 'incomingRequests' },
    { emoji: '🤝', id: 'accept' },
    { emoji: '🚫', id: 'blockReject' },
    { emoji: '⭐', id: 'slot' },
  ],
  reactions: ['😍', '😂', '😮', '😢', '😡', '🫶'],
  shareGrowth: [
    { emoji: '📤', id: 'share' },
    { emoji: '🔗', id: 'inviteLink' },
    { emoji: '✉️', id: 'inviteFriend' },
    { emoji: '👀', id: 'view' },
  ],
  systemSafety: [
    { emoji: '⚠️', id: 'warning' },
    { emoji: '✅', id: 'success' },
    { emoji: '❌', id: 'error' },
    { emoji: '🔒', id: 'locked' },
    { emoji: '🛡️', id: 'protection' },
  ],
} as const;

export const emojiMenuMapping = {
  bottomTabs: {
    '🏠': 'Home / Feed',
    '🌍': 'Explore / Global feed',
    '➕': 'Create post',
    '🫶': 'Friends / Connections',
    '🙂': 'Profile / Me',
  },
  postCreation: {
    '🌍': 'Select room / category',
    '😊': 'Select mood / emotion',
    '📸': 'Add image (optional)',
    '✅': 'Publish',
  },
  topActions: {
    '🔔': 'Notifications',
    '🎁': 'Rewards',
    '🎯': 'Daily challenge',
    '⚙️': 'Settings',
    '🛡️': 'Admin / Moderation',
  },
  friendsMenu: {
    '🧑‍🤝‍🧑': 'Friends list',
    '📩': 'Incoming requests',
    '🤝': 'Accept request',
    '🚫': 'Block / Reject',
    '⭐': 'Friend slot indicator',
  },
  reactions: {
    '😍': 'Love / Like',
    '😂': 'Funny',
    '😮': 'Surprised',
    '😢': 'Sad / Support',
    '😡': 'Angry',
    '🫶': 'Care / Support',
  },
  shareGrowth: {
    '📤': 'Share',
    '🔗': 'Invite link',
    '✉️': 'Invite friend',
    '👀': 'View / Open',
  },
  systemSafety: {
    '⚠️': 'Warning',
    '✅': 'Success',
    '❌': 'Error',
    '🔒': 'Locked',
    '🛡️': 'Protection',
  },
} as const;

export const recommendedDefaultMenuLayout = {
  bottomTabs: ['🏠', '🌍', '➕', '🫶', '🙂'],
  postCreationFlow: ['🌍', '😊', '📸', '✅'],
  reactions: ['😍', '😂', '😮', '😢', '😡', '🫶'],
  friendsSlotsExample: ['⭐', '⭐', '⭐'],
} as const;

export const emojiMenuUsageNotes = [
  'No text labels in primary navigation or menus; use emoji-only surfaces.',
  'Avoid flags and culturally sensitive or political symbols.',
  'Avoid text-related emojis (e.g., 📝, ✏️) in navigation or menus.',
  'Use neutral defaults; ensure 44px+ touch targets for mobile.',
  'Keep emoji sets consistent across mobile, PWA, and admin surfaces.',
] as const;
