'use client';

import Link from 'next/link';

const SafetyPage = () => {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">신고 및 차단 안내</div>
      </header>

      <section className="card">
        <h2>신고</h2>
        <ul>
          <li>유해, 불법, 혐오, 폭력성 콘텐츠를 발견하면 신고할 수 있습니다.</li>
          <li>신고된 콘텐츠는 운영 정책에 따라 검토됩니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>차단</h2>
        <ul>
          <li>원치 않는 상호작용을 차단할 수 있습니다.</li>
          <li>차단한 사용자와의 상호작용은 제한됩니다.</li>
        </ul>
      </section>

      <section className="card">
        <h2>제한 조치</h2>
        <ul>
          <li>정책 위반 시 콘텐츠가 삭제될 수 있습니다.</li>
          <li>반복 위반 시 계정 이용이 제한될 수 있습니다.</li>
        </ul>
      </section>

      <footer className="footer">
        <p>신고/차단 기능은 커뮤니티 안전을 위한 장치입니다.</p>
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

export default SafetyPage;
