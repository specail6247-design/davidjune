'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, friendlyAuthError } from '../../lib/AuthContext';
import { ensureUserProfile } from '../../lib/userProfilesClient';

const LoginPage = () => {
  const { user, loading, signInGuest, signInGoogle, signOutUser } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState<'guest' | 'google' | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      router.replace('/app/feed');
    }
  }, [user, loading, router]);

  const handleGuest = async () => {
    setBusy('guest');
    setError('');
    try {
      const guest = await signInGuest();
      await ensureUserProfile(guest.uid);
      router.replace('/app/feed');
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(null);
    }
  };

  const handleGoogle = async () => {
    setBusy('google');
    setError('');
    try {
      const googleUser = await signInGoogle();
      await ensureUserProfile(googleUser.uid);
      router.replace('/app/feed');
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(null);
    }
  };

  return (
    <div className="login-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="login-card">
        <div className="top-links">
          <Link className="skip" href="/" aria-label="🏠">
            🏠
          </Link>
        </div>

        <div className="emoji-title">🪩🌍</div>
        <h1 className="brand">Picto</h1>
        <p className="welcome-text">
          No words. Just emoji. ✨
          <br />
          이모지로 전 세계와 대화해요!
        </p>

        {user ? (
          <>
            <div className="login-meta">
              <div className="emoji-tag">✅ {user.isAnonymous ? '🎈 Guest' : user.name}</div>
            </div>
            <button className="big-btn primary" onClick={() => router.push('/app/feed')}>
              🚀 입장하기 · Enter
            </button>
            <button className="text-btn" onClick={() => signOutUser()}>
              🚪 로그아웃 · Sign out
            </button>
          </>
        ) : (
          <>
            <button
              className="big-btn primary"
              onClick={handleGuest}
              disabled={busy !== null}
              aria-label="Start as guest"
            >
              {busy === 'guest' ? '⏳...' : '🎈 3초만에 시작하기 · Start now'}
            </button>
            <div className="divider">
              <span>or</span>
            </div>
            <button
              className="google-btn"
              onClick={handleGoogle}
              disabled={busy !== null}
              aria-label="Sign in with Google"
            >
              <svg height="20" width="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{busy === 'google' ? '⏳...' : 'Google로 계속하기'}</span>
            </button>
            <p className="guest-note">
              🎈 게스트는 가입 없이 바로 시작! 나중에 Google 계정으로 이어갈 수 있어요.
            </p>
          </>
        )}

        {error && <div className="error-box">{error}</div>}
      </div>
      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, #fff1f7 0%, #f2f4ff 50%, #f8fffd 100%);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .login-card {
          width: min(420px, 92vw);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(12px);
          padding: 30px 26px;
          border-radius: 28px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          display: grid;
          gap: 14px;
          position: relative;
          z-index: 1;
        }
        .emoji-title {
          font-size: 52px;
          text-align: center;
          line-height: 1;
        }
        .brand {
          margin: 0;
          text-align: center;
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .welcome-text {
          text-align: center;
          color: #6b6b7a;
          margin: 0 0 6px;
          line-height: 1.6;
        }
        .top-links :global(.skip) {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          text-decoration: none;
          background: #f4f4fb;
          font-size: 20px;
        }
        .top-links {
          display: flex;
          gap: 10px;
          justify-self: end;
        }
        .emoji-tag {
          font-size: 20px;
          text-align: center;
        }
        .big-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px 24px;
          border-radius: 16px;
          font-size: 17px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
          font-family: inherit;
        }
        .big-btn.primary {
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
          box-shadow: 0 12px 28px rgba(107, 91, 255, 0.35);
        }
        .big-btn.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 32px rgba(107, 91, 255, 0.45);
        }
        .big-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #b3b3c2;
          font-size: 12px;
        }
        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8e8f2;
        }
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          border-radius: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e1e1ef;
          background: white;
          color: #3c4043;
          font-family: inherit;
        }
        .google-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
          background: #f8f9fa;
        }
        .google-btn:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        .guest-note {
          margin: 4px 0 0;
          font-size: 12px;
          color: #9a9aad;
          text-align: center;
          line-height: 1.6;
        }
        .text-btn {
          border: none;
          background: transparent;
          color: #6b6b7a;
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
          font-family: inherit;
        }
        .error-box {
          background: #fff2f5;
          border: 1px solid #ffd6e0;
          color: #b0455b;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13px;
          text-align: center;
          line-height: 1.5;
        }
        .login-meta {
          display: grid;
          gap: 6px;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
