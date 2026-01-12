'use client';

import { MobileOnlyGate } from './MobileOnlyGate';
import { EmojiTabBar } from './EmojiTabBar';

type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  return (
    <MobileOnlyGate>
      <div className="app-shell">
        <main className="app-content">{children}</main>
        <EmojiTabBar />
      </div>
      <style jsx>{`
        .app-shell {
          min-height: 100vh;
          background: radial-gradient(circle at top, #fff1f7 0%, #f2f4ff 45%, #f8fffd 100%);
          padding: max(16px, env(safe-area-inset-top)) 16px
            calc(24px + env(safe-area-inset-bottom));
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .app-content {
          flex: 1;
          display: grid;
          gap: 16px;
        }
        :global(:root) {
          --emoji-size: 32px;
        }
      `}</style>
    </MobileOnlyGate>
  );
};
