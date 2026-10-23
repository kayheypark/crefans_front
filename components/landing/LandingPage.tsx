"use client";

import Link from "next/link";
import HeroSlider from "./HeroSlider";
import { useEffect, useRef } from "react";
import {
  ArrowRightOutlined,
  CameraFilled,
  CustomerServiceFilled,
  VideoCameraFilled,
  AudioFilled,
  HeartFilled,
  PictureFilled,
  TrophyFilled,
  SkinFilled,
} from "@ant-design/icons";
import SignUpModal from "@/app/(main)/home/SignUpModal";
import LoginModal from "@/components/modals/LoginModal";
import { useLandingModel } from "@/features/landing/useLandingModel";
import ServiceIntroduction from "./ServiceIntroduction";
import ServiceShowcase from "./ServiceShowcase";
import s from "./landing.module.css";

export default function LandingPage() {
  const model = useLandingModel();
  return <LandingView model={model} />;
}

function LandingView({ model }: { model: ReturnType<typeof useLandingModel> }) {
  const page = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = page.current;
    if (!root) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = root.querySelectorAll<HTMLElement>("[data-reveal], [data-float]");
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      if (media.matches || !("IntersectionObserver" in window)) {
        elements.forEach((element) => { element.dataset.visible = "true"; });
        return;
      }
      observer = new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          const element = target as HTMLElement;
          if (isIntersecting) element.dataset.visible = "true";
          if (element.hasAttribute("data-float")) element.dataset.active = String(isIntersecting);
          else if (isIntersecting) observer?.unobserve(element);
        });
      }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
      elements.forEach((element) => {
        // Content stays visible without JavaScript; only off-screen content waits.
        if (element.getBoundingClientRect().top > window.innerHeight * 0.88) element.dataset.visible = "false";
        observer?.observe(element);
      });
    };
    setup();
    media.addEventListener("change", setup);
    return () => { observer?.disconnect(); media.removeEventListener("change", setup); };
  }, []);
  return (
    <div className={s.page} ref={page}>
      <a href="#main" className={s.skip}>
        본문으로 이동
      </a>
      <header className={s.header}>
        <Link href="/" className={s.brand} aria-label="크레팬스 홈">
          <img src="/logo.png" alt="crefans" width={251} height={50} />
        </Link>
        <nav className={s.nav} aria-label="주요 메뉴">
          <a href="#possibilities">크레팬스 소개</a>
          <a href="#creators">크리에이터를 위해</a>
          <Link href="/explore">
            둘러보기 <span aria-hidden="true">↗</span>
          </Link>
        </nav>
        <div className={s.headerActions}>
          {!model.signedIn && (
            <button className={s.login} onClick={model.openLogin}>
              로그인
            </button>
          )}
          <button className={s.smallPrimary} onClick={model.start}>
            {model.signedIn ? "내 피드" : "시작하기"}
            <ArrowRightOutlined />
          </button>
        </div>
      </header>
      <main id="main">
        <section className={`${s.hero} ${s.editorialHero}`} aria-labelledby="hero-title">
          <div className={s.heroCopy}>
            <h1 id="hero-title">
              크리에이터와 팬이<br />
              <em>만들어나가는</em><br />
              플랫폼
            </h1>
            <div className={s.actions}>
              <button className={s.primary} onClick={model.start}>
                {model.signedIn ? "내 피드로 가기" : "시작하기"}
                <ArrowRightOutlined />
              </button>
              <Link href="/explore" className={s.heroExplore}>
                생태계 둘러보기 <ArrowRightOutlined />
              </Link>
            </div>
            <div className={s.iconMarquee} aria-hidden="true">
              <div className={s.iconMarqueeTrack}>
                {[0, 1].map((copy) => (
                  <div className={s.iconMarqueeSet} key={copy}>
                    {[CameraFilled, CustomerServiceFilled, VideoCameraFilled, AudioFilled, HeartFilled, PictureFilled, TrophyFilled, SkinFilled].map((Icon, index) => (
                      <span className={s.marqueeTile} key={index}><Icon /></span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className={s.heroBottom}>
              <a href="#possibilities" className={s.heroDiscover}>
                <span className={s.scrollMouse} aria-hidden="true"><i /></span>
                스크롤하여 더보기
              </a>
            </div>
          </div>
          <HeroSlider />
        </section>
        <div className={s.interlude}>
          <span>각자의 취향, 하나의 연결.</span>
          <div>
            그림 <i aria-hidden="true" /> 사진 <i aria-hidden="true" /> 음악{" "}
            <i aria-hidden="true" /> 영상 <i aria-hidden="true" /> 이야기{" "}
            <i aria-hidden="true" /> 그리고 당신
          </div>
        </div>
        <ServiceShowcase />
        <ServiceIntroduction onEarlybird={model.startEarlybird} />
      </main>
      <footer className={s.footer}>
        <Link href="/" className={s.brand}>
          <img src="/logo.png" alt="crefans" width={251} height={50} />
        </Link>
        <p>창작하는 당신과, 좋아하는 우리.</p>
        <small>
          © {new Date().getFullYear()} CREFANS. All rights reserved.
        </small>
        <a href="#main">맨 위로 ↑</a>
      </footer>
      <SignUpModal
        isEarlybird={model.isEarlybird}
        open={model.dialog === "signup"}
        onClose={model.closeDialog}
      />
      <LoginModal
        isOpen={model.dialog === "login"}
        onClose={model.closeDialog}
        onSignUpClick={model.start}
      />
    </div>
  );
}
