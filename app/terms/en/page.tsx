'use client';

import Link from 'next/link';

export default function TermsEnPage() {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">Terms of Service (EN)</div>
      </header>
      <section className="card">
        <h2>Service</h2>
        <p>EmojiWorld is an emoji-first social app.</p>
      </section>
      <section className="card">
        <h2>Account</h2>
        <ul>
          <li>You are responsible for your account security.</li>
          <li>Abuse may lead to restrictions or removal.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Content</h2>
        <ul>
          <li>Hate, harassment, violence, and illegal content are prohibited.</li>
          <li>Copyright violations may be removed.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Payments</h2>
        <ul>
          <li>Payments unlock emoji-based features only.</li>
          <li>No real identity or personal data is revealed.</li>
          <li>Refunds follow the payment provider policy.</li>
        </ul>
      </section>
      <section className="card">
        <h2>Changes</h2>
        <p>Policies may change with notice as needed.</p>
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
