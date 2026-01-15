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

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/' });
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
              className="google-btn" 
              onClick={handleGoogleSignIn}
              aria-label="Sign in with Google"
            >
              <svg height="20" width="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
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
        .google-btn, .github-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid #e1e1ef;
        }
        .google-btn {
          background: white;
          color: #3c4043;
        }
        .github-btn {
          background: #24292e;
          color: white;
          border: none;
        }
        .google-btn:hover, .github-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .github-btn:hover {
          background: #1b1f23;
        }
        .google-btn:hover {
          background: #f8f9fa;
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
