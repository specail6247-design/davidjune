'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/app/feed', emoji: '🏠', label: '피드' },
  { href: '/app/explore', emoji: '🌍', label: '탐색' },
  { href: '/app/post', emoji: '➕', label: '포스트' },
  { href: '/app/missions', emoji: '🎯', label: '미션' },
  { href: '/app/friends', emoji: '🫶', label: '친구' },
  { href: '/app/profile', emoji: '🙂', label: '프로필' },
];

export const EmojiTabBar = () => {
  const pathname = usePathname();

  return (
    <nav className="tab-bar" aria-label="🏠🌍➕🎯🫶🙂">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`tab-item ${active ? 'active' : ''}`}
            aria-label={tab.emoji}
            data-label={tab.label}
            title={tab.label}
          >
            {tab.emoji}
          </Link>
        );
      })}
      <style jsx>{`
        .tab-bar {
          position: sticky;
          bottom: 12px;
          margin: 16px;
          padding: 10px;
          border-radius: 999px;
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
          backdrop-filter: blur(12px);
          z-index: 10;
        }
        .tab-bar :global(.tab-item) {
          height: 48px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          font-size: var(--emoji-size);
          text-decoration: none;
          background: #fff;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
        }
        .tab-bar :global(.tab-item.active) {
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
          box-shadow: 0 16px 30px rgba(107, 91, 255, 0.35);
          animation: popIn 0.3s ease;
        }
        .tab-bar :global(.tab-item:hover) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .tab-bar :global(.tab-item::after) {
          content: attr(data-label);
          position: absolute;
          bottom: 60px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(20, 20, 30, 0.9);
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.15s ease;
          white-space: nowrap;
        }
        .tab-bar :global(.tab-item:hover::after),
        .tab-bar :global(.tab-item:focus-visible::after) {
          opacity: 1;
        }
      `}</style>
    </nav>
  );
};
