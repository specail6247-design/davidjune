'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EmojiTabBar } from './EmojiTabBar';
import { WelcomeTour } from './WelcomeTour';
import { useAuth } from '../../lib/AuthContext';

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const { user, loading } = useAuth();
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <div className="app-shell">
      <WelcomeTour forceOpen={tourOpen || undefined} onClose={() => setTourOpen(false)} />
      <header className="app-topbar">
        <Link href="/" className="shell-logo" aria-label="EmojiWorld home">
          🪩🌍
        </Link>
        <div className="topbar-actions">
          <button className="help-btn" onClick={() => setTourOpen(true)} aria-label="guide">
            ❓
          </button>
          {!loading && (
            <Link href={user ? '/app/profile' : '/login'} className="auth-pill">
              {user ? (user.isAnonymous ? '🎈' : '🙂') : '🔐'}
            </Link>
          )}
        </div>
      </header>
      <main className="app-content">{children}</main>
      <EmojiTabBar />
      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          background: radial-gradient(circle at top, #fff1f7 0%, #f2f4ff 45%, #f8fffd 100%);
          padding: max(12px, env(safe-area-inset-top)) 16px
            calc(24px + env(safe-area-inset-bottom));
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 640px;
          margin: 0 auto;
        }
        .app-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .app-topbar :global(.shell-logo) {
          font-size: 26px;
          text-decoration: none;
        }
        .topbar-actions {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .help-btn {
          border: none;
          background: rgba(255, 255, 255, 0.9);
          width: 42px;
          height: 42px;
          border-radius: 999px;
          font-size: 17px;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
        }
        .topbar-actions :global(.auth-pill) {
          background: rgba(255, 255, 255, 0.9);
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: 19px;
          text-decoration: none;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
        }
        .app-content {
          flex: 1;
          display: grid;
          gap: 16px;
          align-content: start;
        }
        :global(:root) {
          --emoji-size: 32px;
        }
      `}</style>
    </div>
  );
};
