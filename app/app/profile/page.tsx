'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { useSearchParams } from 'next/navigation';
import { emojiDataset, mobileOptimizedSets, recommendedDefaultAvatars } from '../../../lib/emojiDataset';
import { EmojiPickerModal } from '../../components/EmojiPickerModal';
import { upsertUserProfile, getUserProfile } from '../../../lib/userProfilesClient';
import { GIFT_TIERS, PLAN_CONFIG } from '../../../lib/monetizationConfig';
import {
  devGrantGift,
  devSimulateSubscription,
  getPlanRevealLimit,
  getRevealCountForPeriod,
  getSubscription,
  listUserGifts,
  revealInfo,
  setGiftActive,
} from '../../../lib/monetizationClient';
import { DEV_MODE } from '../../../lib/appConfig';
import { getQaState } from '../../../lib/qaState';
import { listRecentUserMissions } from '../../../lib/missionsV2Client';

const emojiSizes = [
  { label: '🐥', value: '24px' },
  { label: '🐣', value: '32px' },
  { label: '🐓', value: '40px' },
];

const auraMap = { S: 3, M: 5, L: 7 };

const ProfilePage = () => {
  const [userId, setUserId] = useState('demo-user');
  const [avatarEmoji, setAvatarEmoji] = useState('🙂');
  const [countryEmoji, setCountryEmoji] = useState('🌍');
  const [moodEmoji, setMoodEmoji] = useState('🙂');
  const [bio, setBio] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [picker, setPicker] = useState<'avatar' | 'country' | 'mood' | null>(null);
  const [emojiSize, setEmojiSize] = useState('32px');
  const [subscription, setSubscription] = useState<{ plan: 'basic' | 'plus' | 'elite' } | null>(null);
  const [periodKey, setPeriodKey] = useState('');
  const [revealCount, setRevealCount] = useState(0);
  const [revealPayload, setRevealPayload] = useState<{
    avatarEmoji: string;
    countryEmoji: string;
    learnEmoji: string;
    recentMissionEmojis: string[];
    engagementLevel: number;
    activityStatus: string;
  } | null>(null);
  const [userGifts, setUserGifts] = useState<Array<{ id: string; emoji: string; active: boolean }>>([]);
  const [revealPhase, setRevealPhase] = useState<'idle' | 'lock' | 'blur' | 'cards' | 'glow'>('idle');
  const [limitMessage, setLimitMessage] = useState('');
  const [counterBounce, setCounterBounce] = useState(false);
  const [visualIntensity, setVisualIntensity] = useState<'S' | 'M' | 'L'>('M');
  const [explorerLabel, setExplorerLabel] = useState('🌍 Explorer');
  const [giftBurst, setGiftBurst] = useState(false);
  const [giftModal, setGiftModal] = useState<{ tier: string; emoji: string } | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (getQaState().simulateGiftSend) {
      setGiftBurst(true);
      const timer = setTimeout(() => setGiftBurst(false), 220);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--emoji-size', emojiSize);
  }, [emojiSize]);

  useEffect(() => {
    if (!userId || userId === 'demo-user') return;

    const profileData = {
      userId,
      avatarEmoji,
      countryEmoji,
      visualIntensity,
    };
    upsertUserProfile(profileData).catch(() => {});
    window.localStorage.setItem('emojiworld_mood', moodEmoji);
  }, [userId, avatarEmoji, countryEmoji, moodEmoji, visualIntensity]);

  useEffect(() => {
    if (!userId || userId === 'demo-user') return;

    const load = async () => {
      // Load user profile, including bio
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        setAvatarEmoji(userProfile.avatarEmoji || '🙂');
        setCountryEmoji(userProfile.countryEmoji || '🌍');
        setBio(userProfile.bio || '');
        setVisualIntensity(userProfile.visualIntensity || 'M');
      }

      const sub = await getSubscription(userId);
      if (sub) {
        setSubscription(sub);
        const key = sub.currentPeriodStart.slice(0, 7);
        setPeriodKey(key);
        const count = await getRevealCountForPeriod(userId, key);
        setRevealCount(count);
      } else {
        setSubscription(null);
      }
      const gifts = await listUserGifts(userId);
      setUserGifts(gifts.map((gift) => ({ id: gift.id, emoji: gift.emoji, active: gift.active })));
      const recent = await listRecentUserMissions(userId);
      const completed = recent.filter((mission) => mission.status === 'completed').length;
      if (completed >= 5) {
        setExplorerLabel('🔥 Active');
      } else if (completed >= 3) {
        setExplorerLabel('🧭 Signal');
      } else {
        setExplorerLabel('✨ Flow');
      }
    };
    load().catch(() => {});
  }, [userId]);

  const handleBioSave = async () => {
    if (!userId) return;
    await upsertUserProfile({ userId, bio });
    setIsEditingBio(false);
  };

  const handleReveal = async () => {
    try {
      const qa = getQaState();
      const plan = subscription?.plan ?? 'basic';
      const limit = getPlanRevealLimit(plan);
      if (qa.forceLimitExceeded || revealCount >= limit) {
        setLimitMessage("You've reached this month's limit. More unlocks available after reset ⏳");
        return;
      }
      setLimitMessage('');
      setRevealPhase('lock');
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(10);
      }
      setTimeout(() => setRevealPhase('blur'), 120);
      setTimeout(() => setRevealPhase('cards'), 300);
      setTimeout(() => {
        setRevealPhase('glow');
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }, 640);
      setTimeout(() => setRevealPhase('idle'), 1040);

      if (qa.simulateRevealAnimation) {
        setRevealPayload({
          avatarEmoji,
          countryEmoji,
          learnEmoji: '🧠',
          recentMissionEmojis: ['🎯', '✨', '🌤️', '💪'],
          engagementLevel: 3,
          activityStatus: '🟢',
        });
        setRevealCount((prev) => prev + 1);
        setCounterBounce(true);
        setTimeout(() => setCounterBounce(false), 140);
        return;
      }

      const data = await revealInfo(userId);
      setRevealPayload(data.payload);
      setRevealCount((prev) => prev + 1);
      setPeriodKey(data.periodKey);
      setCounterBounce(true);
      setTimeout(() => setCounterBounce(false), 140);
    } catch {
      setLimitMessage("You've reached this month's limit. More unlocks available after reset ⏳");
    }
  };

  const isElite = subscription?.plan === 'elite' || getQaState().showEliteEffectsPreview;
  const shareMode = searchParams.get('share') === '1';

  return (
    <div className="profile">
      <div className="row">
        <button
          className={`chip avatar ${isElite ? 'elite' : ''} ${shareMode ? 'share-mode' : ''}`}
          onClick={() => setPicker('avatar')}
          aria-label={avatarEmoji}
          style={
            isElite
              ? ({
                  '--aura-size': `${auraMap[visualIntensity]}px`,
                } as React.CSSProperties)
              : undefined
          }
        >
          {avatarEmoji}
        </button>
        <button className="chip" onClick={() => setPicker('country')} aria-label={countryEmoji}>
          {countryEmoji}
        </button>
        <button className="chip" onClick={() => setPicker('mood')} aria-label={moodEmoji}>
          {moodEmoji}
        </button>
      </div>

      {/* Bio Section */}
      <div className="panel bio-panel">
        {isEditingBio ? (
          <div className="bio-editor">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              maxLength={150}
            />
            <div className="bio-actions">
                <span className="char-count">{bio.length} / 150</span>
                <button onClick={handleBioSave} className="save-btn">Save</button>
                <button onClick={() => setIsEditingBio(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="bio-display">
            <p>{bio || 'No bio yet. Click edit to add one!'}</p>
            <button onClick={() => setIsEditingBio(true)} className="edit-btn">Edit Bio</button>
          </div>
        )}
      </div>

      <div className="row">
        <div className="status-pill" aria-label={explorerLabel}>
          {explorerLabel}
        </div>
      </div>
      <div className="row">
        {emojiSizes.map((size) => (
          <button
            key={size.value}
            className={`chip ${emojiSize === size.value ? 'active' : ''}`}
            onClick={() => setEmojiSize(size.value)}
            aria-label={size.label}
          >
            {size.label}
          </button>
        ))}
      </div>
      <div className="row">
        {['S', 'M', 'L'].map((level) => (
          <button
            key={level}
            className={`chip ${visualIntensity === level ? 'active' : ''}`}
            onClick={() => setVisualIntensity(level as 'S' | 'M' | 'L')}
            aria-label={level}
            disabled={!isElite}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="panel-row">
          <span className="pill">{subscription ? subscription.plan.toUpperCase() : 'FREE'}</span>
          {subscription && (
            <span className={`pill ${counterBounce ? 'bounce' : ''}`}>
              🔓 {revealCount}/{getPlanRevealLimit(subscription.plan)}
            </span>
          )}
        </div>
        <a className="upgrade-link" href="/app/upgrade" aria-label="🔓">
          🔓
        </a>
        <button className={`chip ${revealPhase === 'lock' ? 'shake' : ''}`} onClick={handleReveal} aria-label="🔒">
          🔒
        </button>
        {limitMessage && <div className="limit">{limitMessage}</div>}
        {revealPayload && (
          <div className={`reveal ${revealPhase === 'cards' ? 'show' : ''} ${revealPhase === 'glow' ? 'glow' : ''}`}>
            <div className={`blur ${revealPhase === 'blur' ? 'active' : ''}`} />
            <div className="reveal-row">
              <span className="reveal-card delay-1">{revealPayload.avatarEmoji}</span>
              <span className="reveal-card delay-2">{revealPayload.countryEmoji}</span>
              <span className="reveal-card delay-3">{revealPayload.learnEmoji}</span>
            </div>
            <div className="reveal-row">
              {revealPayload.recentMissionEmojis.map((emoji, index) => (
                <span key={`${emoji}-${index}`} className="reveal-card delay-4">
                  {emoji}
                </span>
              ))}
            </div>
            <div className="reveal-row">
              <span className="reveal-card delay-4">{'⭐'.repeat(revealPayload.engagementLevel)}</span>
              <span className="reveal-card delay-4">{revealPayload.activityStatus}</span>
            </div>
          </div>
        )}
      </div>
      <div className="panel">
        <div className="panel-row">
          {userGifts.map((gift) => (
            <button
              key={gift.id}
              className={`chip ${gift.active ? 'active' : ''}`}
              onClick={() => {
                setGiftActive(gift.id, !gift.active);
                setGiftBurst(true);
                setTimeout(() => setGiftBurst(false), 220);
              }}
              aria-label={gift.emoji}
            >
              {gift.emoji}
            </button>
          ))}
        </div>
        {giftBurst && <div className="burst">✨</div>}
      </div>
      {DEV_MODE && (
        <div className="panel">
          <div className="panel-row">
            {Object.keys(PLAN_CONFIG).map((plan) => (
              <button
                key={plan}
                className="chip"
                onClick={() => devSimulateSubscription(userId, plan as 'basic' | 'plus' | 'elite')}
                aria-label={plan}
              >
                {plan}
              </button>
            ))}
          </div>
          <div className="panel-row">
            {GIFT_TIERS.flatMap((tier) => tier.emojis).map((emoji) => (
              <button key={emoji} className="chip" onClick={() => devGrantGift(userId, emoji)} aria-label={emoji}>
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="panel">
        <div className="panel-row">
          {GIFT_TIERS.map((tier) => (
            <div key={tier.id} className="gift-group">
              {tier.emojis.map((emoji) => (
                <button
                  key={emoji}
                  className="chip"
                  onClick={() => setGiftModal({ tier: tier.id, emoji })}
                  aria-label={emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {giftModal && (
        <div className="gift-modal">
          <div className="gift-panel">
            <div className="gift-emoji">{giftModal.emoji}</div>
            <div className="gift-copy">
              🎁 This emoji is a permanent cosmetic gift. It does not unlock information or special powers. Once
              received, it belongs to the user forever.
            </div>
            <div className="gift-sub">✨ Cosmetic only • No identity info revealed</div>
            <div className="gift-actions">
              <button
                className="chip active"
                onClick={async () => {
                  const { purchaseGift } = await import('../../../lib/monetizationClient');
                  await purchaseGift(giftModal.tier, giftModal.emoji, userId);
                  setGiftModal(null);
                  setGiftBurst(true);
                  setTimeout(() => setGiftBurst(false), 220);
                }}
                aria-label="✅"
              >
                ✅
              </button>
              <button className="chip" onClick={() => setGiftModal(null)} aria-label="❌">
                ❌
              </button>
            </div>
          </div>
        </div>
      )}
      <EmojiPickerModal
        isOpen={picker === 'avatar'}
        emojis={recommendedDefaultAvatars.concat(mobileOptimizedSets.avatarPicker)}
        onClose={() => setPicker(null)}
        onSelect={(emoji) => {
          setAvatarEmoji(emoji);
          setPicker(null);
        }}
      />
      <EmojiPickerModal
        isOpen={picker === 'country'}
        emojis={['🌍', '🌎', '🌏', '🪐']}
        onClose={() => setPicker(null)}
        onSelect={(emoji) => {
          setCountryEmoji(emoji);
          setPicker(null);
        }}
      />
      <EmojiPickerModal
        isOpen={picker === 'mood'}
        emojis={mobileOptimizedSets.moodPicker}
        onClose={() => setPicker(null)}
        onSelect={(emoji) => {
          setMoodEmoji(emoji);
          setPicker(null);
        }}
      />
      <style jsx>{`
        .profile {
          display: grid;
          gap: 16px;
        }
        .row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .chip {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          border: none;
          background: #fff;
          font-size: var(--emoji-size, 32px);
          display: grid;
          place-items: center;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
          cursor: pointer;
        }
        .chip.active {
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
        }
        .chip:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .avatar.elite {
          box-shadow: 0 0 0 var(--aura-size) rgba(255, 79, 216, 0.4),
            0 0 18px rgba(107, 91, 255, 0.6);
          animation: aura 6s ease-in-out infinite;
        }
        .avatar.elite.share-mode {
          filter: brightness(0.3);
        }
        .status-pill {
          background: #fff;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }
        .panel {
          background: #fff;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
          display: grid;
          gap: 12px;
        }
        .bio-panel {
            padding: 20px;
        }
        .bio-display p {
            margin: 0 0 16px 0;
            color: #555;
            line-height: 1.6;
        }
        .edit-btn, .save-btn, .cancel-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
        }
        .edit-btn {
            background-color: var(--gray-200);
            color: var(--gray-800);
        }
        .bio-editor textarea {
            width: 100%;
            min-height: 80px;
            border-radius: 8px;
            border: 1px solid var(--gray-300);
            padding: 12px;
            font-size: 15px;
            resize: vertical;
            margin-bottom: 12px;
        }
        .bio-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .char-count {
            font-size: 12px;
            color: #6c757d;
            flex-grow: 1;
        }
        .save-btn {
            background-color: var(--lime);
            color: #000;
        }
        .cancel-btn {
            background-color: transparent;
            color: #6c757d;
        }

        .panel-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          align-items: center;
        }
        .upgrade-link {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #f4f4fb;
          display: grid;
          place-items: center;
          text-decoration: none;
          color: #11121a;
          font-size: 18px;
        }
        .gift-group {
          display: flex;
          gap: 8px;
        }
        .pill {
          padding: 6px 10px;
          border-radius: 999px;
          background: #f4f4fb;
          font-size: 12px;
        }
        .pill.bounce {
          animation: bounce 0.14s ease;
        }
        .reveal {
          display: grid;
          gap: 8px;
          font-size: 18px;
          position: relative;
          overflow: hidden;
        }
        .reveal.show .reveal-card {
          animation: slide 0.16s ease forwards;
        }
        .reveal.glow {
          box-shadow: 0 0 16px rgba(107, 91, 255, 0.4);
          animation: glow 0.4s ease;
        }
        .reveal-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .reveal-card {
          opacity: 0;
          transform: translateY(14px);
        }
        .delay-1 {
          animation-delay: 0s;
        }
        .delay-2 {
          animation-delay: 0.09s;
        }
        .delay-3 {
          animation-delay: 0.18s;
        }
        .delay-4 {
          animation-delay: 0.27s;
        }
        .blur {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.6);
          opacity: 0;
          pointer-events: none;
        }
        .blur.active {
          animation: blur 0.36s ease;
        }
        .shake {
          animation: shake 0.12s ease;
        }
        .limit {
          font-size: 12px;
          color: #b0455b;
        }
        .burst {
          font-size: 22px;
          animation: burst 0.22s ease;
          justify-self: end;
        }
        .gift-modal {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 20, 0.45);
          display: grid;
          place-items: center;
          z-index: 60;
        }
        .gift-panel {
          width: min(420px, 92vw);
          background: #fff;
          border-radius: 20px;
          padding: 18px;
          display: grid;
          gap: 12px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .gift-emoji {
          font-size: 28px;
        }
        .gift-copy {
          font-size: 13px;
          color: #3f3f4b;
        }
        .gift-sub {
          font-size: 12px;
          color: #6b6b7a;
        }
        .gift-actions {
          display: flex;
          gap: 10px;
        }
        @keyframes shake {
          0% {
            transform: translateX(-3px);
          }
          25% {
            transform: translateX(3px);
          }
          50% {
            transform: translateX(-2px);
          }
          75% {
            transform: translateX(2px);
          }
          100% {
            transform: translateX(0);
          }
        }
        @keyframes blur {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes slide {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0% {
            box-shadow: 0 0 0 rgba(107, 91, 255, 0.2);
          }
          100% {
            box-shadow: 0 0 18px rgba(107, 91, 255, 0.5);
          }
        }
        @keyframes aura {
          0% {
            box-shadow: 0 0 0 var(--aura-size) rgba(255, 79, 216, 0.4),
              0 0 18px rgba(107, 91, 255, 0.6);
          }
          50% {
            box-shadow: 0 0 0 calc(var(--aura-size) + 2px) rgba(107, 91, 255, 0.5),
              0 0 20px rgba(255, 79, 216, 0.5);
          }
          100% {
            box-shadow: 0 0 0 var(--aura-size) rgba(255, 79, 216, 0.4),
              0 0 18px rgba(107, 91, 255, 0.6);
          }
        }
        @keyframes bounce {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes burst {
          0% {
            transform: scale(0.6);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
