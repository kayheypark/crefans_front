"use client";
import {DialogActions} from '@/components/ui/DialogActions';
import {useCallback,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {designTokens as t,designVariables,flattenTokens,palette} from '@/lib/design/tokens';
import {AppShell} from '@/components/ui/AppShell';
import {ChipRow} from '@/components/ui/ChipRow';
import {Button,Field,Chip,Badge,Dialog,Toast,EmptyState} from '@/components/ui/Primitives';
import {CreatorCard} from '@/components/crefans/CreatorCard';
import {MembershipPlanCard} from '@/components/crefans/MembershipPlanCard';
import {LedgerRow} from '@/components/crefans/studio/FinancePages';
import {creators,plans} from '@/components/preview/service/fixtures';
import {Avatar} from '@/components/ui/Avatar';
import {TextLink} from '@/components/ui/TextLink';
import {Brand} from '@/components/crefans/Brand';
import {FormControlsCatalog} from './FormControlsCatalog';
import {BenefitsFieldCatalog} from './BenefitsFieldCatalog';
import {AmountPresetsCatalog} from './AmountPresetsCatalog';
import {PinFieldCatalog} from './PinFieldCatalog';
import {ImageUploadCatalog} from './ImageUploadCatalog';
import {DataDisplayCatalog} from './DataDisplayCatalog';
import {ServicePatternCatalog} from './ServicePatternCatalog';
import s from './custom.module.css';

const creator=creators[1];
const nav=[{id:'overview',label:'미리보기',icon:'◫'},{id:'tokens',label:'디자인 토큰',icon:'◈'},{id:'controls',label:'입력·선택',icon:'⊞'},{id:'tables',label:'표·페이지',icon:'▤'},{id:'patterns',label:'서비스 UI',icon:'◇'},{id:'states',label:'상태·피드백',icon:'◎'}];
const labels:Record<string,string>={accent:'주요 행동',accentSoft:'선택 배경',complementary:'보조 강조',complementarySoft:'보조 강조 배경',avatarInk:'기본 아바타',avatarBg:'아바타 배경',canvas:'페이지 배경',surface:'콘텐츠 바탕',text:'제목·본문',textSecondary:'보조 본문',textMuted:'메타 정보',border:'구분선',danger:'오류',success:'완료'};
function Section({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}) {return <section className={s.section}><div className={s.sectionHeading}><h2>{title}</h2><p>{subtitle}</p></div>{children}</section>;}

export default function CustomDesignSystem(){
 const [page,setPage]=useState('overview'),[following,setFollowing]=useState(false),[selected,setSelected]=useState(false),[category,setCategory]=useState('전체');
 const [busy,setBusy]=useState(false),[dialog,setDialog]=useState<'confirm'|'sheet'|null>(null),[toast,setToast]=useState('');
 const [search,setSearch]=useState('');
 const closeToast=useCallback(()=>setToast(''),[]);
 function exportTokens(){const url=URL.createObjectURL(new Blob([JSON.stringify({palette,tokens:t},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='crefans-tokens.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 return <div className={s.root} style={designVariables as CSSProperties}><AppShell homeHref="/preview/landing" items={nav} active={page} onNavigate={id=>{setPage(id);window.scrollTo({top:0,behavior:"instant"});}}>
 <div className={s.intro}><Badge>DESIGN SYSTEM / 03</Badge><h1>창작을 더 가깝게.<br/><em>경험은 더 간결하게.</em></h1><p>익숙한 블루, 깨끗한 화이트, 읽기 편한 짙은 글자.<br/>어느 화면에서도 쉽게 이해하고 사용할 수 있는 크레팬스.</p><small>자체 HTML · CSS 컴포넌트 / 모든 인물·금액·반응은 UI 확인용 예시</small></div>
 {page==='overview' && <>
 <Section title="서로 다른 마음, 하나의 연결" subtitle="선택한 두 조각의 하트를 공통 로고로 사용합니다. 색상과 크기는 달라도 비율과 형태를 유지합니다."><div className={s.brandShowcase}><div><Brand href="/preview/landing"/><small>기본 로고</small></div><div><Brand href="/preview/landing" inverse/><small>어두운 배경</small></div></div><div className={s.brandColors}>{[{label:'블루',color:t.color.accent,role:'주요 버튼 · 선택 · 포커스'},{label:'딥 블루',color:t.color.complementary,role:'보조 강조 · 기본 아바타'},{label:'라이트 블루',color:t.color.accentSoft,role:'선택 배경 · 부드러운 강조'},{label:'잉크 네이비',color:t.color.text,role:'워드마크 · 제목 · 본문'}].map(item=><div key={item.label}><span style={{background:item.color}}/><strong>{item.label}</strong><code>{item.color}</code><small>{item.role}</small></div>)}</div></Section>
 <Section title="콘텐츠가 먼저 보이는 경험" subtitle="탐색 화면의 실제 CreatorCard에 같은 목업 데이터를 주입합니다."><div className={s.editorial}><CreatorCard creator={creator} href="/preview/creator/jiwoo" following={following} onFollow={()=>setFollowing(!following)}/><div className={s.featureCopy}><Badge>CREATOR & FAN</Badge><h2>좋아하는 창작자와<br/>나누는 더 많은 순간.</h2><p>사진과 이야기를 중심에 두고, 팔로우와 멤버십은 자연스럽게 이어집니다.</p><Button onClick={()=>setPage('patterns')}>서비스 컴포넌트 살펴보기</Button></div></div></Section>
 <Section title="멤버십도 같은 기준으로" subtitle="실제 멤버십 페이지와 동일한 MembershipPlanCard입니다. 선택 상태와 혜택은 데이터로 전달합니다."><div className={s.twoColumns}><MembershipPlanCard plan={plans[0]} selected={!selected} onSelect={()=>setSelected(false)}/><MembershipPlanCard plan={plans[1]} selected={selected} onSelect={()=>setSelected(true)}/></div></Section></>}
 {page==='tokens' && <>
 <Section title="색상이 아니라, 역할을 사용합니다." subtitle="팔레트 → 용도별 토큰 → 자체 UI. CSS 변수와 TypeScript가 같은 원본을 사용합니다."><div className={s.row}><Button onClick={exportTokens}>토큰 JSON 다운로드</Button><code>lib/design/tokens.ts</code></div><div className={s.swatches}>{Object.entries(t.color).map(([key,value])=><div key={key}><div style={{background:value}}/><strong>{labels[key]||key}</strong><code>{key} · {value}</code></div>)}</div></Section>
 <Section title="읽히는 크기, 분명한 위계" subtitle="Hero · Page · Section · Content · Body · Label · Metadata"><div className={s.typeList}>{Object.entries(t.typography).filter(([key])=>key!=='fontFamily').map(([key,value])=>{if(typeof value==='string')return null;return <div key={key}><code>{key} / {value.size}px / {value.weight} / {value.lineHeight}</code><p style={{fontSize:value.size,lineHeight:value.lineHeight,fontWeight:value.weight}}>크리에이터와 팬이 만드는 이야기</p></div>;})}</div></Section>
 <Section title="간격과 형태" subtitle="수치와 역할을 검색하고 다음 화면에도 같은 기준을 사용하세요."><Field label="토큰 검색" value={search} onChange={e=>setSearch(e.target.value)} placeholder="radius, space, motion…"/><div className={s.tokenList}>{Object.entries(flattenTokens(t)).filter(([key,value])=>`${key} ${value}`.toLowerCase().includes(search.toLowerCase())).map(([key,value])=><div key={key}><code>{key}</code><span>{value}</span></div>)}</div></Section></>}
 {page==='controls' && <>
 <Section title="서비스 공통 아바타" subtitle="사진이 없거나 불러오지 못하면 같은 기본 아바타를 표시합니다. 모든 크기에서 원형을 유지합니다."><div className={s.row}>{[24,32,40,56,80].map(size=><Avatar key={size} name={`기본 ${size}px`} size={size}/>)}</div><div className={s.row} style={{marginTop:24}}><Avatar name="사진이 있는 프로필" src={creator.image} size={56}/><Avatar name="사진이 없는 프로필" size={56}/><span className={s.muted}>프로필 사진 유무에 따라 크기와 배치는 바뀌지 않습니다.</span></div></Section>
 <Section title="행동은 명확하게" subtitle="버튼과 텍스트 링크를 구분합니다. 링크는 파란색과 밑줄로 표시하며, 포커스는 Tab으로 확인할 수 있습니다."><div className={s.row}><Button onClick={()=>setToast('주요 행동을 실행했습니다.')}>시작하기</Button><Button tone="secondary">둘러보기</Button><TextLink href="/preview/explore">더 보기</TextLink><Button tone="danger" onClick={()=>setDialog('confirm')}>삭제</Button><Button disabled>사용 불가</Button><Button loading>저장 중</Button></div></Section>
 <FormControlsCatalog/>
 <BenefitsFieldCatalog/>
 <AmountPresetsCatalog/>
 <PinFieldCatalog/>
 <ImageUploadCatalog/>
 <Section title="탐색과 선택" subtitle="Chip은 항상 ChipRow 안에 한 줄로 둡니다. 넘치면 좌우 스크롤·마우스 드래그로 확인하고, 드래그는 클릭으로 처리되지 않습니다."><ChipRow label="분야 선택">{['전체','운동','게임','코스프레','음악','사진','여행','뷰티','피트니스','라이프스타일','아트','브이로그','라이브','커버'].map(x=><Chip key={x} selected={category===x} onClick={()=>setCategory(x)}>{x}</Chip>)}</ChipRow><p className={s.muted}>선택한 분야: {category}</p><div className={s.row}><Badge>멤버 전용</Badge><Badge tone="success">공개됨</Badge><Badge tone="danger">확인 필요</Badge></div></Section></>}
 {page==='tables' && <DataDisplayCatalog/>}
 {page==='patterns' && <ServicePatternCatalog/>}
 {page==='states' && <>
 <Section title="필요한 순간에만, 분명한 피드백" subtitle="브라우저 기본 dialog로 포커스를 유지하고 Escape·닫기·취소를 지원합니다."><div className={s.row}><Button onClick={()=>setToast('변경 사항을 저장했습니다.')}>스낵바 보기</Button><Button tone="secondary" onClick={()=>setDialog('confirm')}>확인창 보기</Button><Button tone="secondary" onClick={()=>setDialog('sheet')}>바텀시트 보기</Button><Button loading={busy} onClick={()=>{setBusy(true);setTimeout(()=>{setBusy(false);setToast('예시 로딩이 완료되었습니다.');},1200);}}>로딩 실행</Button></div><div className={s.alert} role="note"><Badge tone="danger">오류</Badge><p>내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p><Button tone="quiet" onClick={()=>setToast('다시 시도하는 예시입니다.')}>다시 시도</Button></div><EmptyState title="아직 나눈 이야기가 없어요" description="첫 콘텐츠가 새로운 만남의 시작이 됩니다." action={<Button onClick={()=>setToast('콘텐츠 작성 진입 예시입니다.')}>첫 이야기 만들기</Button>}/></Section>
 <Section title="수익과 출금은 다른 상태입니다" subtitle="금액과 상태를 props로 받아 표현합니다. 실제 출금 요청은 발생하지 않습니다."><LedgerRow title="멤버십 수익" detail="2026.09.12" amount={9900} status={<Badge tone="success">처리 완료</Badge>} onClick={()=>setDialog('sheet')}/><LedgerRow title="출금 신청" detail="2026.09.12" amount={9900} status={<Badge>접수됨</Badge>} onClick={()=>setDialog('sheet')}/></Section></>}
 <footer className={s.footer}>crefans · 새로운 UI 기준 <span>로컬 미리보기 · API 호출 없음</span></footer>
 </AppShell><Dialog open={dialog!==null} onClose={()=>setDialog(null)} sheet={dialog==='sheet'} title={dialog==='sheet'?'조금 더 가까운 이야기':'변경 사항을 적용할까요?'}><p>{dialog==='sheet'?'멤버십의 내용과 혜택을 확인하는 바텀시트 예시입니다.':'이 동작은 미리보기 안에서만 실행됩니다.'}</p><DialogActions><Button tone="secondary" onClick={()=>setDialog(null)}>취소</Button><Button onClick={()=>{setDialog(null);setToast('선택이 적용되었습니다.');}}>확인</Button></DialogActions></Dialog><Toast message={toast} onClose={closeToast}/></div>;
}
