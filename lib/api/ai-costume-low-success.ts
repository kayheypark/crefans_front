/** 2026-11-23 user decision: costumes tagged "성공률 낮음" are recounted daily by the server worker (public, no cookie).
 * null when the server has no result yet or cannot be reached; callers then keep the built-in list. One request per page load. */
let pending:Promise<readonly string[]|null>|undefined;
export function requestLowSuccessCostumeIds():Promise<readonly string[]|null>{
 pending??=fetch('/api/v1/ai-photo/low-success-costumes',{credentials:'omit'}).then(response=>response.json()).then(body=>{const ids=body?.success?body.data?.ids:null;return Array.isArray(ids)&&ids.every(id=>typeof id==='string')?ids:null;}).catch(()=>null);
 return pending;
}
