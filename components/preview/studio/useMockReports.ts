'use client';

import {useState} from 'react';
import type {ApiResult} from '@/types/crefans';
import type {StudioFinanceModel} from '@/types/crefans-studio-finance';
import type {StudioManagementModel,StudioSubscriber} from '@/types/crefans-studio-management';
import type {StudioReport,StudioReportDateRange,StudioReportId,StudioReportModel,StudioReportPeriod} from '@/types/crefans-studio-reports';
import {buildDateRangePresets} from '@/components/ui/date-range';

type Sources={finance:StudioFinanceModel;management:StudioManagementModel;followers:number;today:string};
type Row=StudioReport['rows'][number];
const day=(date:string,offset=0)=>new Date(Date.parse(`${date.slice(0,10)}T00:00:00Z`)+offset*86400000).toISOString().slice(0,10);
const dateLabel=(date:string)=>date.replaceAll('-','.');
const sum=(rows:Row[],key:string)=>rows.reduce((total,row)=>total+(row.values[key]??0),0);
const rangeLabel=({startDate,endDate}:StudioReportDateRange)=>`${dateLabel(startDate)} ~ ${dateLabel(endDate)}`;

export function validateReportDateRange(range:StudioReportDateRange,today:string):ApiResult<StudioReportDateRange>{
  const valid=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&value>='0001-01-01'&&Number.isFinite(Date.parse(`${value}T00:00:00Z`))&&day(value)===value;
  const fail=(errorCode:string,errorMessage:string):ApiResult<StudioReportDateRange>=>({success:false,data:null,errorMessage,errorCode});
  if(!valid(range.startDate)||!valid(range.endDate))return fail('INVALID_DATE_RANGE','시작일과 종료일을 올바른 날짜로 입력해 주세요.');
  if(range.startDate>range.endDate)return fail('REVERSED_DATE_RANGE','종료일은 시작일과 같거나 이후여야 합니다.');
  if(range.endDate>today.slice(0,10))return fail('FUTURE_DATE_RANGE',`${dateLabel(today.slice(0,10))} 기준일까지 조회할 수 있습니다.`);
  return {success:true,data:{...range},errorMessage:null,errorCode:null};
}

export function currentActiveSubscribers(subscribers:StudioSubscriber[],today:string):number{
  const asOf=today.slice(0,10);
  return subscribers.filter(item=>item.status!=='expired'&&item.joinedAt<=asOf&&item.renewAt>=asOf).length;
}

function revenueRows({finance,today}:Sources):Row[]{
  const rows=new Map<string,Row>();
  for(const item of finance.data.earnings){
    const date=item.date.slice(0,10);
    if(date>today.slice(0,10))continue;
    const row=rows.get(date)||{id:date,date,values:{gross:0,reversals:0,fees:0,net:0}};
    for(const key of ['gross','reversals','fees','net'] as const)row.values[key]+=item[key];
    rows.set(date,row);
  }
  return Array.from(rows.values()).sort((a,b)=>a.date.localeCompare(b.date));
}

function subscriberRows({management,today}:Sources):Row[]{
  const asOf=today.slice(0,10),records=management.subscribers.filter(item=>item.joinedAt<=asOf);
  if(!records.length)return [];
  const subscriptions=records.map(item=>({start:item.joinedAt,end:item.status==='expired'&&day(item.renewAt,1)>asOf?asOf:day(item.renewAt,1)}));
  const start=subscriptions.reduce((first,item)=>item.start<first?item.start:first,asOf),rows:Row[]=[];
  for(let date=start;date<=asOf;date=day(date,1)){
    const joined=subscriptions.filter(item=>item.start===date).length,ended=subscriptions.filter(item=>item.end===date).length;
    const active=subscriptions.filter(item=>item.start<=date&&item.end>date).length;
    rows.push({id:date,date,values:{joined,ended,change:joined-ended,active}});
  }
  return rows;
}

