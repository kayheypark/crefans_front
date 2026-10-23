"use client";

import { Button, Tag } from 'antd';
import { designTokens, flattenTokens, palette } from '@/lib/design/tokens';
import styles from './design-system.module.css';

const roles: Record<string, string> = {
  accent: '주요 행동 · 선택 상태', accentHover: '주요 행동 호버', accentActive: '누르는 상태',
  accentSoft: '선택 영역 배경', accentBorder: '강조 영역 테두리', canvas: '페이지 배경',
  surface: '카드 · 입력 · 모달', surfaceSubtle: '보조 영역', text: '제목 · 기본 본문',
  textSecondary: '보조 본문', textMuted: '메타 정보', onAccent: '강조 배경 위 텍스트',
  border: '카드 구분선', borderStrong: '입력 테두리', disabledBg: '비활성 배경', disabledText: '비활성 텍스트',
  success: '완료', warning: '주의', danger: '오류 · 삭제', info: '정보', focus: '키보드 포커스',
  successSoft: '완료 배경', warningSoft: '주의 배경', dangerSoft: '오류 배경', infoSoft: '정보 배경', overlay: '모달 뒤 배경',
};

export default function RedesignTokens() {
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({version: 1, palette, tokens: designTokens}, null, 2)], {type: 'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'crefans-redesign-tokens-v1.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className={styles.redesignFoundation} aria-labelledby="redesign-title">
    <div className={styles.foundationHeading}>
      <div><Tag color="purple">REDESIGN / V1</Tag><h2 id="redesign-title">화이트 위에, 선명한 바이올렛.</h2>
        <p>공유 목업의 방향을 해석한 제안값입니다. 주요 행동과 선택 상태에만 포인트 색상을 사용합니다.</p></div>
      <Button onClick={download}>토큰 JSON 다운로드</Button>
    </div>
    <div className={styles.tokenArchitecture}>
      <div><small>01 / PALETTE</small><strong>기본 팔레트</strong><p>White · Neutral · Violet</p></div>
      <div><small>02 / SEMANTIC</small><strong>용도별 토큰</strong><p>accent · surface · text · danger</p></div>
      <div><small>03 / COMPONENT</small><strong>컴포넌트 설정</strong><p>버튼 · 입력 · 카드 · 모달</p></div>
    </div>
    <div className={styles.swatches}>
      {Object.entries(designTokens.color).map(([key, value]) => <div className={styles.swatch} key={key}>
        <div className={styles.swatchColor} style={{background: value}} />
        <strong>{key}</strong><code>{value}</code><p className={styles.tokenRole}>{roles[key]}</p>
      </div>)}
    </div>
    <div className={styles.tokenDetails}>
      {(['typography', 'space', 'radius', 'size', 'motion', 'breakpoint', 'shadow'] as const).map(group => <details key={group}>
        <summary>{group} <span>{Object.keys(designTokens[group]).length} tokens</span></summary>
        {Object.entries(flattenTokens(designTokens[group])).map(([key,value]) => <div className={styles.tokenValue} key={key}><code>{group}.{key}</code><span>{String(value)}</span></div>)}
      </details>)}
    </div>
    <p className={styles.note}>본문은 text·textSecondary, 흰 글자 버튼은 accent를 사용합니다. 비활성 상태는 색상과 함께 실제 disabled 속성을 적용합니다. 기존 서비스 컴포넌트의 고정 스타일은 아래에서 개편 대상으로 따로 확인합니다.</p>
  </section>;
}
