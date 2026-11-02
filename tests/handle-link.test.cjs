const test=require('node:test'),assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
// https://crefans.com/{handle} is printed on every watermark (2026-11-01); it must open the service profile, and a retired
// handle the server resolves must land on the current one (2026-11-02 user decision).
async function visit(handle,answer){
 const calls={api:[]};
 const {GET}=loadTypeScript('app/(main)/[handle]/route.ts',{
  'next/server':{NextResponse:Response},
  '@/lib/seo/site':{publicApi:async path=>{calls.api.push(path);return answer;}},
 });
 const response=await GET(new Request(`https://crefans.com/${handle}`),{params:Promise.resolve({handle})});
 return{...calls,status:response.status,location:response.headers.get('location')};
}
test('a creator handle answers a permanent 308 redirect to the service creator profile',async()=>{
 const calls=await visit('crefans',{status:200,data:{handle:'crefans',isCreator:true}});
 assert.deepEqual(calls.api,['/profiles/crefans']);assert.equal(calls.status,308);assert.equal(calls.location,'/service/creator/crefans');
});
test('an old handle lands on the current handle; a member without a creator page opens the member profile',async()=>{
 assert.equal((await visit('old_name',{status:200,data:{handle:'new_name',isCreator:true}})).location,'/service/creator/new_name');
 assert.equal((await visit('Fan_One',{status:200,data:{handle:'fan_one',isCreator:false}})).location,'/service/member/fan_one');
});
test('unknown or malformed handles are not found and malformed ones never reach the API',async()=>{
 const missing=await visit('nobody',{status:404,data:null});assert.equal(missing.status,404);assert.equal(missing.location,null);
 for(const handle of['ab','../service','a%2Fb','%E0%A4%A','x'.repeat(25)]){const calls=await visit(handle,{status:200,data:{handle:'x',isCreator:true}});assert.equal(calls.status,404);assert.deepEqual(calls.api,[]);}
});
