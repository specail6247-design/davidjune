'use client';

import Link from 'next/link';

export const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-links">
          <Link href="/about">
            About Us
          </Link>
          <Link href="/faq">
            FAQ
          </Link>
          <Link href="/terms">
            Terms of Service
          </Link>
          <Link href="/privacy">
            Privacy Policy
          </Link>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} EmojiWorld. All rights reserved.
        </div>
      </div>
      <style jsx>{`
        .footer-container {
          padding: 40px 20px;
          background-color: #f8f9fa;
          border-top: 1px solid #e9ecef;
          text-align: center;
          font-family: 'Inter', sans-serif;
          color: #6c757d;
          margin-top: 60px;
        }
        .footer-content {
            max-width: 800px;
            margin: 0 auto;
        }
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 20px;
          font-size: 14px;
        }
        .footer-links a {
          color: #6c757d;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-links a:hover {
          color: #000;
          text-decoration: underline;
        }
        .footer-copyright {
          font-size: 12px;
        }
      `}</style>
    </footer>
  );
};
