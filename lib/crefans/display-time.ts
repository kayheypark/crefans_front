// Service API times arrive as ISO strings; mockup fixtures already hold display text. Shown in KST like the bean history.
export const displayTime=(value?:string|null)=>value&&/^\d{4}-\d{2}-\d{2}T/.test(value)?new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'}):value||'';

// Comments keep ISO timestamps for the full-date tooltip and use a compact relative label.
export function displayRelativeTime(value?:string|null,now=Date.now()){
 if(!value||!/^\d{4}-\d{2}-\d{2}T/.test(value))return value||'';
 const elapsed=Math.max(0,now-Date.parse(value));if(!Number.isFinite(elapsed))return '';
 const minutes=Math.floor(elapsed/60000);
 return minutes<1?'방금':minutes<60?`${minutes}분 전`:minutes<1440?`${Math.floor(minutes/60)}시간 전`:`${Math.floor(minutes/1440)}일 전`;
}
