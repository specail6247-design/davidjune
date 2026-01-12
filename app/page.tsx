'use client';

import { useEffect, useState } from 'react';
import { messaging } from '../lib/firebase'; // Adjust path as needed
import { getToken } from 'firebase/messaging';
import {
  emojiDataset,
  mobileOptimizedSets,
  recommendedDefaultAvatars,
} from '../lib/emojiDataset';
import { emojiMenus } from '../lib/emojiMenus';
import { MissionBanner } from './components/MissionBanner';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [authUid, setAuthUid] = useState<string | null>(null);

  useEffect(() => {
    // Function to request notification permission and get FCM token
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          // Get the FCM token
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Your VAPID key
          });

          if (token) {
            console.log('FCM Token:', token);
            // You can now send this token to your server to send notifications
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while requesting permission ', error);
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
    <div className="page">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-orb orb-3" />

      <header className="topbar">
        <div className="logo" aria-label="🪩🌍">
          🪩🌍
        </div>
        <div className="top-actions">
          <div className="status-pill">
            <span className="dot" />
            <span className="status-emoji" aria-label="🔔✨">
              🔔✨
            </span>
          </div>
          {authUid ? (
            <a className="login-pill" href="/admin" aria-label="🔐✨">
              🔐✨
            </a>
          ) : (
            <a className="login-pill" href="/login" aria-label="🔐">
              🔐
            </a>
          )}
        </div>
      </header>

      {activeTab === 'home' && (
        <>
          <MissionBanner />
          <main className="hero">
            <div className="hero-copy">
              <h1>
                <span className="gradient-text" aria-label="🎨✨">
                  🎨✨🫶
                </span>
              </h1>
              <p className="subhead" aria-label="😊😐😢😠😱🥱">
                😊😐😢😠😱🥱
              </p>
              <div className="cta-row">
                <button className="cta primary" aria-label="🚀">
                  🚀
                </button>
                <button className="cta ghost" aria-label="👀">
                  👀
                </button>
              </div>
            </div>
            <div className="hero-card">
              <div className="card-header">
                <span aria-label="🎨">🎨</span>
                <span className="chip" aria-label="⚡">
                  ⚡
                </span>
              </div>
              <div className="swatches">
                {emojiDataset.energySymbols.concat(emojiDataset.emotionalSymbols).slice(0, 6).map((emoji) => (
                  <div key={emoji} className="swatch">
                    {emoji}
                  </div>
                ))}
              </div>
              <div className="card-footer">
                <div className="signal">
                  <span className="signal-bar" />
                  <span aria-label="🔁✨">🔁✨</span>
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

          <section className="menu-showcase" aria-label="🧭✨">
            <div className="menu-card">
              <div className="menu-row">
                {emojiMenus.topActions.map((action) => (
                  <button key={action.id} className="menu-button" aria-label={action.emoji}>
                    {action.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-card">
              <div className="menu-stepper">
                {emojiMenus.postCreationSteps.map((step, index) => (
                  <div key={step.id} className="menu-step">
                    <button className="menu-button" aria-label={step.emoji}>
                      {step.emoji}
                    </button>
                    {index < emojiMenus.postCreationSteps.length - 1 && <span className="menu-dot" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="menu-card">
              <div className="menu-row">
                {emojiMenus.friendsMenu
                  .filter((item) => item.id !== 'slot')
                  .map((item) => (
                    <button key={item.id} className="menu-button" aria-label={item.emoji}>
                      {item.emoji}
                    </button>
                  ))}
              </div>
              <div className="menu-slots">
                {['⭐', '⭐', '⭐'].map((star, index) => (
                  <span key={`${star}-${index}`} className="slot-star">
                    {star}
                  </span>
                ))}
              </div>
            </div>

            <div className="menu-card">
              <div className="menu-row">
                {emojiMenus.reactions.map((emoji) => (
                  <button key={emoji} className="menu-button" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="menu-card">
              <div className="menu-row">
                {emojiMenus.shareGrowth.map((item) => (
                  <button key={item.id} className="menu-button" aria-label={item.emoji}>
                    {item.emoji}
                  </button>
                ))}
              </div>
              <div className="menu-row">
                {emojiMenus.systemSafety.map((item) => (
                  <button key={item.id} className="menu-button" aria-label={item.emoji}>
                    {item.emoji}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="emoji-sets">
            <div className="emoji-block">
              <p className="block-title" aria-label="🫶🙂">
                🫶🙂
              </p>
              <div className="emoji-row">
                {recommendedDefaultAvatars.map((emoji) => (
                  <button key={emoji} className="emoji-chip" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="🧑✨">
                🧑✨
              </p>
              <div className="emoji-grid">
                {mobileOptimizedSets.avatarPicker.map((emoji) => (
                  <button key={emoji} className="emoji-tile" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="😊🎭">
                😊🎭
              </p>
              <div className="emoji-grid">
                {mobileOptimizedSets.moodPicker.map((emoji) => (
                  <button key={emoji} className="emoji-tile" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="➕✨">
                ➕✨
              </p>
              <div className="emoji-row">
                {mobileOptimizedSets.postComposer.map((emoji) => (
                  <button key={emoji} className="emoji-chip" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="🎯☀️">
                🎯☀️
              </p>
              <div className="emoji-row">
                {mobileOptimizedSets.dailyChallenges.map((emoji) => (
                  <button key={emoji} className="emoji-chip" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="🫶👋">
                🫶👋
              </p>
              <div className="emoji-row">
                {mobileOptimizedSets.socialActions.map((emoji) => (
                  <button key={emoji} className="emoji-chip" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="🌍🏠">
                🌍🏠
              </p>
              <div className="emoji-row">
                {emojiDataset.rooms.map((emoji) => (
                  <button key={emoji} className="emoji-chip" aria-label={emoji}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="emoji-block">
              <p className="block-title" aria-label="💭✨">
                💭✨
              </p>
              <div className="emoji-row">
                {emojiDataset.exampleExpressions.map((expression) => (
                  <div key={expression} className="expression-pill">
                    {expression}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'explore' && (
        <section className="tab-view">
          <MissionBanner />
          <div className="emoji-block">
            <p className="block-title" aria-label="🌍✨">
              🌍✨
            </p>
            <div className="emoji-row">
              {emojiDataset.rooms.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="emoji-block">
            <p className="block-title" aria-label="🎯">
              🎯
            </p>
            <div className="emoji-row">
              {emojiDataset.dailyActivitiesChallenges.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'friends' && (
        <section className="tab-view">
          <div className="emoji-block">
            <p className="block-title" aria-label="🧑‍🤝‍🧑">
              🧑‍🤝‍🧑
            </p>
            <div className="menu-row">
              {emojiMenus.friendsMenu
                .filter((item) => item.id !== 'slot')
                .map((item) => (
                  <button key={item.id} className="menu-button" aria-label={item.emoji}>
                    {item.emoji}
                  </button>
                ))}
            </div>
            <div className="menu-slots">
              {['⭐', '⭐', '⭐'].map((star, index) => (
                <span key={`${star}-${index}`} className="slot-star">
                  {star}
                </span>
              ))}
            </div>
          </div>
          <div className="emoji-block">
            <p className="block-title" aria-label="🫶👋">
              🫶👋
            </p>
            <div className="emoji-row">
              {mobileOptimizedSets.socialActions.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'profile' && (
        <section className="tab-view">
          <div className="emoji-block">
            <p className="block-title" aria-label="🙂✨">
              🙂✨
            </p>
            <div className="emoji-row">
              {recommendedDefaultAvatars.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="emoji-block">
            <p className="block-title" aria-label="🧑✨">
              🧑✨
            </p>
            <div className="emoji-grid">
              {mobileOptimizedSets.avatarPicker.map((emoji) => (
                <button key={emoji} className="emoji-tile" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="emoji-block">
            <p className="block-title" aria-label="😊🎭">
              😊🎭
            </p>
            <div className="emoji-row">
              {mobileOptimizedSets.moodPicker.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'create' && (
        <section className="tab-view">
          <div className="emoji-block">
            <p className="block-title" aria-label="➕✨">
              ➕✨
            </p>
            <div className="emoji-row">
              {mobileOptimizedSets.postComposer.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div className="emoji-block">
            <p className="block-title" aria-label="😍😂😮😢😡🫶">
              😍😂😮😢😡🫶
            </p>
            <div className="emoji-row">
              {emojiMenus.reactions.map((emoji) => (
                <button key={emoji} className="emoji-chip" aria-label={emoji}>
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=Space+Grotesk:wght@400;500;600&display=swap');

        :root {
          --ink: #0b0b11;
          --cream: #fff7ea;
          --pink: #ff4fd8;
          --sunset: #ff6b2c;
          --sea: #2a9dff;
          --lime: #d1ff4f;
          --mint: #36ffb0;
          --violet: #6b5bff;
          --shadow: 0 20px 60px rgba(10, 10, 20, 0.2);
        }

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          color: var(--ink);
          font-family: 'Space Grotesk', system-ui, sans-serif;
          background: radial-gradient(circle at 15% 20%, #fff6d5 0%, #ffe8f2 35%, #f2f4ff 60%, #f8fffd 100%);
          min-height: 100vh;
          overflow-x: hidden;
        }

        .page {
          position: relative;
          padding: 32px 7vw 72px;
          min-height: 100vh;
        }

        .bg-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(0px);
          opacity: 0.35;
          animation: float 10s ease-in-out infinite;
          z-index: 0;
        }

        .orb-1 {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle at 30% 30%, var(--pink), transparent 65%);
          top: -80px;
          right: 10vw;
        }

        .orb-2 {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle at 30% 30%, var(--sea), transparent 60%);
          bottom: -140px;
          left: -80px;
          animation-delay: -3s;
        }

        .orb-3 {
          width: 280px;
          height: 280px;
          background: radial-gradient(circle at 30% 30%, var(--lime), transparent 60%);
          top: 40vh;
          right: -60px;
          animation-delay: -6s;
        }

        .topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 56px;
        }

        .logo {
          font-family: 'Archivo Black', 'Space Grotesk', sans-serif;
          font-size: 28px;
          letter-spacing: 0.5px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.7);
          box-shadow: 0 8px 24px rgba(8, 8, 24, 0.12);
          font-size: 14px;
          font-weight: 500;
        }

        .status-emoji {
          font-size: 16px;
        }

        .top-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .login-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 8px 24px rgba(8, 8, 24, 0.12);
          text-decoration: none;
          font-size: 18px;
        }

        .dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: linear-gradient(120deg, var(--mint), var(--sea));
          box-shadow: 0 0 0 4px rgba(54, 255, 176, 0.25);
        }

        .hero {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 32px;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          align-items: center;
        }

        .hero-copy {
          animation: rise 0.9s ease both;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 12px;
          font-weight: 600;
          margin: 0 0 12px;
        }

        h1 {
          font-family: 'Archivo Black', 'Space Grotesk', sans-serif;
          font-size: clamp(40px, 6vw, 76px);
          line-height: 0.98;
          margin: 0 0 18px;
        }

        .gradient-text {
          background: linear-gradient(90deg, var(--pink), var(--violet), var(--sea));
          -webkit-background-clip: text;
          color: transparent;
        }

        .subhead {
          font-size: 24px;
          max-width: 520px;
          margin: 0 0 26px;
        }

        .cta-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .cta {
          border: none;
          padding: 12px 20px;
          border-radius: 999px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .cta.primary {
          background: linear-gradient(120deg, var(--sunset), var(--pink));
          color: #fff;
          box-shadow: 0 16px 30px rgba(255, 88, 88, 0.35);
        }

        .cta.ghost {
          background: #fff;
          color: var(--ink);
          border: 1px solid rgba(12, 12, 20, 0.1);
        }

        .cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(12, 12, 20, 0.18);
        }

        .hero-card {
          background: rgba(255, 255, 255, 0.75);
          border-radius: 32px;
          padding: 24px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(14px);
          animation: rise 0.9s ease both;
          animation-delay: 0.2s;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .chip {
          background: var(--lime);
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .swatches {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .swatch {
          display: grid;
          place-items: center;
          height: 80px;
          border-radius: 18px;
          font-size: 28px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
          animation: pulse 3s ease-in-out infinite;
        }

        .swatch:nth-child(1) {
          background: linear-gradient(135deg, #ffb3b3, #ff5959);
        }

        .swatch:nth-child(2) {
          background: linear-gradient(135deg, #86e8ff, #3f8cff);
          animation-delay: 0.4s;
        }

        .swatch:nth-child(3) {
          background: linear-gradient(135deg, #fff4a3, #ffcc2c);
          animation-delay: 0.8s;
        }

        .swatch:nth-child(4) {
          background: linear-gradient(135deg, #ffb4e6, #ff6bc5);
          animation-delay: 1.2s;
        }

        .swatch:nth-child(5) {
          background: linear-gradient(135deg, #b5ffd6, #34d399);
          animation-delay: 1.6s;
        }

        .swatch:nth-child(6) {
          background: linear-gradient(135deg, #cdb8ff, #7b61ff);
          animation-delay: 2s;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 600;
        }

        .signal {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .signal-bar {
          width: 36px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--mint), var(--sea));
          position: relative;
          overflow: hidden;
        }

        .signal-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
          animation: shimmer 2.4s ease-in-out infinite;
        }

        .pulse {
          width: 12px;
          height: 12px;
          border-radius: 999px;
          background: var(--pink);
          box-shadow: 0 0 0 6px rgba(255, 79, 216, 0.2);
        }

        .ribbons {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 48px;
          position: relative;
          z-index: 1;
        }

        .ribbon {
          padding: 10px 16px;
          border-radius: 16px;
          font-weight: 600;
          letter-spacing: 0.5px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          animation: rise 0.9s ease both;
        }

        .r-1 {
          background: var(--sunset);
          color: #fff;
        }

        .r-2 {
          background: var(--sea);
          color: #fff;
          animation-delay: 0.1s;
        }

        .r-3 {
          background: var(--lime);
          animation-delay: 0.2s;
        }

        .r-4 {
          background: var(--mint);
          animation-delay: 0.3s;
        }

        .emoji-sets {
          position: relative;
          z-index: 1;
          margin-top: 56px;
          display: grid;
          gap: 28px;
        }

        .emoji-block {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 20px 22px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(10px);
        }

        .block-title {
          margin: 0 0 14px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .emoji-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
          gap: 12px;
        }

        .emoji-chip,
        .emoji-tile {
          display: grid;
          place-items: center;
          border: none;
          background: #fff;
          border-radius: 16px;
          width: 52px;
          height: 52px;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .emoji-chip {
          border-radius: 999px;
          padding: 0 18px;
          width: auto;
        }

        .emoji-chip:hover,
        .emoji-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .emoji-chip.selected,
        .menu-button.selected {
          box-shadow: 0 0 0 3px rgba(255, 79, 216, 0.45);
          transform: translateY(-2px);
        }

        .expression-pill {
          background: #fff;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 20px;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
        }

        .menu-showcase {
          position: relative;
          z-index: 1;
          margin-top: 56px;
          display: grid;
          gap: 20px;
        }

        .menu-card {
          background: rgba(255, 255, 255, 0.7);
          border-radius: 24px;
          padding: 18px 20px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(10px);
        }

        .mission-banner-wrap {
          position: relative;
          z-index: 1;
          margin: 20px 0 36px;
          display: grid;
          gap: 12px;
        }

        .mission-banner {
          border: none;
          width: 100%;
          min-height: 160px;
          border-radius: 28px;
          display: grid;
          place-items: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mission-banner:hover {
          transform: translateY(-2px);
          box-shadow: 0 26px 50px rgba(0, 0, 0, 0.22);
        }

        .mission-banner.completed {
          opacity: 0.7;
          filter: saturate(0.8);
        }

        .mission-emoji {
          font-size: 64px;
        }

        .mission-overlay {
          position: absolute;
          inset: 16px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
        }

        .mission-tag,
        .mission-check {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 20px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .mission-upload {
          position: absolute;
          bottom: 14px;
          right: 16px;
          font-size: 20px;
          background: rgba(255, 255, 255, 0.85);
          padding: 6px 10px;
          border-radius: 999px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
        }

        .mission-stamps {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .mission-stamp {
          font-size: 18px;
        }

        .mission-input {
          display: none;
        }

        .menu-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
        }

        .menu-button {
          border: none;
          background: #fff;
          border-radius: 16px;
          width: 52px;
          height: 52px;
          font-size: 26px;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .menu-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .menu-stepper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .menu-step {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .menu-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--violet);
          box-shadow: 0 0 0 6px rgba(107, 91, 255, 0.15);
        }

        .menu-slots {
          display: flex;
          gap: 6px;
          margin-top: 12px;
        }

        .slot-star {
          font-size: 22px;
        }

        .tab-bar {
          position: sticky;
          bottom: 16px;
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 999px;
          padding: 10px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(14px);
          z-index: 2;
        }

        .tab-item {
          border: none;
          background: #fff;
          border-radius: 999px;
          height: 52px;
          font-size: 24px;
          cursor: pointer;
          display: grid;
          place-items: center;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tab-item.active {
          background: linear-gradient(135deg, var(--pink), var(--violet));
          color: #fff;
          box-shadow: 0 18px 32px rgba(107, 91, 255, 0.35);
        }

        .tab-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }

        .create-sheet {
          position: fixed;
          inset: auto 16px 90px 16px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 28px;
          padding: 20px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(16px);
          z-index: 3;
          display: grid;
          gap: 16px;
          animation: rise 0.35s ease both;
        }

        .create-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .create-selection {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .selection-pill {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #fff;
          display: grid;
          place-items: center;
          font-size: 24px;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        }

        .tab-view {
          position: relative;
          z-index: 1;
          margin-top: 32px;
          display: grid;
          gap: 24px;
        }

        .create-close {
          border: none;
          background: #fff;
          border-radius: 999px;
          width: 44px;
          height: 44px;
          font-size: 20px;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
          justify-self: end;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-16px);
          }
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-120%);
          }
          100% {
            transform: translateX(120%);
          }
        }

        @media (max-width: 720px) {
          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero {
            grid-template-columns: 1fr;
          }

          .hero-card {
            padding: 20px;
          }
        }
      `}</style>

      {isCreateOpen && (
        <div className="create-sheet" aria-label="➕✨">
          <button className="create-close" aria-label="❌" onClick={() => setIsCreateOpen(false)}>
            ❌
          </button>
          <div className="create-selection" aria-label="🌍😊">
            <div className="selection-pill" aria-label={selectedRoom ?? '❔'}>
              {selectedRoom ?? '❔'}
            </div>
            <div className="selection-pill" aria-label={selectedMood ?? '❔'}>
              {selectedMood ?? '❔'}
            </div>
          </div>
          <div className="create-row" aria-label="🌍😊📸✅">
            {emojiMenus.postCreationSteps.map((step) => (
              <button key={step.id} className="menu-button" aria-label={step.emoji}>
                {step.emoji}
              </button>
            ))}
          </div>
          <div className="create-row" aria-label="🌍">
            {emojiDataset.rooms.map((emoji) => (
              <button
                key={emoji}
                className={`emoji-chip ${selectedRoom === emoji ? 'selected' : ''}`}
                aria-label={emoji}
                onClick={() => setSelectedRoom(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="create-row" aria-label="😊">
            {mobileOptimizedSets.moodPicker.map((emoji) => (
              <button
                key={emoji}
                className={`emoji-chip ${selectedMood === emoji ? 'selected' : ''}`}
                aria-label={emoji}
                onClick={() => setSelectedMood(emoji)}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="create-row" aria-label="📸">
            {emojiMenus.postCreationSteps
              .filter((step) => step.id === 'media' || step.id === 'publish')
              .map((step) => (
                <button key={step.id} className="menu-button" aria-label={step.emoji}>
                  {step.emoji}
                </button>
              ))}
          </div>
        </div>
      )}

      <nav className="tab-bar" aria-label="🏠🌍➕🫶🙂">
        {emojiMenus.bottomTabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            aria-label={tab.emoji}
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

export default HomePage;
