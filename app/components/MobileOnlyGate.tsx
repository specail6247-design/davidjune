'use client';

import { useEffect, useState } from 'react';
import { DEV_MODE, MOBILE_MAX_WIDTH } from '../../lib/appConfig';

type MobileOnlyGateProps = {
  children: React.ReactNode;
};

export const MobileOnlyGate = ({ children }: MobileOnlyGateProps) => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (isMobile === null) {
    return <div suppressHydrationWarning />;
  }

  if (!isMobile && !DEV_MODE) {
    return (
      <div className="mobile-gate">
        <div className="gate-card">
          <div className="gate-emoji">📱⬇️</div>
          <div className="gate-text">Please open on mobile</div>
        </div>
        <style jsx>{`
          .mobile-gate {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f6f6fb;
            font-family: 'Space Grotesk', system-ui, sans-serif;
          }
          .gate-card {
            background: #fff;
            padding: 24px 28px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
            display: grid;
            gap: 10px;
            justify-items: center;
          }
          .gate-emoji {
            font-size: 36px;
          }
          .gate-text {
            font-size: 14px;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
};
