'use client';

import Link from 'next/link';

export default function PrivacyEnPage() {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">Privacy Policy (EN)</div>
      </header>
      <section className="card">
        <h2>Core Principles</h2>
        <p>EmojiWorld does not collect or reveal real personal identity data.</p>
        <ul>
          <li>No real names, phone numbers, or precise locations are collected.</li>
          <li>Email is used only for login and is never shown to users.</li>
          <li>All visible details are emoji-activity based.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Collected Data</h2>
        <ul>
          <li>Account identifier (UID)</li>
          <li>In-app emoji activity (missions, posts, reactions)</li>
          <li>Device/access data for service operation</li>
        </ul>
      </section>
      <section className="card">
        <h2>Purpose</h2>
        <ul>
          <li>Service delivery and operations</li>
          <li>Security and abuse prevention</li>
          <li>Emoji-based personalization</li>
        </ul>
      </section>
      <section className="card">
        <h2>Retention</h2>
        <p>Data is kept only as needed for service purposes and then safely removed.</p>
      </section>
      <footer className="footer">
        <p>Contact: Ops team</p>
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
}
