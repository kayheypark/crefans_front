"use client";

import { useState } from "react";
import { PostView } from "@/components/post/Post";
import MembershipCard from "@/components/common/MembershipCard";
import { useResponsive } from "@/hooks/useResponsive";
import { createDemoPost, demoCreator, demoMemberships } from "@/features/landing/service-demo";
import s from "./showcase.module.css";

const scenes = [
  { title: "공개 콘텐츠", headline: "나의 일상이, 첫 만남이 되도록.", description: "운동 기록과 사진을 공개하고, 나의 스타일에 공감하는 팬을 만나보세요. 익숙한 피드에서 창작자의 이야기가 시작됩니다." },
  { title: "멤버십", headline: "나의 콘텐츠에 맞는 멤버십.", description: "가격과 혜택을 직접 구성하세요. 팬은 자신에게 맞는 멤버십을 선택하고, 좋아하는 크리에이터의 다음 창작을 함께합니다." },
  { title: "전용 콘텐츠", headline: "함께하는 팬에게, 더 깊은 이야기.", description: "멤버십 전용 콘텐츠로 한 걸음 더 가까워지세요. 공개 게시글과 같은 편안한 화면에서 멤버를 위한 이야기를 이어갑니다." },
];
const noop = () => {};
const router = { push: noop, replace: noop, refresh: noop, back: noop, forward: noop, prefetch: async () => {} };

export default function ServiceShowcase() {
  const [scene, setScene] = useState(0);
  const responsive = useResponsive();
  const post = createDemoPost(scene === 2);
  return (
    <section id="service-preview" className={s.section} aria-labelledby="showcase-title">
      <div className={s.inner} data-reveal>
        <div className={s.copy}>
          <p className={s.eyebrow}>크레팬스 미리보기</p>
          <h2 id="showcase-title">창작을 나누는 순간부터,<br />팬과 함께하는 일상까지.</h2>
          <div className={s.steps} aria-label="서비스 예시 화면 선택">
            {scenes.map((item, index) => (
              <button key={item.title} type="button" aria-pressed={scene === index} aria-controls="service-demo-screen" onClick={() => setScene(index)}>
                <span>0{index + 1}</span>{item.title}
              </button>
            ))}
          </div>
          <div className={s.description} key={scene} aria-live="polite">
            <h3>{scenes[scene].headline}</h3>
            <p>{scenes[scene].description}</p>
          </div>
          <p className={s.disclaimer}>가상의 운동 크리에이터 ‘서윤’의 예시입니다.<br />인물 사진은 AI로 제작했으며, 가격·혜택·반응 수는 예시입니다.</p>
        </div>
        <div className={s.window} id="service-demo-screen" role="region" aria-label={`${scenes[scene].title} 예시 화면`}>
          <div className={s.windowBar}><img src="/logo.png" alt="crefans" width={100} height={20} /><span>서비스 화면 미리보기</span></div>
          <div className={s.screen} key={scene}>
            {scene === 1 ? (
              <div className={s.memberships}>
                <div className={s.creator}><img src={demoCreator.avatar} alt="" /><div><strong>{demoCreator.name}</strong><p>나의 속도로, 매일 조금씩 움직여요.</p></div></div>
                <h3>멤버십 선택</h3>
                <p className={s.priceNote}>가격과 혜택은 예시입니다.</p>
                {demoMemberships.map((membership, index) => <MembershipCard key={membership.id} membership={membership} selected={index === 0} />)}
              </div>
            ) : (
              <div ref={(element) => element?.setAttribute("inert", "")} aria-label="게시글 디자인 예시">
                <PostView post={post} likedPosts={[]} expandedPosts={[post.id]} relativeDatePosts={{}} openReplies={{}}
                  onLike={noop} onToggleExpand={noop} onToggleDateType={noop} onToggleReplies={noop}
                  onCommentInputClick={noop} onCommentSubmit={noop} onShare={noop} onReport={noop}
                  formatDate={() => "오늘"} formatFullDate={() => "예시 게시글"} comments={null}
                  model={{ user: null, router, ...responsive, showComments: false, setShowComments: noop,
                    commentCount: 0, setCommentCount: noop, lightboxOpen: false, setLightboxOpen: noop,
                    lightboxIndex: 0, getLightboxSlides: () => [], handleThumbnailClick: noop,
                    noCopyGuideText: "가상의 여성 운동 크리에이터 서윤의 운동 기록 사진", isOwnPost: false }} />
              </div>
            )}
          </div>
          <div className={s.screenFoot}>실제 서비스 UI에 예시 데이터를 담은 화면입니다.</div>
        </div>
      </div>
    </section>
  );
}
