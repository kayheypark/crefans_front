// Report reasons offered to members. Values match the server ReportReason enum (crefans_server src/platform/service.ts report()).
export const reportReasons=[
  {value:'INAPPROPRIATE',label:'성적·선정적인 내용'},
  {value:'COPYRIGHT',label:'저작권 침해'},
  {value:'SPAM',label:'스팸·광고'},
  {value:'HARASSMENT',label:'괴롭힘·혐오'},
  {value:'PRIVACY',label:'개인정보 노출'},
  {value:'OTHER',label:'기타'},
] as const;
export type ReportReason=typeof reportReasons[number]['value'];
export const reportReasonLabel=(value:string)=>reportReasons.find(reason=>reason.value===value)?.label||value;
