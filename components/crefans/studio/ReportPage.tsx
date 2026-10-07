'use client';

import {useEffect,useId,useState} from 'react';
import type {StudioReport,StudioReportModel} from '@/types/crefans-studio-reports';
import {BarChart} from '@/components/ui/Charts';
import {DataTable,type TableColumn,type TableSort} from '@/components/ui/DataTable';
import {Pagination} from '@/components/ui/Pagination';
import {DateRangePicker} from '@/components/ui/DateRangePicker';
import {TextLink} from '@/components/ui/TextLink';
import {ApiState} from '../ApiState';
import {Empty} from '../ServiceUI';
import s from './report.module.css';

type Props={model:StudioReportModel;basePath:string};
type ReportRow=StudioReport['rows'][number];
const navigation=[{id:'revenue',label:'순수익'},{id:'subscribers',label:'구독자'},{id:'followers',label:'팔로워'}] as const;

export function ReportPage({model,basePath}:Props){
  return <section className={s.page}>
    <TextLink className={s.back} href={basePath}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>대시보드로</TextLink>
    <ApiState response={model.response} loading={model.loading}>
      {report=><ReportContent key={report.id} report={report} model={model} basePath={basePath}/>}
    </ApiState>
  </section>;
}

function ReportContent({report,model,basePath}:Props&{report:StudioReport}){
  const id=useId(),[sort,setSort]=useState<TableSort>(null),[page,setPage]=useState(1);
  const pageSize=10;
  useEffect(()=>{setSort(null);setPage(1);},[report.dateRange.startDate,report.dateRange.endDate]);
  const columns:TableColumn<ReportRow>[]=[
    {key:'date',label:'날짜',sortValue:row=>row.date,render:row=><time dateTime={row.date}>{row.date}</time>},
    ...report.columns.map(column=>({
      key:column.key,label:column.label,sortValue:(row:ReportRow)=>row.values[column.key]??null,
      render:(row:ReportRow)=>{
        const value=row.values[column.key];
        return <span className={s.tableValue}>{value==null?'-':<>{value.toLocaleString('ko-KR')}{column.unit&&<small>{column.unit}</small>}</>}</span>;
      },
    })),
  ];
  function changeSort(next:TableSort){setSort(next);setPage(1);}

  return <>
    <header className={s.heading}>
      <div><span className={s.eyebrow}>크리에이터 리포트</span><h1>{report.title}</h1>{report.description&&<p>{report.description}</p>}</div>
      {report.asOf&&<span className={s.asOf}>{report.asOf} 기준</span>}
    </header>
    <div className={s.toolbar}>
      <nav className={s.navigation} aria-label="리포트 항목">{navigation.map(item=><TextLink key={item.id} className={s.reportLink} href={`${basePath}/reports/${item.id}`} aria-current={report.id===item.id?'page':undefined}>{item.label}</TextLink>)}</nav>
      <div className={s.period}><DateRangePicker label="조회 기간" hideLabel value={model.dateRange} defaultValue={model.defaultRange} minDate={model.minDate} maxDate={model.maxDate} disabled={model.loading} onApply={model.applyDateRange}/></div>
    </div>
    {report.summary.length>0&&<dl className={s.summary} aria-label="주요 지표">{report.summary.map(metric=><div key={metric.id} className={s.metric}>
      <dt>{metric.label}</dt><dd>{metric.value===null?<span className={s.unavailable}>기록 없음</span>:<>{metric.value.toLocaleString('ko-KR')}<small>{metric.unit}</small></>}</dd>{metric.description&&<p>{metric.description}</p>}
    </div>)}</dl>}
    <section className={s.chart} aria-labelledby={`${id}-chart`}>
      <div className={s.sectionHeading}><h2 id={`${id}-chart`}>{report.chart.label}</h2><span>{report.periodLabel}</span></div>
      {report.chart.items.length>0?<div className={s.chartViewport} tabIndex={0} role="region" aria-label={`${report.chart.label} 그래프`}><div style={{minWidth:Math.max(300,report.chart.items.length*64)}}><BarChart label={report.chart.label} items={report.chart.items}/></div></div>:<Empty title="집계된 데이터가 없어요" description="선택한 기간에 표시할 내역이 없습니다."/>}
    </section>
    <section className={s.details} aria-labelledby={`${id}-details`}>
      <div className={s.sectionHeading}><h2 id={`${id}-details`}>상세 내역</h2><span>{report.periodLabel} · {report.rows.length.toLocaleString('ko-KR')}개 항목</span></div>
      <DataTable rows={report.rows} columns={columns} rowKey={row=>row.id} sort={sort} onSortChange={changeSort} page={page} pageSize={pageSize} caption={`${report.title} · ${report.periodLabel}`} emptyMessage="선택한 기간에 집계된 내역이 없습니다."/>
      {report.rows.length>pageSize&&<Pagination page={page} totalItems={report.rows.length} pageSize={pageSize} onPageChange={setPage} label={`${report.title} 상세 내역 페이지`}/>}
    </section>
    {report.guidance.length>0&&<aside className={s.guidance} aria-labelledby={`${id}-guidance`}><h2 id={`${id}-guidance`}>집계 기준 안내</h2><ul>{report.guidance.map((item,index)=><li key={index}>{item}</li>)}</ul></aside>}
    {report.links.length>0&&<nav className={s.related} aria-label="관련 화면">{report.links.map(link=><TextLink key={link.path} href={`${basePath}/${link.path}`}>{link.label}<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></TextLink>)}</nav>}
  </>;
}