/** Synthetic daily changes for the preview only, anchored to the injected current count. */
export function createMockFollowerHistory(followers:number,today:string):Row[]{
  const count=Math.max(0,Math.floor(followers));
  if(!count)return [];
  const rows:Row[]=[];
  let current=count;
  for(let index=29;index>=0;index--){
    const date=day(today,index-29),gained=Math.min(current,Math.floor(count*(index%5+2)/2000));
    const lost=Math.min(gained,Math.floor(count*(index%3)/2000));
    rows.unshift({id:date,date,values:{gained,lost,change:gained-lost,followers:current}});
    current=current-gained+lost;
  }
  return rows;
}

export function createStudioReport(id:StudioReportId,sources:Sources,period:StudioReportPeriod,customRange?:StudioReportDateRange):StudioReport{
  const asOf=sources.today.slice(0,10);
  const history=id==='revenue'?revenueRows(sources):id==='subscribers'?subscriberRows(sources):createMockFollowerHistory(sources.followers,asOf);
  const dateRange=period==='custom'&&customRange?customRange:{startDate:period==='all'?(history[0]?.date||asOf):day(asOf,period==='7d'?-6:-29),endDate:asOf};
  const rows=history.filter(row=>row.date>=dateRange.startDate&&row.date<=dateRange.endDate);
  const availableRange=history.length?{startDate:history[0].date,endDate:history[history.length-1].date}:null;
  const coverageNotice=[
    id==='followers'?'팔로워 일별 이력은 최근 30일까지 제공합니다.':'',
    availableRange?`제공된 기록 범위: ${rangeLabel(availableRange)}. 선택한 기간과 겹치는 기록만 집계합니다.`:'제공된 집계 이력이 없습니다.',
    !rows.length?'선택한 기간에 제공된 기록이 없습니다.':availableRange&&(dateRange.startDate<availableRange.startDate||dateRange.endDate>availableRange.endDate)?'기록 범위 밖의 이력은 추정하여 채우지 않습니다.':'',
  ].filter(Boolean).join(' ');
  const common={id,asOf,dateRange,availableRange,coverageNotice,periodLabel:rangeLabel(dateRange),rows};
  const endpoint=rows.find(row=>row.date===dateRange.endDate);
  const chart=(key:string,label:string,unit:'원'|'명'):StudioReport['chart']=>({label,items:rows.map(row=>({id:row.id,label:row.date.slice(5).replace('-','/'),value:row.values[key],valueLabel:`${row.values[key].toLocaleString('ko-KR')}${unit}`}))});
  if(id==='revenue')return {...common,title:'순수익 리포트',description:'매출에서 환불과 수수료를 제외한 수익을 확인하세요.',
    summary:[
      {id:'gross',label:'기간 매출',value:sum(rows,'gross'),unit:'원'},
      {id:'reversals',label:'기간 환불·취소',value:sum(rows,'reversals'),unit:'원'},
      {id:'fees',label:'기간 수수료',value:sum(rows,'fees'),unit:'원'},
      {id:'net',label:'기간 순수익',value:sum(rows,'net'),unit:'원'},
    ],
    columns:[{key:'gross',label:'매출',unit:'원'},{key:'reversals',label:'환불·취소',unit:'원'},{key:'fees',label:'수수료',unit:'원'},{key:'net',label:'순수익',unit:'원'}],
    chart:chart('net','수익 기록일별 순수익','원'),
    guidance:['수익 내역에 제공된 기록일을 기준으로 집계합니다. 같은 날짜의 내역은 합산하며 기록이 없는 날은 추가하지 않습니다.','순수익은 매출 − 환불·취소 − 수수료입니다. 누적 순수익과 출금 가능 금액은 서로 다릅니다.'],
    links:[{label:'수익 현황 보기',path:'earnings'},{label:'정산 내역 보기',path:'settlements'}],
  };
  if(id==='subscribers')return {...common,title:'구독자 리포트',description:'새로 함께한 팬과 이용 중인 멤버십의 흐름을 확인하세요.',
    summary:[
      {id:'current',label:'선택 기간 종료일 구독자',value:endpoint?.values.active??null,unit:'명',description:endpoint?`${dateLabel(dateRange.endDate)}에 이용 권한이 남은 구독자`:'선택한 종료일의 이력이 없습니다.'},
      {id:'joined',label:'기간 신규 가입',value:sum(rows,'joined'),unit:'명'},
      {id:'ended',label:'기간 이용 종료',value:sum(rows,'ended'),unit:'명'},
      {id:'change',label:'기간 순증감',value:sum(rows,'change'),unit:'명'},
    ],
    columns:[{key:'joined',label:'신규 가입',unit:'명'},{key:'ended',label:'이용 종료',unit:'명'},{key:'change',label:'순증감',unit:'명'},{key:'active',label:'이용 중',unit:'명'}],
    chart:chart('active','일별 이용 중인 구독자','명'),
    guidance:['갱신을 해지해도 이용 종료일까지는 이용 중인 구독자에 포함합니다. 만료 상태인 구독자는 현재 이용 중 인원에서 제외합니다.','기간 신규 가입 − 기간 이용 종료가 기간 순증감입니다. 해지 신청일과 실제 이용 종료일을 혼동하지 않습니다.','가입일·이용 종료일·현재 상태를 기준으로 집계합니다.'],
    links:[{label:'구독자 관리',path:'subscribers'},{label:'멤버십 관리',path:'memberships'}],
  };
  return {...common,title:'팔로워 리포트',description:'이야기를 기다리는 팬의 규모와 팔로우 변화를 확인하세요.',
    summary:[
      {id:'current',label:'선택 기간 종료일 팔로워',value:endpoint?.values.followers??null,unit:'명',description:endpoint?`${dateLabel(dateRange.endDate)}의 팔로워 수`:'선택한 종료일의 이력이 없습니다.'},
      {id:'gained',label:'기간 새 팔로우',value:sum(rows,'gained'),unit:'명'},
      {id:'lost',label:'기간 팔로우 해제',value:sum(rows,'lost'),unit:'명'},
      {id:'change',label:'기간 순증감',value:sum(rows,'change'),unit:'명'},
    ],
    columns:[{key:'gained',label:'새 팔로우',unit:'명'},{key:'lost',label:'팔로우 해제',unit:'명'},{key:'change',label:'순증감',unit:'명'},{key:'followers',label:'전체 팔로워',unit:'명'}],
    chart:chart('followers','일별 팔로워','명'),
    guidance:['선택한 종료일의 팔로워 수와 조회 기간 중 새 팔로우·해제 내역을 표시합니다.','팔로우와 유료 멤버십 구독은 별도 관계입니다. 팔로워 수를 유료 구독자나 매출로 계산하지 않습니다.'],
    links:[{label:'통계 보기',path:'analytics'}],
  };
}

export function useMockReports(sources:Sources):{reports:Record<StudioReportId,StudioReportModel>}{
  const [ranges,setRanges]=useState<Partial<Record<StudioReportId,StudioReportDateRange>>>({});
  const asOf=sources.today.slice(0,10);
  const defaultRange=buildDateRangePresets(asOf).find(preset=>preset.id==='recent-1m')!.range;
  const model=(id:StudioReportId):StudioReportModel=>{
    const minDate=createStudioReport(id,sources,'all').availableRange?.startDate??null;
    const report=createStudioReport(id,sources,'custom',ranges[id]??defaultRange);
    return{
      response:{success:true,data:report,errorMessage:null,errorCode:null},
      dateRange:report.dateRange,defaultRange,minDate,maxDate:asOf,loading:false,
      applyDateRange:async range=>{
        const result=validateReportDateRange(range,sources.today);
        if(result.success)setRanges(previous=>({...previous,[id]:result.data}));
        return result;
      },
    };
  };
  return {reports:{revenue:model('revenue'),subscribers:model('subscribers'),followers:model('followers')}};
}
