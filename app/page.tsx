'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Lang = 'en' | 'ko';

const copy = {
  en: {
    navFeatures: 'Why us',
    navHow: 'How it works',
    navFaq: 'FAQ',
    navCta: '🚀 Start free',
    heroTitle1: 'No Words.',
    heroTitle2: 'Just Emoji.',
    heroSub:
      'The social network where the whole planet speaks one language. Post your day in emoji, collect hearts, and unlock the privilege of photos.',
    heroCtaMain: '🎈 Start in 3 seconds',
    heroCtaSub: '👀 Peek at the feed',
    heroNote: 'Free · No signup needed · Works everywhere',
    statCountries: 'One planet',
    statBarrier: 'Language barriers',
    statAges: 'Ages welcome',
    whyTitle: 'Why Picto beats a photo feed 📸',
    whySub: 'Not another Instagram clone. Four things nobody else does.',
    why: [
      {
        emoji: '🌍',
        title: 'Zero language barrier',
        desc: 'Emoji is the only language everyone on Earth already speaks. A kid in Seoul and a grandma in Brazil can be best friends here.',
      },
      {
        emoji: '❤️➡️📸',
        title: 'Photos are earned',
        desc: 'Anyone can spam photos elsewhere. Here, 5 reactions = 1 photo ticket. When you see a photo on Picto, it means the community wanted it.',
      },
      {
        emoji: '🛡️',
        title: 'Hate comments are impossible',
        desc: 'Comments are emoji-only — by design. There is literally no way to type an insult. The safest feed for kids and grandparents alike.',
      },
      {
        emoji: '🎈',
        title: '3-second onboarding',
        desc: 'No email. No password. No profile forms. Tap once, pick an emoji face, start posting. Anyone from 7 to 97 can figure it out.',
      },
    ],
    howTitle: 'How it works 🎮',
    how: [
      { emoji: '😊', title: '1. Compose with emoji', desc: 'Tap emojis like piano keys to write your day: 😴💭☕ = "sleepy, dreaming of coffee".' },
      { emoji: '❤️', title: '2. Collect reactions', desc: 'The world reacts with hearts, laughs and fire. Every reaction fills your photo meter.' },
      { emoji: '📸', title: '3. Unlock photos', desc: 'Every 5 reactions earns a photo ticket. Drop a real photo — the feed pays attention.' },
    ],
    premiumTitle: 'Picto Plus ✨',
    premiumSub: 'Coming soon — support the world’s friendliest network.',
    premium: [
      { emoji: '🎨', title: 'Premium emoji packs', desc: 'Exclusive character & 3D emoji packs.' },
      { emoji: '🌟', title: 'Profile aura', desc: 'Glow effects that make your avatar shine.' },
      { emoji: '🚀', title: 'Post boost', desc: 'Put your best emoji story in front of the world.' },
    ],
    faqTitle: 'FAQ 🙋',
    faq: [
      {
        q: 'Is it really free?',
        a: 'Yes. Posting, reacting and commenting are free forever. Optional Plus cosmetics fund the servers.',
      },
      {
        q: 'Why can’t I just upload photos right away?',
        a: 'One free photo ticket is included when you join! After that, photos are earned with reactions — that is what keeps the feed kind, fun and spam-free.',
      },
      {
        q: 'Is it safe for children?',
        a: 'Emoji-only communication means no text bullying, no phishing links, no scam DMs. It is the feed we would hand our own kids.',
      },
      {
        q: 'What if I don’t want an account?',
        a: 'Start as a guest with one tap. You can link a Google account later to keep your emoji history forever.',
      },
    ],
    finalTitle: 'The world is waiting to hear you 🌍',
    finalSub: 'Say it without words.',
    finalCta: '🚀 Open Picto',
    footerAbout: 'About',
    footerFaq: 'FAQ',
    footerTerms: 'Terms',
    footerPrivacy: 'Privacy',
  },
  ko: {
    navFeatures: '차별점',
    navHow: '사용법',
    navFaq: '자주 묻는 질문',
    navCta: '🚀 무료로 시작',
    heroTitle1: '말은 필요 없어요.',
    heroTitle2: '이모지면 충분해요.',
    heroSub:
      '지구 전체가 하나의 언어로 대화하는 소셜 네트워크. 이모지로 하루를 올리고, 하트를 모아 사진 올릴 특권을 잠금해제하세요.',
    heroCtaMain: '🎈 3초만에 시작하기',
    heroCtaSub: '👀 피드 구경하기',
    heroNote: '무료 · 가입 없이 시작 · 어디서나 작동',
    statCountries: '하나의 지구',
    statBarrier: '언어 장벽',
    statAges: '모든 연령 환영',
    whyTitle: '인스타그램과 다른 이유 📸',
    whySub: '또 하나의 사진 앱이 아닙니다. 우리만 하는 4가지.',
    why: [
      {
        emoji: '🌍',
        title: '언어 장벽 제로',
        desc: '이모지는 지구인 모두가 이미 아는 유일한 언어예요. 서울의 아이와 브라질의 할머니가 여기선 친구가 됩니다.',
      },
      {
        emoji: '❤️➡️📸',
        title: '사진은 특권',
        desc: '다른 곳에선 누구나 사진을 쏟아내죠. 여기선 반응 5개 = 사진 티켓 1장. Picto의 사진은 커뮤니티가 원해서 올라온 사진입니다.',
      },
      {
        emoji: '🛡️',
        title: '악플이 원천적으로 불가능',
        desc: '댓글은 이모지만 가능해요. 욕설을 입력할 방법 자체가 없죠. 아이도 어르신도 안심하는 가장 안전한 피드.',
      },
      {
        emoji: '🎈',
        title: '3초 온보딩',
        desc: '이메일도, 비밀번호도, 프로필 양식도 없어요. 한 번 탭하고 이모지 얼굴 고르면 끝. 7살부터 97살까지 누구나.',
      },
    ],
    howTitle: '이렇게 사용해요 🎮',
    how: [
      { emoji: '😊', title: '1. 이모지로 작성', desc: '피아노 치듯 이모지를 탭해 하루를 써요: 😴💭☕ = "졸려서 커피 생각 중".' },
      { emoji: '❤️', title: '2. 반응 모으기', desc: '전 세계가 하트·웃음·불꽃으로 반응해요. 반응 하나하나가 사진 게이지를 채웁니다.' },
      { emoji: '📸', title: '3. 사진 잠금해제', desc: '반응 5개마다 사진 티켓 1장. 진짜 사진을 올리면 피드가 주목합니다.' },
    ],
    premiumTitle: 'Picto Plus ✨',
    premiumSub: '곧 출시 — 세상에서 가장 다정한 네트워크를 응원해주세요.',
    premium: [
      { emoji: '🎨', title: '프리미엄 이모지 팩', desc: '독점 캐릭터 · 3D 이모지 팩.' },
      { emoji: '🌟', title: '프로필 오라', desc: '아바타를 빛나게 하는 글로우 효과.' },
      { emoji: '🚀', title: '게시물 부스트', desc: '나의 최고 이모지 스토리를 전 세계 앞에.' },
    ],
    faqTitle: '자주 묻는 질문 🙋',
    faq: [
      {
        q: '정말 무료인가요?',
        a: '네. 게시·반응·댓글은 영원히 무료예요. 선택형 Plus 꾸미기 아이템이 서버비를 책임집니다.',
      },
      {
        q: '왜 사진을 바로 올릴 수 없나요?',
        a: '가입하면 무료 티켓 1장을 드려요! 이후엔 반응으로 사진을 얻습니다. 그래서 피드가 다정하고 재미있고 스팸이 없어요.',
      },
      {
        q: '아이가 써도 안전한가요?',
        a: '이모지 전용 소통이라 문자 괴롭힘, 피싱 링크, 사기 DM이 없어요. 저희 아이에게도 쥐여줄 수 있는 피드입니다.',
      },
      {
        q: '계정을 만들기 싫다면요?',
        a: '탭 한 번으로 게스트 시작! 나중에 Google 계정을 연결하면 이모지 기록이 영구 보관돼요.',
      },
    ],
    finalTitle: '세상이 당신의 이야기를 기다려요 🌍',
    finalSub: '말없이 말해보세요.',
    finalCta: '🚀 Picto 입장하기',
    footerAbout: '소개',
    footerFaq: 'FAQ',
    footerTerms: '이용약관',
    footerPrivacy: '개인정보처리방침',
  },
} as const;

