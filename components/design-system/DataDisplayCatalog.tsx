'use client';
import {useState} from 'react';
import {DataTable,type TableSort,type TableColumn} from '@/components/ui/DataTable';
import {Pagination} from '@/components/ui/Pagination';
import {Badge,SelectField} from '@/components/ui/Primitives';
import s from './custom.module.css';

const rows=[
 {id:'01',name:'하늘',plan:'스탠다드',amount:19900,date:'2026-09-12',active:true},
 {id:'02',name:'지우',plan:'베이직',amount:9900,date:'2026-09-08',active:false},
 {id:'03',name:'서연',plan:'프리미엄',amount:49900,date:'2026-09-11',active:true},
 {id:'04',name:'민지',plan:'스탠다드',amount:19900,date:'2026-09-04',active:true},
 {id:'05',name:'예린',plan:'베이직',amount:9900,date:'2026-09-09',active:false},
 {id:'06',name:'수아',plan:'프리미엄',amount:49900,date:'2026-09-01',active:true},
 {id:'07',name:'다해',plan:'스탠다드',amount:19900,date:'2026-09-07',active:true},
 {id:'08',name:'유나',plan:'베이직',amount:9900,date:'2026-09-03',active:false},
 {id:'09',name:'지민',plan:'프리미엄',amount:49900,date:'2026-09-06',active:true},
 {id:'10',name:'민서',plan:'베이직',amount:9900,date:'2026-09-10',active:true},
 {id:'11',name:'지안',plan:'스탠다드',amount:19900,date:'2026-09-05',active:true},
 {id:'12',name:'소연',plan:'프리미엄',amount:49900,date:'2026-09-02',active:false},
];
const columns:TableColumn<typeof rows[number]>[]=[
 {key:'id',label:'원래 순번',render:row=>row.id},
 {key:'name',label:'이름',render:row=><strong>{row.name}</strong>,sortValue:row=>row.name},
 {key:'plan',label:'멤버십',render:row=>row.plan,sortValue:row=>row.plan},
 {key:'amount',label:'금액',render:row=>`${row.amount.toLocaleString('ko-KR')}원`,sortValue:row=>row.amount},
 {key:'date',label:'가입일',render:row=>row.date,sortValue:row=>row.date},
 {key:'status',label:'상태',render:row=><Badge tone={row.active?'success':'brand'}>{row.active?'구독 중':'종료됨'}</Badge>},
];
export function DataDisplayCatalog(){
 const [sort,setSort]=useState<TableSort>(null),[page,setPage]=useState(1),[pageSize,setPageSize]=useState(5),[state,setState]=useState('normal'),[samplePage,setSamplePage]=useState(7);
 const currentRows=state==='empty'?[]:rows;
 const column=columns.find(item=>item.key===sort?.key);
 return <>
  <section className={s.section}><div className={s.sectionHeading}><h2>순서가 분명한 표</h2><p>열 제목을 누르면 기본 순서 → 오름차순 → 내림차순 → 기본 순서로 돌아옵니다. 전체 데이터를 정렬한 뒤 페이지를 나눕니다.</p></div>
   <div className={s.controlGrid}><SelectField label="표 상태" value={state} options={[{value:'normal',label:'일반'},{value:'loading',label:'불러오는 중'},{value:'empty',label:'데이터 없음'}]} onChange={value=>{setState(value);setPage(1);}}/><SelectField label="페이지당 행" value={String(pageSize)} options={[{value:'5',label:'5개'},{value:'10',label:'10개'}]} onChange={value=>{setPageSize(Number(value));setPage(1);}}/></div>
   <p className={s.muted} role="status">{sort?`${column?.label} · ${sort.direction==='asc'?'오름차순':'내림차순'}`:'기본 순서 · 전달된 데이터 순서'} / 총 {currentRows.length}개</p>
   <DataTable rows={currentRows} columns={columns} rowKey={row=>row.id} sort={sort} onSortChange={value=>{setSort(value);setPage(1);}} caption="멤버십 구독 예시" loading={state==='loading'} page={page} pageSize={pageSize}/>
   <Pagination page={page} pageSize={pageSize} totalItems={currentRows.length} onPageChange={setPage} label="멤버십 표 페이지"/>
  </section>
  <section className={s.section}><div className={s.sectionHeading}><h2>페이지 이동</h2><p>현재 페이지, 처음과 끝, 생략된 구간을 표시합니다. 이전·다음으로 이동할 수 없는 경우 비활성화합니다.</p></div>
   <div className={s.patternExample}><h3>여러 페이지 · 총 20페이지</h3><Pagination page={samplePage} pageSize={10} totalItems={200} onPageChange={setSamplePage} label="여러 페이지 예시"/></div>
   <div className={s.patternGrid} style={{marginTop:24}}><div className={s.patternExample}><h3>한 페이지</h3><Pagination page={1} pageSize={10} totalItems={4} onPageChange={()=>{}} label="한 페이지 예시"/></div><div className={s.patternExample}><h3>데이터 없음</h3><Pagination page={1} pageSize={10} totalItems={0} onPageChange={()=>{}} label="빈 페이지 예시"/></div></div>
  </section>
 </>;
}
