'use client';

type EmojiPickerModalProps = {
  emojis: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

export const EmojiPickerModal = ({ emojis, isOpen, onClose, onSelect }: EmojiPickerModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="panel">
        <button className="close" onClick={onClose} aria-label="❌">
          ❌
        </button>
        <div className="grid">
          {emojis.map((emoji) => (
            <button key={emoji} className="emoji" onClick={() => onSelect(emoji)} aria-label={emoji}>
              {emoji}
            </button>
          ))}
        </div>
      </div>
      <style jsx>{`
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(8, 8, 20, 0.45);
          display: grid;
          place-items: center;
          z-index: 50;
        }
        .panel {
          width: min(520px, 92vw);
          max-height: 80vh;
          background: #fff;
          border-radius: 24px;
          padding: 20px;
          overflow: auto;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.22);
          display: grid;
          gap: 12px;
        }
        .close {
          border: none;
          background: #f4f4fb;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 18px;
          justify-self: end;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(52px, 1fr));
          gap: 10px;
        }
        .emoji {
          border: none;
          background: #fff;
          border-radius: 14px;
          height: 52px;
          font-size: var(--emoji-size);
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </div>
  );
};
