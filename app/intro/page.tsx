'use client';

import Link from 'next/link';

const IntroPage = () => {
  return (
    <div className="intro">
      <header className="hero">
        <div className="hero-emoji">🪩🌍</div>
        <h1>Picto 사용 방법</h1>
        <p>이 앱은 이모지로만 소통합니다. 텍스트는 안내용으로만 보여요.</p>
        <div className="hero-actions">
          <Link className="cta" href="/app/feed">
            시작하기
          </Link>
          <Link className="ghost" href="/login">
            로그인
          </Link>
        </div>
      </header>

      <section className="grid">
        <div className="card">
          <div className="card-emoji">🏠</div>
          <h2>피드 보기</h2>
          <p>하단 탭에서 🏠을 누르면 최신 이모지 포스트를 볼 수 있어요.</p>
        </div>
        <div className="card">
          <div className="card-emoji">➕</div>
          <h2>포스트 만들기</h2>
          <p>➕에서 방/기분/캡션을 선택하고 📸로 사진을 추가해요.</p>
        </div>
        <div className="card">
          <div className="card-emoji">🎯</div>
          <h2>미션 완료</h2>
          <p>배너를 탭하면 바로 업로드. 완료하면 ✅ 또는 📸✅가 떠요.</p>
        </div>
        <div className="card">
          <div className="card-emoji">🫶</div>
          <h2>친구</h2>
          <p>🫶에서 연결/요청을 확인하고 ⭐ 슬롯을 늘릴 수 있어요.</p>
        </div>
      </section>

      <section className="steps">
        <div className="step">
          <span className="step-emoji">1️⃣</span>
          <div>
            <h3>이모지 선택</h3>
            <p>모든 입력은 이모지로만 선택합니다.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-emoji">2️⃣</span>
          <div>
            <h3>사진 업로드</h3>
            <p>미션 또는 포스트에서 📸로 사진을 올릴 수 있어요.</p>
          </div>
        </div>
        <div className="step">
          <span className="step-emoji">3️⃣</span>
          <div>
            <h3>랭킹 확인</h3>
            <p>🎯에서 오늘/이번 주 랭킹을 ⭐로 확인해요.</p>
          </div>
        </div>
      </section>
      <section className="links">
        <Link className="link-card" href="/privacy">
          개인정보 처리방침
        </Link>
        <Link className="link-card" href="/terms">
          이용약관
        </Link>
        <Link className="link-card" href="/adsense">
          광고 및 정책 안내
        </Link>
        <Link className="link-card" href="/faq">
          FAQ
        </Link>
        <Link className="link-card" href="/safety">
          신고/차단 안내
        </Link>
        <Link className="link-card" href="/privacy/en">
          Privacy (EN)
        </Link>
        <Link className="link-card" href="/terms/en">
          Terms (EN)
        </Link>
        <Link className="link-card" href="/adsense/en">
          Ads Policy (EN)
        </Link>
      </section>

      <style jsx>{`
        .intro {
          padding: 28px;
          display: grid;
          gap: 32px;
          background: radial-gradient(circle at top, #fff1f7 0%, #f2f4ff 50%, #f8fffd 100%);
          min-height: 100vh;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .hero {
          background: #fff;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          display: grid;
          gap: 12px;
        }
        .hero-emoji {
          font-size: 40px;
        }
        h1 {
          margin: 0;
          font-size: 28px;
        }
        p {
          margin: 0;
          color: #4b4b5a;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cta,
        .ghost {
          padding: 10px 16px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
        }
        .cta {
          background: #6b5bff;
          color: #fff;
        }
        .ghost {
          border: 1px solid #e1e1ef;
          color: #11121a;
        }
        .grid {
          display: grid;
          gap: 16px;
        }
        .card {
          background: #fff;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 8px;
        }
        .card-emoji {
          font-size: 28px;
        }
        h2 {
          margin: 0;
          font-size: 20px;
        }
        .steps {
          display: grid;
          gap: 12px;
        }
        .links {
          display: grid;
          gap: 12px;
        }
        .link-card {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          text-decoration: none;
          color: #11121a;
          font-weight: 600;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        .step {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 12px;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
        }
        .step-emoji {
          font-size: 20px;
        }
        h3 {
          margin: 0;
          font-size: 18px;
        }
      `}</style>
    </div>
  );
};

export default IntroPage;
