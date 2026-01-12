'use client';

import Link from 'next/link';

const AdsensePage = () => {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">광고 및 정책 안내</div>
      </header>

      <section className="card notice">
        <h2>광고 관련 안내</h2>
        <p>
          EmojiWorld는 광고를 통해 운영될 수 있습니다. 광고는 정책에 따라 표시되며, 개인정보를
          이용한 맞춤형 타겟팅은 최소화합니다.
        </p>
      </section>

      <section className="card">
        <h2>콘텐츠 원칙</h2>
        <ul>
          <li>사용자에게 유해하거나 오해를 유발하는 콘텐츠를 제한합니다.</li>
          <li>폭력, 혐오, 차별, 불법 행위를 조장하는 콘텐츠를 허용하지 않습니다.</li>
          <li>클릭을 유도하는 과장된 문구나 위장된 동작을 금지합니다.</li>
          <li>자동 생성/복제 콘텐츠는 운영 정책에 따라 제한됩니다.</li>
          <li>저작권을 침해하는 콘텐츠는 업로드할 수 없습니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>광고 배치 원칙</h2>
        <ul>
          <li>콘텐츠와 광고를 명확히 구분합니다.</li>
          <li>사용자의 의도치 않은 클릭을 유도하지 않습니다.</li>
          <li>광고는 사용자 경험을 해치지 않도록 배치합니다.</li>
          <li>광고 로딩 실패 시에도 핵심 기능은 정상 동작합니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>투명성</h2>
        <p>
          EmojiWorld는 실제 신원 확인, 인증, 승인과 같은 표현을 사용하지 않습니다. 모든 정보는
          이모지 활동 기반의 상징적 정보입니다.
        </p>
      </section>

      <section className="card">
        <h2>사용자 보호</h2>
        <ul>
          <li>신고/차단 기능은 커뮤니티 안전을 위해 제공됩니다.</li>
          <li>정책 위반 콘텐츠는 검토 후 제한될 수 있습니다.</li>
          <li>광고 관련 불만은 내부 절차에 따라 처리합니다.</li>
        </ul>
      </section>

      <footer className="footer">
        <p>정책은 서비스 운영 환경에 따라 업데이트될 수 있습니다.</p>
      </footer>

      <style jsx>{`
        .page {
          padding: 24px;
          display: grid;
          gap: 16px;
          background: #f6f6fb;
          min-height: 100vh;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .nav {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #fff;
          display: grid;
          place-items: center;
          text-decoration: none;
          color: #11121a;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }
        .title {
          font-weight: 700;
          font-size: 18px;
        }
        .card {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 10px;
        }
        .notice {
          background: #11121a;
          color: #fff;
        }
        h2 {
          margin: 0;
          font-size: 16px;
        }
        p,
        li {
          margin: 0;
          font-size: 13px;
          color: inherit;
        }
        ul {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 6px;
        }
        .footer {
          font-size: 12px;
          color: #6b6b7a;
        }
      `}</style>
    </div>
  );
};

export default AdsensePage;
