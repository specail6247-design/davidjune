'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { getSubscription } from '../../../lib/monetizationClient';
import { getQaState } from '../../../lib/qaState';

const getDaysToMonthEnd = () => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const diff = end.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diff / 86400000));
};

const UpgradePage = () => {
  const [showCompare, setShowCompare] = useState(false);
  const [daysLeft, setDaysLeft] = useState(getDaysToMonthEnd());
  const [userId, setUserId] = useState('demo-user');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? 'demo-user');
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const load = async () => {
      const sub = await getSubscription(userId);
      if (sub?.currentPeriodEnd) {
        const diff = new Date(sub.currentPeriodEnd).getTime() - Date.now();
        setDaysLeft(Math.max(1, Math.ceil(diff / 86400000)));
      }
      if (getQaState().simulateResetClock) {
        setDaysLeft(1);
      }
    };
    load().catch(() => {});
  }, [userId]);

  const plans = useMemo(
    () => [
      {
        id: 'basic',
        name: 'BASIC',
        price: '$4.99 / month',
        badge: '🌱',
        unlocks: '🔓🔓🔓',
        copy: 'Unlock up to 3 emoji-based insights each month. Resets every billing cycle. Perfect for light explorers.',
        perks: ['⭐ +5', '🎯 +1'],
      },
      {
        id: 'plus',
        name: 'PLUS',
        price: '$9.99 / month',
        badge: '🌈',
        unlocks: '🔓 x10',
        copy: 'See deeper emoji activity patterns. Up to 10 insights per month. Best for active connectors.',
        perks: ['⭐ +15', '✨ auto-post'],
      },
      {
        id: 'elite',
        name: 'ELITE',
        price: '$29.99 / month',
        badge: '🌟',
        unlocks: '50',
        copy: 'Power access for heavy users. Up to 50 emoji-based insights per month. Visual prestige included.',
        perks: ['⭐ +50', '🌟 aura', '🧭 status', '🏆 highlight'],
      },
    ],
    [],
  );

  return (
    <div className="upgrade">
      <header className="header">
        <Link href="/app/feed" className="nav" aria-label="←">
          ←
        </Link>
        <div className="header-emoji">🔓</div>
        <button className="nav" onClick={() => setShowCompare(true)} aria-label="❓">
          ❓
        </button>
      </header>

      <section className="notice">
        <div className="notice-title">🔒 Important Notice</div>
        <p>
          EmojiWorld does NOT reveal real personal information. Unlocked details are based ONLY on
          in-app emoji activity. No real names, emails, phone numbers, or locations are shared.
        </p>
        <div className="notice-bullets">
          <span>👤❌ No identity</span>
          <span>📍❌ No location</span>
          <span>✉️❌ No contact info</span>
        </div>
      </section>

      <section className="plans">
        {plans.map((plan) => (
          <div key={plan.id} className="plan-card">
            <div className="plan-top">
              <div className="plan-title">
                {plan.name} {plan.badge}
              </div>
              <div className="plan-price">{plan.price}</div>
            </div>
            {plan.id === 'elite' ? (
              <div className="plan-ring">
                <span>{plan.unlocks}</span>
              </div>
            ) : (
              <div className="plan-unlocks">{plan.unlocks}</div>
            )}
            <p className="plan-copy">{plan.copy}</p>
            <div className="plan-perks">
              {plan.perks.map((perk) => (
                <span key={perk} className="perk">
                  {perk}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>

      <div className="cta-block">
        <button className="cta">Unlock Emoji Insights</button>
        <button className="ghost">Not now</button>
      </div>

      <div className="reset">⏳ Resets in {daysLeft} days</div>

      <div className="reset-note">
        🔄 Monthly limits reset automatically. Unused reveals do not roll over.
      </div>

      <footer className="trust">
        EmojiWorld is an emoji-first social platform. All interactions are symbolic and
        activity-based. No personal data is sold or exposed.
      </footer>

      {showCompare && (
        <div className="modal">
          <div className="panel">
            <button className="close" onClick={() => setShowCompare(false)} aria-label="❌">
              ❌
            </button>
            <div className="compare">
              <div>✅ emoji activity, streaks, engagement</div>
              <div>❌ email</div>
              <div>❌ phone</div>
              <div>❌ real name</div>
              <div>❌ exact location</div>
              <div>❌ SNS</div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .upgrade {
          padding: 20px 16px 32px;
          display: grid;
          gap: 16px;
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .header {
          display: grid;
          grid-template-columns: 44px 1fr 44px;
          align-items: center;
        }
        .nav {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #fff;
          display: grid;
          place-items: center;
          text-decoration: none;
          color: #11121a;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }
        .header-emoji {
          text-align: center;
          font-size: 24px;
        }
        .notice {
          background: #11121a;
          color: #fff;
          border-radius: 20px;
          padding: 18px;
          display: grid;
          gap: 10px;
        }
        .notice-title {
          font-weight: 700;
        }
        .notice-bullets {
          display: grid;
          gap: 6px;
          font-size: 13px;
        }
        .plans {
          display: grid;
          gap: 12px;
        }
        .plan-card {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 8px;
        }
        .plan-top {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: baseline;
        }
        .plan-title {
          font-weight: 700;
        }
        .plan-price {
          font-size: 12px;
          color: #4b4b5a;
        }
        .plan-unlocks {
          font-size: 18px;
        }
        .plan-ring {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          border: 3px solid #6b5bff;
          display: grid;
          place-items: center;
          font-size: 14px;
          font-weight: 700;
        }
        .plan-copy {
          font-size: 13px;
          color: #4b4b5a;
        }
        .plan-perks {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .perk {
          background: #f4f4fb;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
        }
        .cta-block {
          display: grid;
          gap: 10px;
        }
        .cta {
          border: none;
          background: #6b5bff;
          color: #fff;
          padding: 14px;
          border-radius: 14px;
          font-weight: 700;
        }
        .ghost {
          border: 1px solid #e1e1ef;
          background: #fff;
          padding: 12px;
          border-radius: 14px;
        }
        .reset {
          font-size: 13px;
          text-align: center;
        }
        .reset-note {
          font-size: 12px;
          text-align: center;
          color: #4b4b5a;
        }
        .trust {
          font-size: 12px;
          color: #4b4b5a;
          text-align: center;
        }
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 20, 0.45);
          display: grid;
          place-items: center;
          z-index: 50;
        }
        .panel {
          width: min(420px, 92vw);
          background: #fff;
          border-radius: 20px;
          padding: 16px;
          display: grid;
          gap: 10px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .close {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #f4f4fb;
          justify-self: end;
        }
        .compare {
          display: grid;
          gap: 6px;
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default UpgradePage;
