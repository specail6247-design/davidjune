'use client';

import Link from 'next/link';

const AboutPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/" className="back-link">
          ←
        </Link>
        <h1>About EmojiWorld</h1>
      </header>
      <main className="content">
        <section>
          <h2>What is EmojiWorld?</h2>
          <p>
            EmojiWorld is a new social media platform where you can express your daily life and emotions using only emojis. We aim to provide a fun and joyful communication experience by maximizing the intuitive and emotional expression of emojis, moving away from text-oriented communication.
          </p>
        </section>
        <section>
          <h2>Our Vision</h2>
          <p>
            In a world overflowing with complex text, we dream of a space where you can communicate your feelings more directly and intuitively. EmojiWorld is the beginning of that dream. It's a space to purely share emotions, laugh, and empathize with just one emoji, without the need for lengthy explanations.
          </p>
        </section>
        <section>
          <h2>Key Features</h2>
          <ul>
            <li>
              <strong>Emoji-Only Feed:</strong> Share your day with a combination of emojis that best represent you and your mood.
            </li>
            <li>
              <strong>Real-time Reactions:</strong> See how friends react to your posts in real-time.
            </li>
            <li>
              <strong>Missions & Rankings:</strong> Participate in fun daily missions and compete with other users!
            </li>
          </ul>
        </section>
      </main>

      <style jsx>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          color: #333;
        }
        .page-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 40px;
        }
        .back-link {
            font-size: 24px;
            color: #333;
            text-decoration: none;
        }
        h1 {
          font-size: 36px;
          font-weight: 700;
          color: #000;
        }
        h2 {
          font-size: 24px;
          font-weight: 600;
          margin-top: 40px;
          margin-bottom: 16px;
          border-bottom: 2px solid var(--lime);
          padding-bottom: 8px;
        }
        p, ul {
          font-size: 16px;
          line-height: 1.8;
        }
        ul {
            list-style-position: inside;
            padding-left: 0;
        }
        li {
            margin-bottom: 12px;
        }
        strong {
            font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