const demoFeed = [
  { avatar: '🧑‍🦱', country: '🇧🇷', caption: '⚽🔥🎉', reactions: '❤️ 12 · 😂 4' },
  { avatar: '👧', country: '🇰🇷', caption: '📚😮‍💨☕✨', reactions: '❤️ 8 · 🥺 3' },
  { avatar: '👴', country: '🇮🇹', caption: '🍝👨‍🍳💯', reactions: '🔥 21 · 👏 9' },
];

const HomePage = () => {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    if (navigator.language.toLowerCase().startsWith('ko')) {
      setLang('ko');
    }
  }, []);

  const t = copy[lang];

  return (
    <div className="landing">
      <div className="bg-noise" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />

      {/* Nav */}
      <nav className="nav">
        <Link href="/" className="nav-logo">
          🪩🌍 <span className="nav-brand">Picto</span>
        </Link>
        <div className="nav-links">
          <a href="#why">{t.navFeatures}</a>
          <a href="#how">{t.navHow}</a>
          <a href="#faq">{t.navFaq}</a>
        </div>
        <div className="nav-actions">
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
            aria-label="language"
          >
            {lang === 'en' ? '🇰🇷' : '🇺🇸'}
          </button>
          <Link href="/login" className="nav-cta">
            {t.navCta}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="hero-copy">
          <h1>
            <span className="hero-line">{t.heroTitle1}</span>
            <span className="hero-line gradient-text">{t.heroTitle2}</span>
          </h1>
          <p className="hero-sub">{t.heroSub}</p>
          <div className="cta-row">
            <Link href="/login" className="cta primary">
              {t.heroCtaMain}
            </Link>
            <Link href="/app/feed" className="cta ghost">
              {t.heroCtaSub}
            </Link>
          </div>
          <p className="hero-note">{t.heroNote}</p>
        </div>

        {/* Phone mockup */}
        <div className="phone">
          <div className="phone-notch" />
          <div className="phone-header">🪩🌍</div>
          {demoFeed.map((item) => (
            <div className="phone-card" key={item.caption}>
              <div className="phone-card-top">
                <span className="phone-avatar">{item.avatar}</span>
                <span className="phone-country">{item.country}</span>
              </div>
              <div className="phone-caption">{item.caption}</div>
              <div className="phone-reactions">{item.reactions}</div>
            </div>
          ))}
          <div className="phone-unlock">❤️ ×5 ➡️ 📸 1</div>
        </div>
      </header>

      {/* Stats strip */}
      <section className="stats">
        <div className="stat">
          <div className="stat-emoji">🌍</div>
          <div className="stat-value">1</div>
          <div className="stat-label">{t.statCountries}</div>
        </div>
        <div className="stat">
          <div className="stat-emoji">🚧</div>
          <div className="stat-value">0</div>
          <div className="stat-label">{t.statBarrier}</div>
        </div>
        <div className="stat">
          <div className="stat-emoji">🧒👵</div>
          <div className="stat-value">7–97</div>
          <div className="stat-label">{t.statAges}</div>
        </div>
      </section>

      {/* Why / Differentiators */}
      <section className="section" id="why">
        <h2 className="section-title">{t.whyTitle}</h2>
        <p className="section-sub">{t.whySub}</p>
        <div className="why-grid">
          {t.why.map((item) => (
            <div className="why-card" key={item.title}>
              <div className="why-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how">
        <h2 className="section-title">{t.howTitle}</h2>
        <div className="how-row">
          {t.how.map((step, i) => (
            <div className="how-card" key={step.title}>
              <div className="how-emoji">{step.emoji}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < t.how.length - 1 && <div className="how-arrow">➡️</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Premium teaser */}
      <section className="section premium-section">
        <h2 className="section-title">{t.premiumTitle}</h2>
        <p className="section-sub">{t.premiumSub}</p>
        <div className="premium-row">
          {t.premium.map((item) => (
            <div className="premium-card" key={item.title}>
              <div className="premium-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <h2 className="section-title">{t.faqTitle}</h2>
        <div className="faq-list">
          {t.faq.map((item) => (
            <details className="faq-item" key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>{t.finalTitle}</h2>
        <p>{t.finalSub}</p>
        <Link href="/login" className="cta primary big">
          {t.finalCta}
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-links">
          <Link href="/about">{t.footerAbout}</Link>
          <Link href="/faq">{t.footerFaq}</Link>
          <Link href="/terms">{t.footerTerms}</Link>
          <Link href="/privacy">{t.footerPrivacy}</Link>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Picto 🪩🌍</p>
      </footer>

      <style jsx>{`
        .landing {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
          font-family: 'Outfit', system-ui, sans-serif;
        }

        /* Nav */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          gap: 16px;
        }
        .nav :global(.nav-logo) {
          font-size: 24px;
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
        }
        .nav-brand {
          font-size: 19px;
          letter-spacing: -0.5px;
        }
        .nav-links {
          display: flex;
          gap: 22px;
        }
        .nav-links a {
          text-decoration: none;
          color: #55556a;
          font-weight: 600;
          font-size: 14px;
        }
        .nav-links a:hover {
          color: #11121a;
        }
        .nav-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .lang-toggle {
          border: none;
          background: #fff;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          font-size: 18px;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
        }
        .nav-actions :global(.nav-cta) {
          background: #11121a;
          color: #fff;
          text-decoration: none;
          padding: 11px 20px;
          border-radius: 999px;
          font-weight: 700;
          font-size: 14px;
          white-space: nowrap;
        }

        /* Hero */
        .hero {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 40px;
          align-items: center;
          padding: 56px 0 40px;
        }
        h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(44px, 7vw, 76px);
          line-height: 1.02;
          margin: 0 0 22px;
          font-weight: 700;
          letter-spacing: -2px;
        }
        .hero-line {
          display: block;
        }
        .gradient-text {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .hero-sub {
          font-size: 19px;
          color: #4a4a5c;
          line-height: 1.65;
          margin: 0 0 28px;
          max-width: 520px;
        }
        .cta-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        .landing :global(.cta) {
          padding: 16px 28px;
          border-radius: 20px;
          font-size: 17px;
          font-weight: 800;
          text-decoration: none;
          transition: 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: inline-block;
        }
        .landing :global(.cta.primary) {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          color: white;
          box-shadow: 0 14px 34px rgba(107, 91, 255, 0.35);
        }
        .landing :global(.cta.ghost) {
          background: #fff;
          color: #333;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.07);
        }
        .landing :global(.cta:hover) {
          transform: translateY(-3px) scale(1.03);
        }
        .landing :global(.cta.big) {
          font-size: 20px;
          padding: 20px 40px;
        }
        .hero-note {
          margin: 16px 0 0;
          font-size: 13px;
          color: #9a9aad;
        }

        /* Phone mockup */
        .phone {
          background: #fff;
          border-radius: 44px;
          padding: 22px 18px;
          box-shadow: 0 40px 90px rgba(20, 10, 60, 0.18), inset 0 0 0 8px #11121a;
          display: grid;
          gap: 12px;
          position: relative;
          max-width: 340px;
          justify-self: center;
          width: 100%;
        }
        .phone-notch {
          width: 110px;
          height: 8px;
          background: #11121a;
          border-radius: 999px;
          margin: 6px auto 2px;
        }
        .phone-header {
          text-align: center;
          font-size: 22px;
        }
        .phone-card {
          background: #f8f8fd;
          border-radius: 18px;
          padding: 12px 14px;
          display: grid;
          gap: 6px;
        }
        .phone-card-top {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
        }
        .phone-caption {
          font-size: 26px;
          letter-spacing: 2px;
        }
        .phone-reactions {
          font-size: 12px;
          color: #8a8a9a;
        }
        .phone-unlock {
          text-align: center;
          background: linear-gradient(135deg, #fff7d6, #ffeff9);
          border-radius: 999px;
          padding: 8px;
          font-weight: 800;
          font-size: 15px;
        }

        /* Stats */
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 26px 0 10px;
        }
        .stat {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 24px;
          padding: 22px;
          text-align: center;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.05);
        }
        .stat-emoji {
          font-size: 30px;
        }
        .stat-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 34px;
          font-weight: 700;
          margin: 6px 0 2px;
        }
        .stat-label {
          font-size: 13px;
          color: #7a7a8c;
          font-weight: 600;
        }

        /* Sections */
        .section {
          padding: 64px 0 8px;
        }
        .section-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(28px, 4.5vw, 42px);
          margin: 0 0 10px;
          letter-spacing: -1px;
        }
        .section-sub {
          color: #6b6b7a;
          font-size: 17px;
          margin: 0 0 30px;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
        }
        .why-card {
          background: #fff;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.06);
          transition: transform 0.25s;
        }
        .why-card:hover {
          transform: translateY(-6px);
        }
        .why-emoji {
          font-size: 44px;
          margin-bottom: 14px;
        }
        .why-card h3 {
          margin: 0 0 10px;
          font-size: 21px;
        }
        .why-card p {
          margin: 0;
          color: #5c5c70;
          line-height: 1.65;
          font-size: 15px;
        }

        .how-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .how-card {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 28px;
          padding: 26px;
          text-align: center;
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .how-emoji {
          font-size: 46px;
          margin-bottom: 12px;
        }
        .how-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
        }
        .how-card p {
          margin: 0;
          color: #5c5c70;
          font-size: 14px;
          line-height: 1.6;
        }
        .how-arrow {
          position: absolute;
          right: -22px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          z-index: 1;
        }

        .premium-section {
          background: linear-gradient(135deg, rgba(255, 79, 216, 0.08), rgba(107, 91, 255, 0.08));
          border-radius: 40px;
          padding: 48px 36px;
          margin-top: 56px;
        }
        .premium-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        .premium-card {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          text-align: center;
          box-shadow: 0 10px 26px rgba(107, 91, 255, 0.12);
        }
        .premium-emoji {
          font-size: 38px;
          margin-bottom: 10px;
        }
        .premium-card h3 {
          margin: 0 0 8px;
          font-size: 17px;
        }
        .premium-card p {
          margin: 0;
          color: #6b6b7a;
          font-size: 13px;
          line-height: 1.6;
        }

        .faq-list {
          display: grid;
          gap: 12px;
          max-width: 760px;
        }
        .faq-item {
          background: #fff;
          border-radius: 20px;
          padding: 18px 22px;
          box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
        }
        .faq-item summary {
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          list-style: none;
        }
        .faq-item summary::before {
          content: '💡 ';
        }
        .faq-item p {
          margin: 12px 0 0;
          color: #5c5c70;
          line-height: 1.65;
          font-size: 14px;
        }

        .final-cta {
          text-align: center;
          padding: 90px 0 70px;
        }
        .final-cta h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(30px, 5vw, 48px);
          margin: 0 0 10px;
          letter-spacing: -1px;
        }
        .final-cta p {
          color: #6b6b7a;
          font-size: 18px;
          margin: 0 0 30px;
        }

        .footer {
          border-top: 1px solid #ececf4;
          padding: 28px 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .footer-links {
          display: flex;
          gap: 20px;
        }
        .footer-links :global(a) {
          color: #8a8a9a;
          text-decoration: none;
          font-size: 13px;
        }
        .footer-links :global(a:hover) {
          color: #11121a;
        }
        .footer-copy {
          margin: 0;
          font-size: 13px;
          color: #b0b0c0;
        }

        /* Responsive */
        @media (max-width: 860px) {
          .nav-links {
            display: none;
          }
          .hero {
            grid-template-columns: 1fr;
            padding-top: 28px;
          }
          .phone {
            order: -1;
            max-width: 300px;
          }
          .why-grid,
          .how-row,
          .premium-row {
            grid-template-columns: 1fr;
          }
          .how-arrow {
            display: none;
          }
          .stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .stat {
            padding: 14px 8px;
          }
          .stat-value {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
