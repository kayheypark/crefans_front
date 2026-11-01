// Service API times arrive as ISO strings; mockup fixtures already hold display text. Shown in KST like the bean history.
export const displayTime=(value?:string|null)=>value&&/^\d{4}-\d{2}-\d{2}T/.test(value)?new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Seoul'}):value||'';
