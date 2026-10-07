'use client';
import {DialogActions} from '@/components/ui/DialogActions';
import {useState} from 'react';
import {Button,Field,TextAreaField,SelectField,Dialog} from '@/components/ui/Primitives';
import {Checkbox,Radio} from '@/components/ui/Choice';
import s from './custom.module.css';

const options=[{value:'photo',label:'사진'},{value:'music',label:'음악'},{value:'fitness',label:'피트니스'},{value:'travel',label:'여행'},{value:'game',label:'게임'},{value:'art',label:'아트'},{value:'closed',label:'준비 중인 분야',disabled:true}];
export function FormControlsCatalog(){
 const [disabled,setDisabled]=useState(false),[readOnly,setReadOnly]=useState(false),[submitted,setSubmitted]=useState(false);
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[search,setSearch]=useState(''),[bio,setBio]=useState('');
 const [agree,setAgree]=useState(false),[notify,setNotify]=useState(true),[scope,setScope]=useState('public');
 const [single,setSingle]=useState('photo'),[searchable,setSearchable]=useState(''),[multiple,setMultiple]=useState<string[]>(['photo']),[all,setAll]=useState<string[]>([]),[dialog,setDialog]=useState(false);
 const state={disabled,readOnly};
 return <>
  <section className={s.section}><div className={s.sectionHeading}><h2>입력란의 모든 상태</h2><p>입력 형식은 유지하고 모양과 도움말·오류·비활성 처리는 공통 컴포넌트로 통일합니다.</p></div>
   <div className={s.row}><Checkbox label="비활성 상태" checked={disabled} onChange={setDisabled}/><Checkbox label="읽기 전용" checked={readOnly} onChange={setReadOnly}/></div>
   <form noValidate className={s.controlGrid} onSubmit={e=>{e.preventDefault();setSubmitted(true);}}>
    <Field {...state} label="기본 입력" required value={name} onChange={e=>setName(e.target.value)} clearable onClear={()=>setName('')} placeholder="닉네임을 입력해 주세요" error={submitted&&!name.trim()?'닉네임을 입력해 주세요.':undefined}/>
    <Field {...state} label="이메일" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="hello@example.com" error={submitted&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)?'이메일 형식을 확인해 주세요.':undefined}/>
    <Field {...state} label="비밀번호" type="password" showPasswordToggle value={password} onChange={e=>setPassword(e.target.value)} hint="보기 버튼으로 입력 내용을 확인할 수 있어요." autoComplete="new-password"/>
    <Field {...state} label="검색" type="search" value={search} onChange={e=>setSearch(e.target.value)} clearable onClear={()=>setSearch('')} placeholder="크리에이터 검색"/>
    <Field {...state} label="연락처" type="tel" inputMode="tel" placeholder="010-0000-0000"/>
    <Field {...state} label="웹 주소" type="url" placeholder="https://example.com"/>
    <Field {...state} label="금액" type="number" min={0} step={100} suffix="원" placeholder="0"/>
    <Field {...state} label="프로필 경로" prefix="crefans.com/" placeholder="my-name"/>
    <Field label="오류 상태" error="사용할 수 없는 이름입니다." value="crefans" readOnly/>
    <Field label="비활성 입력" disabled value="현재 변경할 수 없어요"/>
    <Field label="읽기 전용 입력" readOnly value="변경할 수 없지만 복사할 수 있어요"/>
    <TextAreaField {...state} label="여러 줄 입력" value={bio} onChange={e=>setBio(e.target.value)} rows={4} maxLength={200} showCount placeholder="나를 소개하는 이야기를 적어 주세요"/>
    <div className={s.row}><Button type="submit" disabled={disabled||readOnly}>입력 검증</Button><Button tone="secondary" type="button" onClick={()=>setSubmitted(false)}>오류 초기화</Button></div>
   </form>
  </section>
  <section className={s.section}><div className={s.sectionHeading}><h2>체크박스와 라디오</h2><p>브라우저 기본 모양 대신 같은 토큰으로 그립니다. 동의·옵션 선택은 이 두 컴포넌트만 사용합니다.</p></div>
   <div className={s.controlGrid}>
    <div className={s.choiceList}>
     <Checkbox label="기본 체크박스" checked={agree} onChange={setAgree} disabled={disabled}/>
     <Checkbox label="설명이 있는 항목" description="새 게시물과 답글 알림을 이메일로 받습니다." checked={notify} onChange={setNotify} disabled={disabled}/>
     <Checkbox label="비활성" checked={false} onChange={()=>{}} disabled/>
     <Checkbox label="비활성 · 선택됨" checked onChange={()=>{}} disabled/>
    </div>
    <fieldset className={s.choiceList}><legend>공개 범위</legend>
     {[['public','전체 공개'],['members','멤버십 전용'],['private','비공개']].map(([value,label])=><Radio key={value} name="scope" value={value} label={label} checked={scope===value} onChange={()=>setScope(value)} disabled={disabled}/>)}
     <Radio name="scope" value="archived" label="비활성 옵션" checked={false} onChange={()=>{}} disabled/>
    </fieldset>
   </div>
   <p className={s.muted} role="status">체크박스: {agree?'선택':'해제'} · 알림: {notify?'켬':'끔'} · 공개 범위: {scope}</p>
  </section>
  <section className={s.section}><div className={s.sectionHeading}><h2>같은 모습으로 선택하기</h2><p>기기 기본 선택창을 사용하지 않습니다. 검색·다중 선택·전체 선택은 필요한 기능만 켤 수 있습니다.</p></div>
   <div className={s.controlGrid}>
    <SelectField {...state} label="단일 선택" options={options} value={single} onChange={setSingle}/>
    <SelectField {...state} label="검색 가능한 단일 선택" options={options} value={searchable} onChange={setSearchable} searchable placeholder="분야를 검색하고 선택"/>
    <SelectField {...state} label="다중 선택" options={options} multiple value={multiple} onChange={setMultiple}/>
    <SelectField {...state} label="검색 · 전체 선택 · 해제" options={options} multiple searchable selectAll value={all} onChange={setAll} hint="검색 중 전체 선택·해제는 검색 결과에만 적용됩니다."/>
    <SelectField label="선택 오류" options={options} value="" onChange={()=>{}} error="하나의 분야를 선택해 주세요."/>
    <SelectField label="비활성 선택" options={options} value="photo" onChange={()=>{}} disabled/>
    <SelectField label="읽기 전용 선택" options={options} value="music" onChange={()=>{}} readOnly/>
    <SelectField label="선택 항목 없음" options={[]} value="" onChange={()=>{}} searchable/>
   </div>
   <p className={s.muted} role="status">단일 선택: {single||'없음'} · 다중 선택: {multiple.length}개 · 검색·전체 선택: {all.length}개</p>
   <Button tone="secondary" onClick={()=>setDialog(true)}>모달 안의 선택창 확인</Button>
   <Dialog open={dialog} onClose={()=>setDialog(false)} title="관심 분야 선택"><SelectField label="관심 분야" options={options} multiple searchable selectAll value={all} onChange={setAll}/><DialogActions style={{marginTop:24}}><Button onClick={()=>setDialog(false)}>완료</Button></DialogActions></Dialog>
  </section>
 </>;
}
