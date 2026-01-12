'use client';

import Link from 'next/link';

const FaqPage = () => {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">FAQ</div>
      </header>

      <section className="card">
        <h2>광고</h2>
        <ul>
          <li>광고와 콘텐츠는 명확히 구분됩니다.</li>
          <li>사용자의 의도치 않은 클릭을 유도하지 않습니다.</li>
          <li>광고는 앱 경험을 해치지 않도록 배치됩니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>결제</h2>
        <ul>
          <li>결제는 이모지 기반 기능 해제에만 적용됩니다.</li>
          <li>실제 개인정보 공개나 인증을 의미하지 않습니다.</li>
          <li>구독 해지/변경은 결제 제공사 정책을 따릅니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>개인정보</h2>
        <ul>
          <li>실명/전화번호/정확한 위치는 수집하지 않습니다.</li>
          <li>이메일은 로그인 용도이며 공개되지 않습니다.</li>
          <li>이모지 활동 정보만 표시됩니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>안전</h2>
        <ul>
          <li>신고/차단 기능이 제공됩니다.</li>
          <li>정책 위반 콘텐츠는 제한될 수 있습니다.</li>
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
        h2 {
          margin: 0;
          font-size: 16px;
        }
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

export default FaqPage;
