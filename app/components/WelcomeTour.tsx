'use client';

import { useEffect, useState } from 'react';

const TOUR_SEEN_KEY = 'emojiworld_tour_v2_seen';

type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'th';

const LANGS: { code: Lang; flag: string }[] = [
  { code: 'ko', flag: '🇰🇷' },
  { code: 'en', flag: '🇺🇸' },
  { code: 'ja', flag: '🇯🇵' },
  { code: 'zh', flag: '🇨🇳' },
  { code: 'th', flag: '🇹🇭' },
];

type Slide = {
  emoji: string;
  title: Record<Lang, string>;
  desc: Record<Lang, string>;
};

const SLIDES: Slide[] = [
  {
    emoji: '🌍💬',
    title: {
      ko: '말 대신 이모지!',
      en: 'No words. Just emoji!',
      ja: '言葉のかわりに絵文字!',
      zh: '不用文字，只用表情!',
      th: 'ไม่ต้องพิมพ์ ใช้อิโมจิ!',
    },
    desc: {
      ko: '전 세계 누구와도 언어 걱정 없이 통해요.',
      en: 'Connect with anyone on Earth — no language barrier.',
      ja: '世界中の誰とでも言葉の壁なしでつながる。',
      zh: '与全世界的人沟通，没有语言障碍。',
      th: 'สื่อสารกับคนทั่วโลกโดยไม่มีกำแพงภาษา',
    },
  },
  {
    emoji: '✏️😊',
    title: {
      ko: '이모지로 글쓰기',
      en: 'Post with emoji',
      ja: '絵文字で投稿',
      zh: '用表情发帖',
      th: 'โพสต์ด้วยอิโมจิ',
    },
    desc: {
      ko: '➕ 버튼을 눌러 오늘 기분을 이모지로 올려보세요.',
      en: 'Tap ➕ and share your day in emoji.',
      ja: '➕をタップして今日の気分を投稿しよう。',
      zh: '点击 ➕，用表情分享你的一天。',
      th: 'แตะ ➕ แล้วแชร์วันของคุณด้วยอิโมจิ',
    },
  },
  {
    emoji: '❤️➡️📸',
    title: {
      ko: '좋아요 = 사진 티켓!',
      en: 'Likes unlock photos!',
      ja: 'いいねで写真解禁!',
      zh: '点赞解锁照片!',
      th: 'ยอดไลก์ปลดล็อกรูปภาพ!',
    },
    desc: {
      ko: '반응 5개를 모으면 사진 1장을 올릴 수 있어요. 사진은 특권!',
      en: 'Every 5 reactions = 1 photo ticket. Photos are a privilege here!',
      ja: 'リアクション5個で写真チケット1枚。写真は特権!',
      zh: '每 5 个反应 = 1 张照片券。照片是特权!',
      th: 'ทุก 5 รีแอ็กชัน = ตั๋วรูป 1 ใบ',
    },
  },
  {
    emoji: '🫶🌱',
    title: {
      ko: '모두에게 안전해요',
      en: 'Safe for everyone',
      ja: 'みんなに安全',
      zh: '对所有人都安全',
      th: 'ปลอดภัยสำหรับทุกคน',
    },
    desc: {
      ko: '이모지만 쓸 수 있어서 악플이 없어요. 아이부터 어른까지!',
      en: 'Emoji-only means no hate comments. From kids to grandparents!',
      ja: '絵文字だけだから悪口コメントなし。子供からお年寄りまで!',
      zh: '只能用表情，没有恶评。老少皆宜!',
      th: 'ใช้ได้แค่อิโมจิ จึงไม่มีคอมเมนต์ร้าย ๆ',
    },
  },
];

const NEXT_LABEL: Record<Lang, string> = {
  ko: '다음',
  en: 'Next',
  ja: '次へ',
  zh: '下一步',
  th: 'ถัดไป',
};

const START_LABEL: Record<Lang, string> = {
  ko: '시작하기',
  en: "Let's go",
  ja: 'はじめる',
  zh: '开始',
  th: 'เริ่มเลย',
};

const detectLang = (): Lang => {
  if (typeof navigator === 'undefined') return 'en';
  const nav = navigator.language.toLowerCase();
  if (nav.startsWith('ko')) return 'ko';
  if (nav.startsWith('ja')) return 'ja';
  if (nav.startsWith('zh')) return 'zh';
  if (nav.startsWith('th')) return 'th';
  return 'en';
};

export const WelcomeTour = ({ forceOpen, onClose }: { forceOpen?: boolean; onClose?: () => void }) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    setLang(detectLang());
    if (forceOpen) {
      setStep(0);
      setOpen(true);
      return;
    }
    if (!localStorage.getItem(TOUR_SEEN_KEY)) {
      setOpen(true);
    }
  }, [forceOpen]);

  const finish = () => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setOpen(false);
    setStep(0);
    onClose?.();
  };

  if (!open) return null;

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true">
      <div className="tour-card">
        <div className="lang-row">
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`lang-chip ${lang === l.code ? 'active' : ''}`}
              onClick={() => setLang(l.code)}
              aria-label={l.code}
            >
              {l.flag}
            </button>
          ))}
          <button className="close-chip" onClick={finish} aria-label="skip">
            ✖️
          </button>
        </div>

        <div className="slide-emoji" key={`emoji-${step}`}>
          {slide.emoji}
        </div>
        <h2 className="slide-title">{slide.title[lang]}</h2>
        <p className="slide-desc">{slide.desc[lang]}</p>

        <div className="dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === step ? 'active' : ''}`}
              onClick={() => setStep(i)}
              aria-label={`step ${i + 1}`}
            />
          ))}
        </div>

        <button
          className="next-btn"
          onClick={() => (isLast ? finish() : setStep(step + 1))}
        >
          {isLast ? `${START_LABEL[lang]} ✨` : `${NEXT_LABEL[lang]} →`}
        </button>
      </div>

      <style jsx>{`
        .tour-overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 8, 26, 0.65);
          backdrop-filter: blur(6px);
          z-index: 9000;
          display: grid;
          place-items: center;
          padding: 20px;
        }
        .tour-card {
          width: min(400px, 94vw);
          background: #fff;
          border-radius: 32px;
          padding: 24px;
          text-align: center;
          display: grid;
          gap: 14px;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
          animation: cardIn 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }
        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.94);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .lang-row {
          display: flex;
          gap: 6px;
          justify-content: center;
          align-items: center;
        }
        .lang-chip {
          border: none;
          background: #f4f4fb;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .lang-chip.active {
          background: linear-gradient(135deg, #ffe3f6, #e6e2ff);
          box-shadow: 0 0 0 2px rgba(107, 91, 255, 0.4);
        }
        .close-chip {
          border: none;
          background: transparent;
          font-size: 14px;
          cursor: pointer;
          margin-left: auto;
          opacity: 0.5;
        }
        .slide-emoji {
          font-size: 72px;
          line-height: 1.2;
          animation: bounceIn 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28);
        }
        @keyframes bounceIn {
          from {
            transform: scale(0.5);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .slide-title {
          margin: 0;
          font-size: 24px;
          font-weight: 800;
        }
        .slide-desc {
          margin: 0;
          color: #6b6b7a;
          font-size: 15px;
          line-height: 1.6;
          min-height: 48px;
        }
        .dots {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          border: none;
          background: #e3e3ee;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }
        .dot.active {
          width: 26px;
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
        }
        .next-btn {
          border: none;
          border-radius: 16px;
          padding: 15px;
          font-size: 17px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
          box-shadow: 0 12px 26px rgba(107, 91, 255, 0.4);
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};
