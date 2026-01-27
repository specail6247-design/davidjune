
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { messaging, auth } from '../lib/firebase';
import { getToken } from 'firebase/messaging';
import { onAuthStateChanged } from 'firebase/auth';
import { SideBanner } from './components/SideBanner';
import { MissionBanner } from './components/MissionBanner';
import OnboardingGuide from './components/OnboardingGuide';
import { emojiMenus } from '../lib/emojiMenus';
import {
  emojiDataset,
  mobileOptimizedSets,
  recommendedDefaultAvatars,
} from '../lib/emojiDataset';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && messaging) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          if (token) console.log('FCM Token:', token);
        }
      } catch (error) {
        console.error('Notification permission error:', error);
      }
    };
    requestPermission();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="home-page">
      <OnboardingGuide />
      <SideBanner />
      <div className="bg-noise" />
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-4" />

      <header className="topbar">
        <div className="logo" aria-label="🪩🌍">🪩🌍</div>
        <div className="top-actions">
          <div className="status-pill">
            <span className="dot" />
            <span className="status-emoji" aria-label="🔔✨">🔔✨</span>
          </div>
          <a className="login-pill" href={authUid ? "/admin" : "/login"} aria-label="🔐">
            {authUid ? "🔐✨" : "🔐"}
          </a>
        </div>
      </header>

      {activeTab === 'home' && (
        <>
          <div id="guide-mission">
            <MissionBanner />
          </div>
          <main className="hero" id="guide-hero">
            <div className="hero-copy">
              <h1><span className="gradient-text">🎨✨🫶</span></h1>
              <p className="subhead">😊😐😢😠😱🥱</p>
              <div className="cta-row">
                <Link href="/stories" className="cta primary">🚀</Link>
                <Link href="/stories" className="cta ghost">👀</Link>
              </div>
            </div>
            <div className="hero-card">
              <div className="card-header">
                <span>🎨</span>
                <span className="chip">⚡</span>
              </div>
              <div className="swatches">
                {[...emojiDataset.energySymbols, ...emojiDataset.emotionalSymbols].slice(0, 6).map((emoji) => (
                  <div key={emoji} className="swatch">{emoji}</div>
                ))}
              </div>
              <div className="card-footer">
                <div className="signal">
                  <span className="signal-bar" />
                  <span>🔁✨</span>
                </div>
                <div className="pulse" />
              </div>
            </div>
          </main>

          <section className="ribbons">
            <div className="ribbon r-1">⚡🔥</div>
            <div className="ribbon r-2">🌴🌊</div>
            <div className="ribbon r-3">🍋✨</div>
            <div className="ribbon r-4">🌿💚</div>
          </section>

          <section className="emoji-sets">
             <EmojiBlock title="🫶🙂" items={recommendedDefaultAvatars} />
             <EmojiGrid title="🧑✨" items={mobileOptimizedSets.avatarPicker} />
             <EmojiGrid title="😊🎭" items={mobileOptimizedSets.moodPicker} />
          </section>
        </>
      )}

      {activeTab === 'explore' && (
        <section className="tab-view">
          <MissionBanner />
          <EmojiBlock title="🌍✨" items={emojiDataset.rooms} />
          <EmojiBlock title="🎯" items={emojiDataset.dailyActivitiesChallenges} />
        </section>
      )}

      {activeTab === 'friends' && (
        <section className="tab-view">
          <EmojiBlock title="🧑‍🤝‍🧑" items={[]} customContent={
              <>
                <div className="menu-row">
                    {emojiMenus.friendsMenu.filter(i => i.id !== 'slot').map(i => (
                        <button key={i.id} className="menu-button">{i.emoji}</button>
                    ))}
                </div>
                <div className="menu-slots">
                    {['⭐', '⭐', '⭐'].map((s, i) => <span key={i} className="slot-star">{s}</span>)}
                </div>
              </>
          } />
          <EmojiBlock title="🫶👋" items={mobileOptimizedSets.socialActions} />
        </section>
      )}

      {activeTab === 'profile' && (
        <section className="tab-view">
          <EmojiBlock title="🙂✨" items={recommendedDefaultAvatars} />
          <EmojiGrid title="🧑✨" items={mobileOptimizedSets.avatarPicker} />
          <EmojiBlock title="😊🎭" items={mobileOptimizedSets.moodPicker} />
        </section>
      )}

      {isCreateOpen && (
        <div className="create-sheet">
          <button className="create-close" onClick={() => setIsCreateOpen(false)}>❌</button>
          <div className="create-selection">
            <div className="selection-pill">{selectedRoom ?? '🌍'}</div>
            <div className="selection-pill">{selectedMood ?? '😊'}</div>
          </div>
          <div className="create-row">
            {emojiMenus.postCreationSteps.map((step) => (
              <button key={step.id} className="menu-button">{step.emoji}</button>
            ))}
          </div>
          <EmojiRowSelect items={emojiDataset.rooms} selected={selectedRoom} onSelect={setSelectedRoom} />
          <EmojiRowSelect items={mobileOptimizedSets.moodPicker} selected={selectedMood} onSelect={setSelectedMood} />
        </div>
      )}

      <nav className="tab-bar" id="guide-tabs">
        {emojiMenus.bottomTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setIsCreateOpen(tab.id === 'create');
            }}
          >
            {tab.emoji}
          </button>
        ))}
      </nav>
    </div>
  );
};

const EmojiBlock = ({ title, items, customContent }: { title: string, items: readonly string[], customContent?: React.ReactNode }) => (
  <div className="emoji-block">
    <p className="block-title">{title}</p>
    {customContent || (
        <div className="emoji-row">
        {items.map(emoji => <button key={emoji} className="emoji-chip">{emoji}</button>)}
        </div>
    )}
  </div>
);

const EmojiGrid = ({ title, items }: { title: string, items: readonly string[] }) => (
  <div className="emoji-block">
    <p className="block-title">{title}</p>
    <div className="emoji-grid">
      {items.map(emoji => <button key={emoji} className="emoji-tile">{emoji}</button>)}
    </div>
  </div>
);

const EmojiRowSelect = ({ items, selected, onSelect }: { items: readonly string[], selected: string | null, onSelect: (s: string) => void }) => (
    <div className="create-row">
        {items.map(emoji => (
            <button
                key={emoji}
                className={`emoji-chip ${selected === emoji ? 'selected' : ''}`}
                onClick={() => onSelect(emoji)}
            >
                {emoji}
            </button>
        ))}
    </div>
);

export default HomePage;
