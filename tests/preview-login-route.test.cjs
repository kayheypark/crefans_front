const test=require('node:test'),assert=require('node:assert/strict');
const {scryptSync}=require('node:crypto');
const {loadTypeScript}=require('./load-typescript.cjs');
const salt='a'.repeat(32),password='test-fixture-only';
function request(body,origin='https://preview.example.test'){return new Request('https://preview.example.test/api/preview/v1/login',{method:'POST',headers:{origin,host:'preview.example.test','Content-Type':'application/json'},body:JSON.stringify(body)});}
test('server-only preview verifier grants only a mock ID and rejects wrong credentials and cross-origin requests',async()=>{
 const prior=process.env.CREFANS_PREVIEW_LOGIN_HASH;process.env.CREFANS_PREVIEW_LOGIN_HASH=salt+':'+scryptSync(password,salt,64).toString('hex');
 const {POST}=loadTypeScript('app/api/preview/v1/login/route.ts');
 try{
  const response=await POST(request({email:'MOKA@gmail.com',password}));assert.equal(response.status,200);assert.deepEqual(await response.json(),{success:true,data:{creatorId:'moka'},errorMessage:null,errorCode:null});assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('cache-control'),'no-store');
  assert.equal((await POST(request({email:'moka@gmail.com',password:'incorrect-password'}))).status,401);
  assert.equal((await POST(request({email:'someone@example.test',password}))).status,401);
  assert.equal((await POST(request({email:'moka@gmail.com',password},'https://other.example.test'))).status,403);
  assert.equal((await POST(request({},'not a URL'))).status,403);
  assert.equal((await POST(request({email:'moka@gmail.com',password:'a'.repeat(2049)}))).status,400);
 }finally{if(prior===undefined)delete process.env.CREFANS_PREVIEW_LOGIN_HASH;else process.env.CREFANS_PREVIEW_LOGIN_HASH=prior;}
});
test('unconfigured preview login fails closed and a worker limits attempts',async()=>{
 const prior=process.env.CREFANS_PREVIEW_LOGIN_HASH;delete process.env.CREFANS_PREVIEW_LOGIN_HASH;const {POST}=loadTypeScript('app/api/preview/v1/login/route.ts');
 try{for(let i=0;i<20;i++)assert.equal((await POST(request({}))).status,503);assert.equal((await POST(request({}))).status,429);}finally{if(prior!==undefined)process.env.CREFANS_PREVIEW_LOGIN_HASH=prior;}
});
