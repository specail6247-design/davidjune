'use client';

import { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[1]); // Default to Korean

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

    </div>
  );
}
