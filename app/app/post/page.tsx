'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/AuthContext';
import { emojiDataset, mobileOptimizedSets } from '../../../lib/emojiDataset';
import { PhotoUploadModal } from '../../components/PhotoUploadModal';
import { Toast } from '../../components/Toast';
import { compressImageToDataUrl } from '../../../lib/imageCompress';
import { getUserProfile } from '../../../lib/userProfilesClient';
import {
  createPost,
  getPhotoTicketStatus,
  PhotoTicketStatus,
  MAX_CAPTION_EMOJIS,
  REACTIONS_PER_TICKET,
} from '../../../lib/postsClient';

const CAPTION_TABS = [
  { id: 'mood', emoji: '😊', set: [...mobileOptimizedSets.moodPicker] },
  { id: 'daily', emoji: '☀️', set: [...emojiDataset.dailyActivitiesChallenges].slice(0, 18) },
  { id: 'heart', emoji: '❤️', set: [...emojiDataset.emotionalSymbols, ...emojiDataset.energySymbols, ...emojiDataset.thoughtSymbols] },
  { id: 'social', emoji: '🫶', set: [...emojiDataset.socialCommunity] },
] as const;

// caption을 이모지 단위로 안전하게 자르기 위한 segmenter
const splitEmojis = (value: string): string[] => {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(value), (s) => s.segment);
  }
  return Array.from(value);
};

const PostPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [caption, setCaption] = useState('');
  const [moodEmoji, setMoodEmoji] = useState('🙂');
  const [activeTab, setActiveTab] = useState<(typeof CAPTION_TABS)[number]['id']>('mood');
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<PhotoTicketStatus | null>(null);
  const [toast, setToast] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    getPhotoTicketStatus(user.uid)
      .then(setTicketStatus)
      .catch(() => setTicketStatus(null));
  }, [user]);

  const captionEmojis = useMemo(() => splitEmojis(caption), [caption]);
  const activeSet = CAPTION_TABS.find((tab) => tab.id === activeTab)?.set ?? [];
  const tickets = ticketStatus?.tickets ?? 0;

  const appendEmoji = (emoji: string) => {
    if (captionEmojis.length >= MAX_CAPTION_EMOJIS) {
      setToast('✋ 최대 16개까지!');
      setTimeout(() => setToast(''), 1500);
      return;
    }
    setCaption((prev) => prev + emoji);
  };

  const backspace = () => {
    setCaption(captionEmojis.slice(0, -1).join(''));
  };

  const handlePhotoButton = () => {
    if (tickets <= 0) {
      setToast(
        `🔒 사진은 반응 ${REACTIONS_PER_TICKET}개마다 1장! (다음까지 ${ticketStatus?.reactionsToNext ?? REACTIONS_PER_TICKET}개)`,
      );
      setTimeout(() => setToast(''), 2600);
      return;
    }
    setPhotoOpen(true);
  };

  const handleFile = async (file: File) => {
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setImageDataUrl(dataUrl);
    } catch {
      setToast('😢 이미지가 너무 커요!');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handlePost = async () => {
    if (!user || posting) return;
    if (captionEmojis.length === 0) {
      setToast('👆 이모지를 골라주세요!');
      setTimeout(() => setToast(''), 1800);
      return;
    }
    setPosting(true);
    try {
      const profile = await getUserProfile(user.uid);
      await createPost({
        userId: user.uid,
        authorEmoji: profile?.avatarEmoji ?? '🙂',
        countryEmoji: profile?.countryEmoji ?? '🌍',
        moodEmoji,
        caption,
        imageUrl: imageDataUrl,
        visibility: 'public',
      });
      setToast('✅🎉');
      setTimeout(() => router.push('/app/feed'), 700);
    } catch (error) {
      console.error('Post failed:', error);
      setToast('😢 업로드 실패. 다시 시도해주세요!');
      setTimeout(() => setToast(''), 2200);
      setPosting(false);
    }
  };

  if (loading || !user) {
    return <div className="loading">⏳</div>;
  }

  return (
    <div className="post">
      <header className="page-header">
        <h1>✏️✨</h1>
        <p className="page-sub">이모지로 말해요 · Speak in emoji</p>
      </header>

      {/* 작성 중인 캡션 */}
      <div className="caption-box" aria-label="caption">
        {captionEmojis.length === 0 ? (
          <span className="placeholder">👇 아래 이모지를 탭하세요</span>
        ) : (
          <span className="caption-preview">{caption}</span>
        )}
        {captionEmojis.length > 0 && (
          <button className="backspace" onClick={backspace} aria-label="⌫">
            ⌫
          </button>
        )}
      </div>

      {/* 이모지 카테고리 탭 */}
      <div className="tab-row">
        {CAPTION_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-chip ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.emoji}
          </button>
        ))}
      </div>
      <div className="emoji-grid">
        {activeSet.map((emoji) => (
          <button key={emoji} className="emoji-key" onClick={() => appendEmoji(emoji)}>
            {emoji}
          </button>
        ))}
      </div>

      {/* 기분 선택 */}
      <div className="panel">
        <p className="panel-title">지금 기분 · Mood</p>
        <div className="mood-row">
          {mobileOptimizedSets.moodPicker.slice(0, 8).map((emoji) => (
            <button
              key={emoji}
              className={`mood-chip ${moodEmoji === emoji ? 'active' : ''}`}
              onClick={() => setMoodEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 사진 (티켓 필요) */}
      <div className="panel">
        <p className="panel-title">
          사진 · Photo{' '}
          <span className="ticket-pill">🎟️ {tickets}</span>
        </p>
        {imageDataUrl ? (
          <div className="preview-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageDataUrl} alt="preview" className="preview-img" />
            <button className="remove-img" onClick={() => setImageDataUrl(null)}>
              ❌
            </button>
          </div>
        ) : (
          <button
            className={`photo-btn ${tickets <= 0 ? 'locked' : ''}`}
            onClick={handlePhotoButton}
          >
            {tickets > 0 ? '📸 사진 추가 (티켓 1장 사용)' : `🔒 반응 ${REACTIONS_PER_TICKET}개 = 사진 티켓 1장`}
          </button>
        )}
        <p className="photo-hint">
          💡 이모지 게시물로 반응(❤️)을 모으면 사진 티켓이 생겨요. 사진은 EmojiWorld의 특권!
        </p>
      </div>

      <button className="submit-btn" onClick={handlePost} disabled={posting}>
        {posting ? '⏳...' : '🚀 올리기 · Post'}
      </button>

      <PhotoUploadModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSelect={handleFile}
      />
      <Toast message={toast} isOpen={!!toast} />

      <style jsx>{`
        .post {
          display: grid;
          gap: 16px;
        }
        .loading {
          text-align: center;
          font-size: 40px;
          padding: 80px 0;
        }
        .page-header h1 {
          font-size: 34px;
          margin: 0;
        }
        .page-sub {
          margin: 4px 0 0;
          font-size: 13px;
          color: #8a8a9a;
        }
        .caption-box {
          background: #fff;
          border-radius: 20px;
          min-height: 88px;
          padding: 18px 52px 18px 18px;
          font-size: 34px;
          line-height: 1.4;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          position: relative;
          word-break: break-word;
        }
        .placeholder {
          font-size: 15px;
          color: #b3b3c2;
        }
        .backspace {
          position: absolute;
          right: 12px;
          top: 12px;
          border: none;
          background: #f4f4fb;
          border-radius: 10px;
          width: 38px;
          height: 38px;
          font-size: 16px;
          cursor: pointer;
        }
        .tab-row {
          display: flex;
          gap: 8px;
        }
        .tab-chip {
          border: none;
          background: #fff;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          font-size: 22px;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.07);
        }
        .tab-chip.active {
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          box-shadow: 0 10px 20px rgba(107, 91, 255, 0.3);
        }
        .emoji-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 8px;
          background: #fff;
          border-radius: 20px;
          padding: 14px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
        }
        .emoji-key {
          border: none;
          background: #fafafd;
          aspect-ratio: 1;
          border-radius: 12px;
          font-size: 26px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .emoji-key:active {
          transform: scale(0.9);
        }
        .panel {
          background: #fff;
          border-radius: 20px;
          padding: 16px;
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
          display: grid;
          gap: 12px;
        }
        .panel-title {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #6b6b7a;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ticket-pill {
          background: linear-gradient(135deg, #fff7d6, #ffeff9);
          border-radius: 999px;
          padding: 3px 10px;
          font-size: 12px;
        }
        .mood-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .mood-chip {
          border: none;
          background: #fafafd;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          font-size: 24px;
          cursor: pointer;
        }
        .mood-chip.active {
          background: linear-gradient(135deg, #ffe3f6, #e6e2ff);
          box-shadow: 0 0 0 2px rgba(107, 91, 255, 0.35);
        }
        .photo-btn {
          border: none;
          border-radius: 14px;
          padding: 14px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          background: linear-gradient(135deg, #d6f5ff, #e6e2ff);
          font-family: inherit;
        }
        .photo-btn.locked {
          background: #f2f2f7;
          color: #8a8a9a;
        }
        .photo-hint {
          margin: 0;
          font-size: 12px;
          color: #9a9aad;
          line-height: 1.6;
        }
        .preview-wrap {
          position: relative;
        }
        .preview-img {
          width: 100%;
          border-radius: 14px;
          display: block;
        }
        .remove-img {
          position: absolute;
          top: 10px;
          right: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          cursor: pointer;
        }
        .submit-btn {
          border: none;
          border-radius: 18px;
          padding: 18px;
          font-size: 18px;
          font-weight: 800;
          cursor: pointer;
          background: linear-gradient(135deg, #ff4fd8, #6b5bff);
          color: #fff;
          box-shadow: 0 14px 30px rgba(107, 91, 255, 0.4);
          font-family: inherit;
        }
        .submit-btn:disabled {
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default PostPage;
