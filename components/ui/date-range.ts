/** Calendar helpers for date ranges. Dates are `YYYY-MM-DD` strings interpreted in UTC so no time zone shifts a day. */
export type DateRange={startDate:string;endDate:string};
export type DateRangePreset={id:string;label:string;range:DateRange};

const DAY=86400000;
const toDate=(iso:string)=>new Date(Date.parse(`${iso.slice(0,10)}T00:00:00Z`));
export const toIso=(date:Date)=>date.toISOString().slice(0,10);
export const isValidDate=(iso:string)=>/^\d{4}-\d{2}-\d{2}$/.test(iso)&&Number.isFinite(toDate(iso).getTime())&&toIso(toDate(iso))===iso;
export const addDays=(iso:string,days:number)=>toIso(new Date(toDate(iso).getTime()+days*DAY));
export function addMonths(iso:string,months:number):string{
  const date=toDate(iso),day=date.getUTCDate();
  const first=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+months,1));
  const last=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
  first.setUTCDate(Math.min(day,last));
  return toIso(first);
}
export const startOfMonth=(iso:string)=>`${iso.slice(0,7)}-01`;
export const endOfMonth=(iso:string)=>addDays(startOfMonth(addMonths(startOfMonth(iso),1)),-1);
/** Weeks start on Monday. */
export const startOfWeek=(iso:string)=>addDays(iso,-((toDate(iso).getUTCDay()+6)%7));
export const formatDate=(iso:string)=>iso.replaceAll('-','.');
export const formatRange=(range:DateRange)=>`${formatDate(range.startDate)} ~ ${formatDate(range.endDate)}`;
export const sameRange=(a:DateRange,b:DateRange)=>a.startDate===b.startDate&&a.endDate===b.endDate;
export const monthTitle=(iso:string)=>`${Number(iso.slice(0,4))}년 ${Number(iso.slice(5,7))}월`;
export const dayTitle=(iso:string)=>`${monthTitle(iso)} ${Number(iso.slice(8,10))}일`;
export const weekdayLabels=['월','화','수','목','금','토','일'];

const recent=(today:string,months:number):DateRange=>({startDate:addDays(addMonths(today,-months),1),endDate:today});
/** Presets end at `today`; "전체 기간" starts at `earliest` when records exist. */
export function buildDateRangePresets(today:string,earliest?:string|null):DateRangePreset[]{
  const thisWeek=startOfWeek(today),thisMonth=startOfMonth(today);
  return [
    {id:'this-week',label:'이번주',range:{startDate:thisWeek,endDate:today}},
    {id:'last-week',label:'저번주',range:{startDate:addDays(thisWeek,-7),endDate:addDays(thisWeek,-1)}},
    {id:'this-month',label:'이번달',range:{startDate:thisMonth,endDate:today}},
    {id:'last-month',label:'저번달',range:{startDate:addMonths(thisMonth,-1),endDate:addDays(thisMonth,-1)}},
    {id:'recent-1w',label:'최근 1주일',range:{startDate:addDays(today,-6),endDate:today}},
    {id:'recent-1m',label:'최근 한달',range:recent(today,1)},
    {id:'recent-3m',label:'최근 3개월',range:recent(today,3)},
    {id:'recent-6m',label:'최근 6개월',range:recent(today,6)},
    {id:'recent-1y',label:'최근 1년',range:recent(today,12)},
    {id:'recent-3y',label:'최근 3년',range:recent(today,36)},
    {id:'all',label:'전체 기간',range:{startDate:earliest&&earliest<today?earliest:today,endDate:today}},
  ];
}
/** Six Monday-first weeks covering the month, padded with adjacent-month days so the grid height never changes. */
export function calendarWeeks(month:string):string[][]{
  const first=startOfWeek(startOfMonth(month));
  return Array.from({length:6},(_,week)=>Array.from({length:7},(__,day)=>addDays(first,week*7+day)));
}
