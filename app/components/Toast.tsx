'use client';

type ToastProps = {
  message: string;
  isOpen: boolean;
};

export const Toast = ({ message, isOpen }: ToastProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="toast" aria-label={message}>
      {message}
      <style jsx>{`
        .toast {
          position: fixed;
          bottom: 90px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(20, 20, 30, 0.9);
          color: #fff;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 18px;
          z-index: 60;
        }
      `}</style>
    </div>
  );
};
