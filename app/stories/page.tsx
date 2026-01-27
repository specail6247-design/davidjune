
'use client';

import { useState, useEffect, useRef } from 'react';

const storyItems = [
  {
    id: 1,
    duration: 5000,
    bg: '/assets/bg1.png',
    title: '미래의 도시를\n탐험하세요',
    span: '탐험',
    desc: '사이버펑크 스타일의 몰입형 웹 스토리 경험'
  },
  {
    id: 2,
    duration: 7000,
    bg: '/assets/bg2.png',
    title: '환상적인\n꿈의 세계',
    span: '꿈의 세계',
    desc: '당신의 상상력을 자극하는 추상적인 비주얼'
  },
  {
    id: 3,
    duration: 6000,
    bg: '/assets/bg3.png',
    title: '모던한 라이프\n미니멀리즘',
    span: '미니멀리즘',
    desc: '깔끔한 디자인으로 완성된 인터페이스',
    cta: '자세히 보기'
  }
];

export default function StoriesPage() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showHelp, setShowHelp] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (showHelp || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentItem = storyItems[index];
    const duration = currentItem.duration;
    startTimeRef.current = Date.now();

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = (elapsed / duration) * 100;
      if (p >= 100) {
        setIndex((prev) => (prev + 1) % storyItems.length);
        setProgress(0);
      } else {
        setProgress(p);
      }
    };

    timerRef.current = setInterval(updateProgress, 16);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, showHelp, isPaused]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % storyItems.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + storyItems.length) % storyItems.length);
    setProgress(0);
  };

  const startStories = () => {
    setShowHelp(false);
    setIsPaused(false);
  };

  return (
    <div className="stories-container">
      <div id="noise-overlay" />
      
      {showHelp && (
        <div className="help-overlay">
          <div className="help-content">
            <h2 className="help-title">사용 방법</h2>
            <div className="help-grid">
              <div className="help-item">
                <span className="help-icon">👈</span>
                <p className="help-text">왼쪽 클릭:<br/>이전 스토리</p>
              </div>
              <div className="help-item">
                <span className="help-icon">👉</span>
                <p className="help-text">오른쪽 클릭:<br/>다음 스토리</p>
              </div>
            </div>
            <button className="dismiss-btn" onClick={startStories}>시작하기</button>
          </div>
        </div>
      )}

      <div className="progress-container">
        {storyItems.map((item, i) => (
          <div key={item.id} className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: i < index ? '100%' : (i === index ? `${progress}%` : '0%')
              }} 
            />
          </div>
        ))}
      </div>

      <div className="nav-overlay">
        <div className="nav-area" onClick={handlePrev} />
        <div className="nav-area" onClick={handleNext} />
      </div>

      {storyItems.map((item, i) => (
        <div 
          key={item.id} 
          className={`story-item ${i === index ? 'active' : ''}`}
          style={{ backgroundImage: `url(${item.bg})` }}
        >
          <div className="story-content">
            <h1 className="hero-text">
              {item.title.split('\n').map((line, li) => (
                <span key={li}>
                  {line.includes(item.span) ? (
                    <>
                      {line.replace(item.span, '')}
                      <span className="highlight">{item.span}</span>
                    </>
                  ) : line}
                  <br />
                </span>
              ))}
            </h1>
            <p className="sub-text">{item.desc}</p>
            {item.cta && <button className="cta-button">{item.cta}</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
