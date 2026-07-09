/**
 * 오늘의 주제 (Daily Prompt) — Wordle/BeReal식 데일리 리추얼.
 * 매일 전 세계가 같은 질문에 이모지로 답하며, 날짜 기반 순환이라 서버가 필요 없다.
 */
export type DailyPrompt = {
  emoji: string;
  ko: string;
  en: string;
};

const PROMPTS: DailyPrompt[] = [
  { emoji: '🌤️🙂', ko: '오늘 날씨와 내 기분은?', en: "Today's weather & your mood?" },
  { emoji: '🍽️😋', ko: '오늘 제일 맛있었던 것?', en: 'Best thing you ate today?' },
  { emoji: '🎵💃', ko: '지금 어울리는 음악 분위기는?', en: 'What music fits your vibe?' },
  { emoji: '😴💭', ko: '어젯밤 꿈을 이모지로!', en: "Last night's dream in emoji!" },
  { emoji: '💪🎯', ko: '오늘의 목표는?', en: "Today's goal?" },
  { emoji: '☕🌅', ko: '나의 아침 루틴은?', en: 'Your morning routine?' },
  { emoji: '🐾❤️', ko: '최애 동물은?', en: 'Your favorite animal?' },
  { emoji: '✈️🗺️', ko: '지금 당장 가고 싶은 곳은?', en: 'Where do you want to go right now?' },
  { emoji: '🎬🍿', ko: '오늘 밤 뭐 볼까?', en: "Tonight's watch?" },
  { emoji: '🥳🎁', ko: '최근 가장 기뻤던 순간은?', en: 'Your happiest recent moment?' },
  { emoji: '😩🫠', ko: '오늘 나를 힘들게 한 것?', en: "Today's struggle?" },
  { emoji: '🌈✨', ko: '내일 기대되는 것?', en: 'What are you looking forward to?' },
  { emoji: '🫶💌', ko: '소중한 사람에게 이모지 한마디!', en: 'A message to someone you love!' },
  { emoji: '🏃💦', ko: '오늘 몸을 움직였나요?', en: 'Did you move your body today?' },
  { emoji: '🍜🌍', ko: '우리나라 최고의 음식은?', en: 'Best food from your country?' },
  { emoji: '📚🧠', ko: '요즘 배우고 있는 것?', en: 'What are you learning lately?' },
  { emoji: '🌙🛌', ko: '잠들기 전 마지막 생각은?', en: 'Last thought before sleep?' },
  { emoji: '🎮🕹️', ko: '요즘 푹 빠져있는 것?', en: 'Your current obsession?' },
  { emoji: '🛍️💸', ko: '최근 산 것 중 최고는?', en: 'Best recent purchase?' },
  { emoji: '🌧️🏠', ko: '비 오는 날엔 뭐 해?', en: 'Rainy day plans?' },
  { emoji: '😂🤣', ko: '오늘 나를 웃게 한 것?', en: 'What made you laugh today?' },
];

/** UTC 날짜 기준으로 매일 하나씩 순환 — 전 세계가 같은 주제를 공유 */
export const getTodayPrompt = (): DailyPrompt => {
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return PROMPTS[dayIndex % PROMPTS.length];
};
