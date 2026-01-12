'use client';

import { useRef } from 'react';

type PhotoUploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: File) => void;
};

export const PhotoUploadModal = ({ isOpen, onClose, onSelect }: PhotoUploadModalProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="panel">
        <button className="close" onClick={onClose} aria-label="❌">
          ❌
        </button>
        <div className="row">
          <button
            className="action"
            onClick={() => fileInputRef.current?.click()}
            aria-label="📷"
          >
            📷
          </button>
          <button
            className="action"
            onClick={() => fileInputRef.current?.click()}
            aria-label="🖼️"
          >
            🖼️
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="input"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onSelect(file);
              onClose();
            }
          }}
        />
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
          width: min(360px, 92vw);
          background: #fff;
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.22);
          display: grid;
          gap: 14px;
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
        .row {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .action {
          border: none;
          background: #fff;
          width: 64px;
          height: 64px;
          border-radius: 18px;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
        }
        .input {
          display: none;
        }
      `}</style>
    </div>
  );
};
