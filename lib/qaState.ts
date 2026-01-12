const KEY = 'emojiworld_qa';

export type QaState = {
  simulateRevealAnimation: boolean;
  forceLimitExceeded: boolean;
  showEliteEffectsPreview: boolean;
  simulateResetClock: boolean;
  simulateGiftSend: boolean;
};

const DEFAULT_STATE: QaState = {
  simulateRevealAnimation: false,
  forceLimitExceeded: false,
  showEliteEffectsPreview: false,
  simulateResetClock: false,
  simulateGiftSend: false,
};

export const getQaState = (): QaState => {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }
  const raw = window.localStorage.getItem(KEY);
  if (!raw) {
    return DEFAULT_STATE;
  }
  try {
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as QaState) };
  } catch {
    return DEFAULT_STATE;
  }
};

export const setQaState = (updates: Partial<QaState>) => {
  if (typeof window === 'undefined') {
    return;
  }
  const next = { ...getQaState(), ...updates };
  window.localStorage.setItem(KEY, JSON.stringify(next));
};
