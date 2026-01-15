'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Languages, LogIn, LogOut, ChevronRight, User } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', emoji: '🇺🇸' },
  { code: 'ko', name: '한국어', emoji: '🇰🇷' },
  { code: 'ja', name: '日本語', emoji: '🇯🇵' },
  { code: 'zh', name: '中文', emoji: '🇨🇳' },
];

export function SideBanner() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[1]); // Default to Korean

  return (
    <div className="side-banner">
      <div className="banner-content">
        {/* Auth Section */}
        <div className="banner-item auth">
          {session ? (
            <div className="user-profile" onClick={() => signOut()}>
              <div className="avatar-wrapper">
                {session.user?.image ? (
                  <img src={session.user.image} alt="avatar" />
                ) : (
                  <div className="emoji-avatar">✨</div>
                )}
              </div>
              <span className="banner-text">Logout</span>
              <LogOut size={18} />
            </div>
          ) : (
            <div className="login-trigger" onClick={() => signIn()}>
              <LogIn size={20} />
              <span className="banner-text">Login</span>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          className="banner-item theme-toggle" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          <span className="banner-text">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        {/* Language Selector */}
        <div className="banner-item language">
          <button className="lang-trigger" onClick={() => setLangOpen(!langOpen)}>
            <Languages size={20} />
            <span className="banner-text">{currentLang.emoji}</span>
          </button>
          
          {langOpen && (
            <div className="lang-dropdown">
              {languages.map((lang) => (
                <button 
                  key={lang.code} 
                  className={`lang-option ${currentLang.code === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentLang(lang);
                    setLangOpen(false);
                  }}
                >
                  <span className="lang-emoji">{lang.emoji}</span>
                  <span className="lang-name">{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .side-banner {
          position: fixed;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 1000;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 30px;
          padding: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .side-banner:hover {
          background: rgba(255, 255, 255, 0.6);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .banner-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
          align-items: center;
        }

        .banner-item {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          color: #444;
        }

        .banner-item:hover {
          background: rgba(255, 255, 255, 0.8);
          transform: scale(1.1);
          color: #000;
        }

        .banner-text {
          position: absolute;
          right: 100%;
          margin-right: 15px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: all 0.2s;
          transform: translateX(10px);
        }

        .banner-item:hover .banner-text {
          opacity: 1;
          transform: translateX(0);
        }

        .avatar-wrapper {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .avatar-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lang-dropdown {
          position: absolute;
          right: 55px;
          top: 0;
          background: white;
          border-radius: 16px;
          padding: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 120px;
          animation: slideIn 0.2s ease;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          border: none;
          background: none;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .lang-option:hover {
          background: #f4f4f4;
        }

        .lang-option.active {
          background: #6b5bff20;
          color: #6b5bff;
        }

        .lang-emoji {
          font-size: 18px;
        }

        .lang-name {
          font-size: 14px;
          font-weight: 500;
        }

        button {
          border: none;
          background: none;
          padding: 0;
          cursor: pointer;
          color: inherit;
        }

        :global(.dark) .side-banner {
          background: rgba(30, 30, 40, 0.4);
          border-color: rgba(255, 255, 255, 0.1);
          color: #eee;
        }
        
        :global(.dark) .banner-item {
          color: #aaa;
        }
        
        :global(.dark) .banner-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        :global(.dark) .lang-dropdown {
          background: #1e1e28;
          color: #eee;
        }

        :global(.dark) .lang-option:hover {
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
