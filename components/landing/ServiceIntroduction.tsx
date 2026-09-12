import Image from "next/image";
import {
  ArrowRightOutlined,
  SafetyOutlined,
  DollarOutlined,
  TeamOutlined,
  AimOutlined,
  RocketOutlined,
  CloudDownloadOutlined,
  FlagOutlined,
  PercentageOutlined,
  VideoCameraOutlined,
  ProjectOutlined,
  SketchOutlined,
} from "@ant-design/icons";
import { features, benefits } from "@/features/landing/content";
import s from "./landing.module.css";

const featureIcons = [
  SafetyOutlined,
  DollarOutlined,
  TeamOutlined,
  AimOutlined,
  RocketOutlined,
  CloudDownloadOutlined,
];
const benefitIcons = [
  FlagOutlined,
  PercentageOutlined,
  VideoCameraOutlined,
  ProjectOutlined,
];

export default function ServiceIntroduction({
  onEarlybird,
}: {
  onEarlybird: () => void;
}) {
  return (
    <>
      <section
        id="possibilities"
        className={s.section}
        aria-labelledby="possibilities-title"
      >
        <div className={s.ecosystemIntro}>
        <div className={s.restoredHeading} data-reveal>
          <h2 id="possibilities-title">
            크리에이터, 팬, 플랫폼이 연결된 지속 가능한 창작 생태계
          </h2>
          <p>이 모든 것들이 유기적으로 연결되어 하나의 생태계를 이룹니다.</p>
        </div>
          <div className={s.ecosystemArt} data-reveal>
            <div data-float>
              <div className={s.glassImage}>
                <Image src="/illustrations/community/creator-fans-v1.png" alt="중앙의 크리에이터와 아홉 명의 팬이 연결선과 순환 화살표로 이어진 분홍색과 흰색 3D 창작 생태계" width={1536} height={1024} sizes="(max-width: 800px) 100vw, 55vw" />
              </div>
            </div>
          </div>
        </div>
        <div className={s.serviceGrid}>
          {features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <article
                key={feature.title}
                data-reveal
                style={{ transitionDelay: `${index % 3 * 70}ms` }}
                className={`${s.serviceCard} ${index > 2 ? s.fanCard : ""}`}
              >
                <div className={s.serviceCardTop}>
                  <span className={s.serviceIcon} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={s.audience}>{feature.tags.join(", ")}</span>
                </div>
                <span className={s.serviceIndex} aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.detail}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section
        id="creators"
        className={s.creatorSection}
        aria-labelledby="creator-title"
      >
        <div className={s.restoredCreatorInner}>
          <div className={s.creatorLead}>
          <div className={s.restoredCreatorHeading} data-reveal>
            <h2 id="creator-title">크리에이터 지원 프로그램</h2>
            <p>
              크레팬스는 창작자의 재능 발전을 위해 무엇을 해야할지 알고있습니다.
            </p>
          </div>
          <div className={s.creationArt} data-float>
            <div className={s.glassImage}><Image src="/illustrations/tactile/creation-v2.png" alt="그림, 영상, 음악을 표현한 분홍 퍼와 검정 라텍스 콘텐츠 오브젝트" width={1254} height={1254} sizes="(max-width: 800px) 90vw, 40vw" /></div>
          </div>
          </div>
          <div className={s.supportGrid}>
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <article key={benefit.title} data-reveal>
                  <span aria-hidden="true">
                    <Icon />
                  </span>
                  <h3>{benefit.title}</h3>
                  <p>{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
      <section className={s.section} aria-labelledby="goals-title">
        <div className={s.restoredHeading} data-reveal>
          <h2 id="goals-title">숫자로 보는 크레팬스의 목표</h2>
          <p className={s.goalNotice}>
            크레팬스 프로젝트의 목표 데이터이므로 실제 데이터와 다를 수
            있습니다.
          </p>
        </div>
        <div className={s.goalsGrid}>
          <article data-reveal>
            <strong>92%</strong>
            <h3>멤버십 구독 유지 비율</h3>
            <p>
              당신의 콘텐츠로 충성 고객을 만드세요. (활동 지속 크리에이터 100명
              대상 3개월간 산출값)
            </p>
          </article>
          <article data-reveal>
            <strong>9,420,337원+</strong>
            <h3>월 평균 정산 금액</h3>
            <p>
              최근 12개월간 활동한 1,000명의 사용자 데이터를 기반으로 산정한
              평균 정산금액입니다.
            </p>
          </article>
          <article data-reveal>
            <strong>1,000,000+</strong>
            <h3>활동 팬</h3>
            <p>
              더 많은 도파민을 갈망하는 전 세계 팬들이 크레팬스에서 당신을
              기다리고 있습니다.
            </p>
          </article>
        </div>
      </section>
      <section
        id="earlybird"
        className={s.earlybird}
        aria-labelledby="earlybird-title"
      >
        <div className={s.earlybirdInner}>
          <div className={s.earlybirdCopy} data-reveal>
            <h2 id="earlybird-title">
              남들보다 먼저 <br />
              시작하세요.
            </h2>
            <p className={s.launchDate}>2025년 하반기 베타 서비스 시작 예정</p>
            <p>
              서비스를 끝까지 읽어주셔서 감사합니다. 감사의 마음을 담아 얼리버드
              혜택을 준비했어요.
            </p>
            <button className={s.primary} onClick={onEarlybird}>
              얼리버드로 시작 <ArrowRightOutlined />
            </button>
          </div>
          <div className={s.earlybirdVisual}>
          <div className={s.ticketArt} data-float><div className={s.glassImage}><Image src="/illustrations/tactile/tickets.png" alt="금장 이름표가 있는 검정 라텍스와 분홍 퍼 멤버십 티켓" width={1254} height={1254} sizes="(max-width: 800px) 90vw, 40vw" /></div></div>
          <ul className={s.perks} data-reveal>
            <li>
              <span aria-hidden="true">
                <SketchOutlined />
              </span>
              <p>
                크리에이터 얼리버드에게 <strong>[정산 수수료 zero 쿠폰]</strong>{" "}
                1매 제공
              </p>
            </li>
            <li>
              <span aria-hidden="true">
                <SketchOutlined />
              </span>
              <p>
                팬 얼리버드에게 <strong>[한정판 얼리버드 뱃지]</strong> 제공
              </p>
            </li>
          </ul>
          </div>
        </div>
      </section>
      <section
        className={`${s.section} ${s.notices}`}
        aria-labelledby="notices-title"
      >
        <h2 id="notices-title">[유의사항]</h2>
        <ul>
          <li>
            &apos;얼리버드로 시작&apos;은 당사 사정에 따라 조기 마감될 수
            있습니다.
          </li>
          <li>얼리버드 혜택 관련 내용은 당사 사정에 따라 바뀔 수 있습니다.</li>
          <li>
            정식 및 베타 서비스 예정일은 당사 사정에 따라 바뀔 수 있습니다.
          </li>
        </ul>
      </section>
    </>
  );
}
