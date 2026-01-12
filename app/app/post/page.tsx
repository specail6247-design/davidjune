'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { emojiDataset, mobileOptimizedSets } from '../../../lib/emojiDataset';
import { EmojiPickerModal } from '../../components/EmojiPickerModal';
import { PhotoUploadModal } from '../../components/PhotoUploadModal';
import { createPost } from '../../../lib/postsClient';
import { Toast } from '../../components/Toast';

const PostPage = () => {
  const [roomEmoji, setRoomEmoji] = useState('🌍');
  const [moodEmoji, setMoodEmoji] = useState('🙂');
  const [captionEmoji, setCaptionEmoji] = useState('✨');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [picker, setPicker] = useState<'room' | 'mood' | 'caption' | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  const handlePost = async () => {
    if (!userId) {
      setToast('🔐');
      return;
    }
    await createPost({
      userId,
      roomEmoji,
      moodEmoji,
      captionEmoji,
      mediaUrl: null,
      visibility: 'public',
    });
    window.localStorage.setItem('emojiworld_mood', moodEmoji);
    setToast('✅');
  };

  return (
    <div className="post">
      <div className="row">
        <button className="chip" onClick={() => setPicker('room')} aria-label={roomEmoji}>
          {roomEmoji}
        </button>
        <button className="chip" onClick={() => setPicker('mood')} aria-label={moodEmoji}>
          {moodEmoji}
        </button>
        <button className="chip" onClick={() => setPicker('caption')} aria-label={captionEmoji}>
          {captionEmoji}
        </button>
      </div>
      <div className="row">
        <button className="action" onClick={() => setPhotoOpen(true)} aria-label="📸">
          📸
        </button>
        <button className="action" onClick={handlePost} aria-label="✅">
          ✅
        </button>
      </div>
      {mediaFile && (
        <div className="preview" aria-label="🖼️">
          🖼️
        </div>
      )}
      <EmojiPickerModal
        isOpen={picker === 'room'}
        emojis={emojiDataset.rooms}
        onClose={() => setPicker(null)}
        onSelect={(emoji) => {
          setRoomEmoji(emoji);
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
      <EmojiPickerModal
        isOpen={picker === 'caption'}
        emojis={emojiDataset.emotionalSymbols.concat(emojiDataset.energySymbols)}
        onClose={() => setPicker(null)}
        onSelect={(emoji) => {
          setCaptionEmoji(emoji);
          setPicker(null);
        }}
      />
      <PhotoUploadModal
        isOpen={photoOpen}
        onClose={() => setPhotoOpen(false)}
        onSelect={(file) => setMediaFile(file)}
      />
      <Toast message={toast} isOpen={!!toast} />
      <style jsx>{`
        .post {
          display: grid;
          gap: 16px;
        }
        .row {
          display: flex;
          gap: 12px;
        }
        .chip,
        .action {
          border: none;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          font-size: 24px;
          background: #fff;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
          cursor: pointer;
          display: grid;
          place-items: center;
        }
        .preview {
          width: 100%;
          min-height: 140px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.8);
          display: grid;
          place-items: center;
          font-size: 32px;
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>
    </div>
  );
};

export default PostPage;
