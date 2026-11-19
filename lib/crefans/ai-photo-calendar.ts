// 2026-11-20 user request: '캘린더에 추가하기' on the daily-refill notice. A standard iCalendar event at the next AI photo refill
// (09:00 KST = 00:00 UTC) with an on-time alert and a link back. Nothing about the visitor is sent or stored.
const SITE='https://crefans.com';
const two=(n:number)=>String(n).padStart(2,'0');
const stamp=(d:Date)=>`${d.getUTCFullYear()}${two(d.getUTCMonth()+1)}${two(d.getUTCDate())}T${two(d.getUTCHours())}${two(d.getUTCMinutes())}00Z`;
export function nextAiPhotoRefill(now=Date.now()){return new Date((Math.floor(now/86400000)+1)*86400000);}
export function aiPhotoRefillCalendar(now=Date.now(),member=false){
 const start=nextAiPhotoRefill(now),end=new Date(start.getTime()+15*60000),link=SITE+(member?'/service/studio':'/service/try');
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//crefans//ai-photo-refill//KO','CALSCALE:GREGORIAN','METHOD:PUBLISH','BEGIN:VEVENT',
  `UID:ai-photo-refill-${stamp(start)}@crefans.com`,`DTSTAMP:${stamp(new Date(now))}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,
  'SUMMARY:크레팬스 AI 사진 이용권이 다시 채워졌어요',`DESCRIPTION:오늘의 이용권으로 AI 사진을 다시 만들어 보세요. ${link}`,`URL:${link}`,
  'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:크레팬스 AI 사진 이용권이 채워졌어요','TRIGGER:PT0M','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
}
