'use client';

import Link from 'next/link';

const PrivacyPage = () => {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">개인정보 처리방침</div>
      </header>
      <section className="card">
        <h2>핵심 원칙</h2>
        <p>EmojiWorld는 개인을 식별할 수 있는 정보를 수집하거나 공개하지 않습니다.</p>
        <ul>
          <li>실명, 전화번호, 주소, 정확한 위치 정보는 수집하지 않습니다.</li>
          <li>이메일은 로그인 용도로만 사용되며, 사용자에게 노출되지 않습니다.</li>
          <li>모든 공개 정보는 이모지 활동 기반의 상징적 정보입니다.</li>
        </ul>
      </section>
      <section className="card">
        <h2>수집 항목</h2>
        <ul>
          <li>계정 식별자(UID)</li>
          <li>앱 내 이모지 활동(미션, 포스트, 반응)</li>
          <li>디바이스 및 접속 정보(서비스 운영 목적)</li>
        </ul>
      </section>
      <section className="card">
        <h2>쿠키 및 유사 기술</h2>
        <p>서비스 안정성과 보안을 위해 쿠키/로컬 스토리지를 사용할 수 있습니다.</p>
      </section>
      <section className="card">
        <h2>이용 목적</h2>
        <ul>
          <li>서비스 제공 및 운영</li>
          <li>보안 및 부정 사용 방지</li>
          <li>맞춤형 이모지 경험 제공</li>
        </ul>
      </section>
      <section className="card">
        <h2>제3자 서비스</h2>
        <p>Firebase 및 결제/분석 서비스가 운영 목적에 한해 사용될 수 있습니다.</p>
      </section>
      <section className="card">
        <h2>보관 및 파기</h2>
        <p>서비스 목적 달성 후 필요한 범위 내에서 안전하게 삭제합니다.</p>
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

export default PrivacyPage;
