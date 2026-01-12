'use client';

import Link from 'next/link';

const TermsPage = () => {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">이용약관</div>
      </header>
      <section className="card">
        <h2>서비스 개요</h2>
        <p>EmojiWorld는 이모지로만 소통하는 글로벌 소셜 앱입니다.</p>
      </section>
      <section className="card">
        <h2>계정 및 책임</h2>
        <ul>
          <li>사용자는 계정 보안에 대한 책임이 있습니다.</li>
          <li>타인의 권리를 침해하는 행위는 금지됩니다.</li>
          <li>부정 사용이 확인되면 서비스 이용이 제한될 수 있습니다.</li>
        </ul>
      </section>
      <section className="card">
        <h2>콘텐츠 정책</h2>
        <ul>
          <li>혐오, 차별, 폭력, 불법을 조장하는 콘텐츠는 금지됩니다.</li>
          <li>저작권을 침해하는 콘텐츠는 삭제될 수 있습니다.</li>
          <li>커뮤니티 안전을 위한 신고/차단 기능이 제공됩니다.</li>
        </ul>
      </section>
      <section className="card">
        <h2>결제 및 구독</h2>
        <ul>
          <li>결제 상품은 이모지 기반 기능 해제에 한정됩니다.</li>
          <li>실제 개인정보 공개나 인증을 의미하지 않습니다.</li>
          <li>환불 및 해지 정책은 결제 제공사의 기준을 따릅니다.</li>
        </ul>
      </section>
      <section className="card">
        <h2>변경 및 종료</h2>
        <p>서비스 정책은 필요 시 사전 고지 후 변경될 수 있습니다.</p>
      </section>
      <footer className="footer">
        <p>문의: 운영팀</p>
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
        h2 {
          margin: 0;
          font-size: 16px;
        }
        p,
        li {
          margin: 0;
          font-size: 13px;
          color: #4b4b5a;
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

export default TermsPage;
