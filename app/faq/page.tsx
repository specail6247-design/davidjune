'use client';

import Link from 'next/link';

const FAQPage = () => {
  const faqs = [
    {
      question: 'What is the main purpose of EmojiWorld?',
      answer: 'The main purpose of EmojiWorld is to create a fun and simple communication space where people can express their feelings and daily lives using only emojis, without the need for text in the main feed.',
    },
    {
      question: 'Can I use text at all on this platform?',
      answer: 'In the main feed, posts are emoji-only to maintain the core concept. However, we plan to introduce a comment feature that will allow text-based communication on posts, blending the best of both worlds!',
    },
    {
      question: 'How do I earn points or climb the rankings?',
      answer: 'You can earn points by completing daily missions, receiving reactions from other users, and actively participating in the community. Your rank is determined by your cumulative points.',
    },
    {
      question: 'Is my data safe?',
      answer: 'Yes, we take data security very seriously. All user data is securely managed through Firebase Authentication and Firestore, and we do not share your personal information with third parties without your consent.',
    },
    {
        question: 'Why am I seeing ads?',
        answer: 'To maintain and operate the EmojiWorld service for free, we run a limited number of advertisements. We strive to place ads in a way that does not disrupt your user experience. Revenue from ads helps us improve the service and develop new features.',
    }
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <Link href="/" className="back-link">
          ←
        </Link>
        <h1>Frequently Asked Questions</h1>
      </header>
      <main className="content">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </main>

      <style jsx>{`
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          font-family: 'Inter', sans-serif;
          color: #333;
        }
        .page-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 40px;
        }
        .back-link {
            font-size: 24px;
            color: #333;
            text-decoration: none;
        }
        h1 {
          font-size: 36px;
          font-weight: 700;
          color: #000;
        }
        .faq-item {
          border-bottom: 1px solid #eee;
          padding: 20px 0;
        }
        .faq-item:first-child {
            border-top: 1px solid #eee;
        }
        summary {
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          list-style: none; /* Hide default marker */
        }
        summary::-webkit-details-marker {
            display: none; /* Hide default marker for Safari */
        }
        summary::after {
            content: '+';
            float: right;
            font-size: 24px;
            font-weight: 300;
        }
        details[open] summary::after {
            content: '−';
        }
        p {
          margin-top: 16px;
          font-size: 16px;
          line-height: 1.8;
          color: #555;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;
