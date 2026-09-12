"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import s from "./landing.module.css";

const slides = [
  { category: "운동", image: "/illustrations/fitness/seoyun-gym-row.png", copy: "함께하면, 한 번 더.", alt: "헬스장에서 운동 기록을 만드는 크리에이터", position: "53% center" },
  { category: "게임", image: "/illustrations/creators/gaming-broadcast-v2.png", copy: "좋아하는 플레이를, 함께.", alt: "도트풍 농장 RPG 게임 화면과 오른쪽 아래 게이머 웹캠이 보이는 가상 방송 화면", position: "center" },
  { category: "코스프레", image: "/illustrations/creators/cosplay-anime-v3.png", copy: "상상하던 세계가, 눈앞에.", alt: "흰색 스튜디오에서 무릎을 꿇고 정면을 바라보는 성인 애니메이션 코스프레 크리에이터", position: "center" },
  { category: "성우", image: "/illustrations/creators/voice.png", copy: "목소리 하나로, 새로운 이야기.", alt: "녹음실 마이크 앞에서 연기하는 성우", position: "center" },
  { category: "댄스", image: "/illustrations/creators/dance.png", copy: "나만의 리듬이, 우리의 무대로.", alt: "거울이 있는 연습실에서 안무를 연습하는 댄스 크리에이터", position: "44% center" },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setPageVisible(!document.hidden);
    motion();
    visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (paused || reduced || !visible || !pageVisible || hovered || focused) return;
    const timer = window.setTimeout(() => setActive((index) => (index + 1) % slides.length), 5000);
    return () => window.clearTimeout(timer);
  }, [active, paused, reduced, visible, pageVisible, hovered, focused]);

  const select = (index: number) => {
    setActive((index + slides.length) % slides.length);
    setPaused(true);
  };

  return (
    <div ref={root} className={`${s.heroFeature} ${s.creatorSlider}`} role="region" aria-roledescription="캐러셀" aria-label="다양한 크리에이터의 이야기"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          select(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}
      onTouchStart={(event) => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
      onTouchCancel={() => { touch.current = null; }}
      onTouchEnd={(event) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const point = event.changedTouches[0];
        const dx = point.clientX - start.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(point.clientY - start.y)) select(active + (dx < 0 ? 1 : -1));
      }}>
      {slides.map((slide, index) => (
        <div key={slide.category} className={s.creatorSlide} data-current={index === active} aria-hidden={index !== active}>
          <Image src={slide.image} alt={slide.alt} fill priority={index === 0} loading={index === 0 ? undefined : "eager"} sizes="(max-width: 800px) 100vw, 58vw" style={{ objectPosition: slide.position }} />
        </div>
      ))}
      <div className={s.sliderCaption} aria-live={paused ? "polite" : "off"} aria-atomic="true">
        <p>{slides[active].category} 크리에이터</p>
        <strong key={active}>{slides[active].copy}</strong>
        <span>가상 크리에이터 · AI 이미지</span>
      </div>
      <div className={s.sliderControls}>
        <div className={s.sliderCategories} aria-label="크리에이터 분야 선택">
          {slides.map((slide, index) => <button key={slide.category} type="button" aria-pressed={index === active} onClick={() => select(index)}>{slide.category}</button>)}
        </div>
        {!reduced && <button type="button" className={s.sliderPlayback} aria-label={paused ? "슬라이드 자동 재생" : "슬라이드 일시정지"} onClick={() => setPaused(!paused)}>{paused ? "재생" : "정지"}</button>}
      </div>
    </div>
  );
}
