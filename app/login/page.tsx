'use client';

import { useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to home if already logged in
  useEffect(() => {
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const handleGitHubSignIn = async () => {
    await signIn('github', { callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="login-shell">
        <div className="login-card">
          <div className="emoji-title">⏳</div>
          <div className="muted">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="top-links">
          <a className="skip" href="/intro" aria-label="📣">
            📣
          </a>
          <a className="skip" href="/" aria-label="🏠">
            🏠
          </a>
        </div>
        {session ? (
          <>
            <div className="login-meta">
              <div className="emoji-tag">✅✨</div>
              <div className="muted">{session.user.email ?? 'no-email'}</div>
              <div className="muted">{session.user.name ?? 'no-name'}</div>
            </div>
            <button className="emoji-btn primary" onClick={() => signOut()} aria-label="🚪">
              🚪
            </button>
          </>
        ) : (
          <>
            <div className="emoji-title">🔐✨</div>
            <p className="welcome-text">Welcome to EmojiWorld!</p>
            <button 
              className="github-btn" 
              onClick={handleGitHubSignIn}
              aria-label="Sign in with GitHub"
            >
              <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              <span>Sign in with GitHub</span>
            </button>
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
          text-align: center;
        }
        .welcome-text {
          text-align: center;
          color: #6b6b7a;
          margin: 0;
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
        .github-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          background: #24292e;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .github-btn:hover {
          background: #1b1f23;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
        .login-meta {
          display: grid;
          gap: 6px;
        }
        .muted {
          font-size: 12px;
          color: #6b6b7a;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
