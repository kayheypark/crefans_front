// Deliberately never transmit message, URL, query, form values or raw stack text.
export function browserErrorPayload(error:unknown){
 const value=error as {name?:string;stack?:string;requestId?:string}|null;
 const errorType=['Error','TypeError','RangeError','ReferenceError','SyntaxError','URIError','EvalError'].includes(value?.name||'')?value!.name:'BrowserError';
 const frames=String(value?.stack||'').split('\n').flatMap(line=>{const frame=line.match(/_next\/static\/[A-Za-z0-9_./-]+:\d+:\d+/);return frame?[frame[0]]:[];}).slice(0,12);
 return{errorType,frames,...(/^[a-f0-9-]{36}$/i.test(value?.requestId||'')?{requestId:value!.requestId}:{})};
}
const sent=new Set<string>();let count=0;
export function reportBrowserError(error:unknown){
 const payload=browserErrorPayload(error),key=JSON.stringify(payload);if(sent.has(key)||count>=5)return;sent.add(key);count++;
 void fetch('/api/v1/telemetry/browser-errors',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:key,keepalive:true}).catch(()=>{});
}
