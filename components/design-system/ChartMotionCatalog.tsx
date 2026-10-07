'use client';
import {useState} from 'react';
import {Trend,BarChart} from '@/components/ui/Charts';
import {Button,EmptyState,SelectField} from '@/components/ui/Primitives';
import s from './custom.module.css';

const examples=[
 {id:'initial',label:'기본 데이터',values:[12,21,18,28,25,34,40]},
 {id:'growth',label:'증가한 데이터',values:[24,15,30,45,38,62,52]},
 {id:'decline',label:'감소한 데이터',values:[8,18,10,22,14,16,12]},
 {id:'zero',label:'모두 0인 데이터',values:[0,0,0,0,0,0,0]},
 {id:'empty',label:'데이터 없음',values:[]},
];

export function ChartMotionCatalog(){
 const [selected,setSelected]=useState('initial'),[replay,setReplay]=useState(0);
 const values=examples.find(example=>example.id===selected)!.values;
 return <section className={s.section}>
  <div className={s.sectionHeading}><h2>데이터에 따라 움직이는 차트</h2><p>스튜디오와 같은 차트입니다. 데이터를 바꾸면 현재 표시된 값에서 새 값으로 이어지고, 처음 등장할 때는 아래에서 올라옵니다.</p></div>
  <div className={s.row} style={{marginBottom:24}}><SelectField label="차트 데이터" value={selected} onChange={setSelected} options={examples.map(({id,label})=>({value:id,label}))}/><Button tone="secondary" onClick={()=>setReplay(value=>value+1)}>처음 등장 다시 보기</Button></div>
  {values.length?<div key={replay} className={s.patternGrid}>
   <div className={s.patternExample}><h3>선 그래프</h3><Trend points={values} label="구독자 추이"/></div>
   <div className={s.patternExample}><h3>막대 그래프</h3><BarChart label="일별 구독자" items={values.map((value,index)=>({id:String(index),label:`${index+1}일`,value,valueLabel:`${value}명`}))}/></div>
  </div>:<EmptyState title="집계된 통계가 없어요" description="데이터가 주입되면 차트가 표시됩니다."/>}
 </section>;
}
