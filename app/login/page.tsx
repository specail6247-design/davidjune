'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from '../../lib/authClient';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userInfo, setUserInfo] = useState<{ uid: string; email: string | null } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setUserInfo(null);
        return;
      }
      setUserInfo({ uid: user.uid, email: user.email });
    });
    return () => unsubscribe();
  }, []);

  const handleEmailSignIn = async () => {
    setBusy(true);
    try {
      await signInWithEmail(email, password);
    } finally {
      setBusy(false);
    }
  };

  const handleEmailSignUp = async () => {
    setBusy(true);
    try {
      await signUpWithEmail(email, password);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } finally {
      setBusy(false);
    }
  };

  const handleApple = async () => {
    setBusy(true);
    try {
      await signInWithApple();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="top-links">
          <a className="skip" href="/intro" aria-label="📣">
            📣
          </a>
          <a className="skip" href="/app/feed" aria-label="🏠">
            🏠
          </a>
        </div>
        {userInfo ? (
          <>
            <div className="login-meta">
              <div className="emoji-tag">✅✨</div>
              <div className="muted">{userInfo.email ?? 'no-email'}</div>
              <div className="muted">{userInfo.uid}</div>
            </div>
            <button className="emoji-btn primary" onClick={() => signOutUser()} aria-label="🚪">
              🚪
            </button>
          </>
        ) : (
          <>
            <div className="emoji-title">🔐✨</div>
            <input
              className="input"
              type="email"
              placeholder="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              className="input"
              type="password"
              placeholder="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="row">
              <button className="emoji-btn primary" disabled={busy} onClick={handleEmailSignIn} aria-label="📥">
                📥
              </button>
              <button className="emoji-btn secondary" disabled={busy} onClick={handleEmailSignUp} aria-label="🆕">
                🆕
              </button>
            </div>
            <div className="row">
              <button className="emoji-btn ghost" disabled={busy} onClick={handleGoogle} aria-label="G">
                G
              </button>
              <button className="emoji-btn ghost" disabled={busy} onClick={handleApple} aria-label="A">
                A
              </button>
            </div>
          </>
        )}
      </div>
      <style jsx>{`
        .login-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: radial-gradient(circle at top, #fff1f7 0%, #f2f4ff 50%, #f8fffd 100%);
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .login-card {
          width: min(420px, 92vw);
          background: rgba(255, 255, 255, 0.9);
          padding: 26px;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
          display: grid;
          gap: 14px;
        }
        .emoji-title {
          font-size: 32px;
        }
        .skip {
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
          font-size: 22px;
        }
        .input {
          padding: 12px 14px;
          border: 1px solid #e1e1ef;
          border-radius: 12px;
          font-size: 14px;
        }
        .row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .emoji-btn {
          border: none;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          cursor: pointer;
          font-size: 22px;
          display: grid;
          place-items: center;
        }
        .emoji-btn.primary {
          background: #6b5bff;
          color: #fff;
        }
        .emoji-btn.secondary {
          background: #11121a;
          color: #fff;
        }
        .emoji-btn.ghost {
          background: #fff;
          border: 1px solid #e1e1ef;
        }
        .login-meta {
          display: grid;
          gap: 6px;
        }
        .muted {
          font-size: 12px;
          color: #6b6b7a;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
