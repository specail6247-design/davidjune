
'use client';

import { useState, useEffect, useCallback } from 'react';

interface Step {
  targetId: string;
  title: string;
  desc: string;
  emoji: string;
}

const steps: Step[] = [
  {
    targetId: 'guide-mission',
    title: '미션 완료하기',
    desc: '여기 배너를 탭해서 오늘의 미션을 수행하세요!\n체크인이나 사진 인증으로 스타를 모을 수 있어요.',
    emoji: '🎯'
  },
  {
    targetId: 'guide-hero',
    title: '스토리 보기',
    desc: '로켓 버튼을 눌러 이모지월드의 몰입형 스토리를 구경하세요!\n좌우 클릭으로 쉽게 이동할 수 있습니다.',
    emoji: '🚀'
  },
  {
    targetId: 'guide-tabs',
    title: '메뉴 탐색',
    desc: '하단 탭을 이용해 친구를 찾거나\n나만의 이모지 프로필을 설정해보세요!',
    emoji: '🌍'
  }
];

export default function OnboardingGuide() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const hasSeen = localStorage.getItem('emojiworld_guide_seen');
    if (!hasSeen) {
      setCurrentStep(0);
    }
  }, []);

  const updateHighlight = useCallback(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      setHighlightRect(null);
      return;
    }

    const target = document.getElementById(steps[currentStep].targetId);
    if (target) {
      setHighlightRect(target.getBoundingClientRect());
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentStep]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [updateHighlight]);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('emojiworld_guide_seen', 'true');
      setCurrentStep(-1);
    }
  };

  if (currentStep < 0) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-spotlight" style={highlightRect ? {
        top: highlightRect.top,
        left: highlightRect.left,
        width: highlightRect.width,
        height: highlightRect.height
      } : {}} />
      
      <div className="onboarding-tooltip" style={highlightRect ? {
        top: highlightRect.bottom + 20 > window.innerHeight - 300 ? highlightRect.top - 200 : highlightRect.bottom + 20,
        left: '50%',
        transform: 'translateX(-50%)'
      } : {}}>
        <div className="tooltip-emoji">{steps[currentStep].emoji}</div>
        <h3>{steps[currentStep].title}</h3>
        <p>{steps[currentStep].desc}</p>
        <button className="guide-btn" onClick={next}>
          {currentStep === steps.length - 1 ? '시작하기 ✨' : '다음 →'}
        </button>
      </div>
    </div>
  );
}
