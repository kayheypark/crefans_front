// AI 가이드(고객센터 떠 있는 버튼) 공용 규칙. 가이드 사이트 AdvisorChat.astro 와 같은 기준을 유지한다.
// 서버 계약: crefans_server docs/platform-api.md `POST /guide/advisor`.
export type AdvisorSource={title:string;section:string;url:string};
export type AdvisorAnswer={answer:string;sources:AdvisorSource[];found:boolean};
export type AdvisorTurn={q:string;a:AdvisorAnswer};
export type AdvisorInline={text:string;bold:boolean;mark?:true};// mark: the core answer sentence (==…== from the server)
export type AdvisorBlock={type:'paragraph';lines:AdvisorInline[]}|{type:'table';head:AdvisorInline[][];rows:AdvisorInline[][][]};

export const ADVISOR_QUESTION_MAX=500;
export const ADVISOR_STORE='crefans-advisor-chat';
const CLIENT_STORE='crefans-advisor-client';
/** 25 pairs = 50 messages, as stated in the privacy notice. */
export const ADVISOR_MAX_TURNS=25;

/** Same quick check as the server: e-mail addresses and 10+ digit numbers (phone, card, account). */
export const containsPersonalData=(value:string)=>/[^\s@]+@[^\s@]+\.[a-z]{2,}/i.test(value)||/\d{10,}/.test(value.replace(/[\s-]/g,''));

/** Source links may only point to this service or the guide. */
export const safeAdvisorUrl=(url:unknown):url is string=>typeof url==='string'&&(/^\/(?!\/)/.test(url)||/^https:\/\/(guide\.)?crefans\.com\//.test(url));

export function isAdvisorAnswer(value:any):value is AdvisorAnswer{
 return typeof value?.answer==='string'&&typeof value?.found==='boolean'&&Array.isArray(value?.sources)&&
  value.sources.every((x:any)=>typeof x?.title==='string'&&typeof x?.section==='string'&&safeAdvisorUrl(x?.url));
}

// Answer formatting: only **bold**, the ==core sentence== highlight (2026-11-12) and pipe tables (| a | b |).
// Everything else stays literal text; nothing is rendered as HTML. A stray '==' is dropped.
const boldParts=(text:string,mark:boolean):AdvisorInline[]=>text.split(/\*\*([^*\n]+?)\*\*/).map((part,i)=>mark?{text:part,bold:i%2===1,mark:true as const}:{text:part,bold:i%2===1}).filter(part=>part.text);
export function parseInline(text:string):AdvisorInline[]{
 return text.split(/==(?!\s)([^=\n]+?)(?<!\s)==/).flatMap((part,i)=>i%2?boldParts(part,true):boldParts(part.replace(/==/g,''),false));
}
const isRow=(line:string)=>/^\s*\|.*\|\s*$/.test(line);
const isSeparator=(line:string)=>/^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line);
const cells=(line:string)=>line.trim().replace(/^\||\|$/g,'').split('|').map(cell=>cell.trim());
export function parseAnswer(text:string):AdvisorBlock[]{
 const blocks:AdvisorBlock[]=[],lines=text.split('\n');let paragraph:string[]=[];
 const flush=()=>{const value=paragraph.join('\n').trim();if(value)blocks.push({type:'paragraph',lines:parseInline(value)});paragraph=[];};
 for(let i=0;i<lines.length;){
  if(isRow(lines[i])&&isRow(lines[i+1]||'')){
   flush();const start=i;while(i<lines.length&&isRow(lines[i]))i++;
   const rows=lines.slice(start,i).filter(line=>!isSeparator(line)).map(cells),width=rows[0].length;
   blocks.push({type:'table',head:rows[0].map(parseInline),rows:rows.slice(1).map(row=>Array.from({length:width},(_,c)=>parseInline(row[c]||'')))});
  }else paragraph.push(lines[i++]);
 }
 flush();return blocks;
}
/** Words the typing reveal steps through, in render order (paragraphs, table head, table cells). */
export const wordsOf=(text:string)=>text.split(/(\s+)/).filter(part=>part.trim()).length;
export function blockWordCount(blocks:AdvisorBlock[]){
 const inline=(parts:AdvisorInline[])=>parts.reduce((sum,part)=>sum+wordsOf(part.text),0);
 return blocks.reduce((sum,block)=>sum+(block.type==='paragraph'?inline(block.lines):[...block.head,...block.rows.flat()].reduce((n,cell)=>n+inline(cell),0)),0);
}

export function loadAdvisorTurns():AdvisorTurn[]{
 try{const value=JSON.parse(localStorage.getItem(ADVISOR_STORE)||'[]');return Array.isArray(value)?value.filter((t:any)=>typeof t?.q==='string'&&isAdvisorAnswer(t?.a)).slice(-ADVISOR_MAX_TURNS):[];}catch{return[];}
}
export function saveAdvisorTurns(turns:AdvisorTurn[]){try{localStorage.setItem(ADVISOR_STORE,JSON.stringify(turns.slice(-ADVISOR_MAX_TURNS)));}catch{}}
export function clearAdvisorTurns(){try{localStorage.removeItem(ADVISOR_STORE);}catch{}}

/** Anonymous per-browser id for the server's daily question quota (random; not linked to any account). Storage may be blocked. */
export function advisorClientId(){
 try{let id=localStorage.getItem(CLIENT_STORE);if(!id||!/^[A-Za-z0-9_-]{16,64}$/.test(id)){id=crypto.randomUUID().replace(/-/g,'');localStorage.setItem(CLIENT_STORE,id);}return id;}catch{return undefined;}
}

/** Errors the user cannot fix by asking again (input rules, daily limit). */
export const ADVISOR_FINAL_ERRORS=['INVALID_INPUT','PERSONAL_DATA','OUT_OF_SCOPE','UNSAFE_INPUT','DAILY_LIMIT'];
