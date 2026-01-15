'use client';

import Link from 'next/link';

export default function AdsenseEnPage() {
  return (
    <div className="page">
      <header className="header">
        <Link className="nav" href="/intro">
          ←
        </Link>
        <div className="title">Ads & Policy (EN)</div>
      </header>

      <section className="card notice">
        <h2>Ads Transparency</h2>
        <p>
          EmojiWorld may display ads to support the service. Ads are shown with clear separation from
          content and do not expose real personal data.
        </p>
      </section>

      <section className="card">
        <h2>Content Standards</h2>
        <ul>
          <li>No harmful, deceptive, or illegal content.</li>
          <li>No hate, violence, or discrimination.</li>
          <li>No clickbait or disguised clicks.</li>
          <li>No copyright infringement.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Ad Placement</h2>
        <ul>
          <li>Ads are clearly labeled and separated from content.</li>
          <li>No accidental click patterns or forced interactions.</li>
          <li>Core features remain usable without ads.</li>
        </ul>
      </section>

      <section className="card">
        <h2>Trust</h2>
        <p>
          EmojiWorld does not claim identity verification or endorsement. All insights are activity-based
          and symbolic.
        </p>
      </section>

      <footer className="footer">
        <p>Policies may be updated as the service evolves.</p>
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
}
