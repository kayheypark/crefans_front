import type {ApiResult} from './crefans';

export type StudioReportId='revenue'|'subscribers'|'followers';
export type StudioReportPeriod='7d'|'30d'|'all'|'custom';
export type StudioReportDateRange={startDate:string;endDate:string};
export type StudioReport={
  id:StudioReportId;
  title:string;
  description:string;
  asOf:string;
  periodLabel:string;
  dateRange:StudioReportDateRange;
  availableRange:StudioReportDateRange|null;
  coverageNotice:string;
  summary:{id:string;label:string;value:number|null;unit:'원'|'명';description?:string}[];
  columns:{key:string;label:string;unit?:'원'|'명'}[];
  rows:{id:string;date:string;values:Record<string,number>}[];
  chart:{label:string;items:{id:string;label:string;value:number;valueLabel?:string}[]};
  guidance:string[];
  links:{label:string;path:string}[];
};
export type StudioReportModel={
  response:ApiResult<StudioReport>|null;
  loading?:boolean;
  /** Applied range shown in the report. */
  dateRange:StudioReportDateRange;
  /** Range restored by the picker's 초기화 action. */
  defaultRange:StudioReportDateRange;
  /** Earliest recorded day for the 전체 기간 preset, null without records. */
  minDate:string|null;
  maxDate:string;
  applyDateRange:(range:StudioReportDateRange)=>Promise<ApiResult<StudioReportDateRange>>;
};
