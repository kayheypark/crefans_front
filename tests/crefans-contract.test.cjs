const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const {ApiState}=loadTypeScript('components/crefans/ApiState.tsx',{'./service.module.css':styles,'./avatar.module.css':styles});
test('API envelope renders success data only; failure and loading never expose content',()=>{
 let calls=0;
 const children=data=>{calls++;return React.createElement('p',null,data.title);};
 const render=props=>renderToStaticMarkup(React.createElement(ApiState,{...props,children}));
 const success={success:true,data:{title:'주입된 제목'},errorMessage:null,errorCode:null};
 assert.match(render({response:success}),/주입된 제목/);
 assert.equal(calls,1);
 const error=render({response:{success:false,data:null,errorMessage:'접근 권한이 없습니다.',errorCode:'ACCESS_DENIED'}});
 assert.match(error,/접근 권한이 없습니다/);
 assert.match(error,/ACCESS_DENIED/);
 assert.doesNotMatch(error,/주입된 제목/);
 assert.match(render({response:success,loading:true}),/role="status"/);
 assert.equal(calls,1);
});
test('shared service presentation cannot depend on fixtures, preview containers, or direct APIs',()=>{
 const dir=path.resolve(__dirname,'../components/crefans');
 for(const name of fs.readdirSync(dir,{recursive:true}).filter(name=>name.endsWith('.tsx'))){
   const source=fs.readFileSync(path.join(dir,name),'utf8');
   assert.doesNotMatch(source,/from\s+['"][^'"]*(?:fixtures|PreviewProvider|useMock|\/preview\/|lib\/api)[^'"]*['"]/,name);
   assert.doesNotMatch(source,/\b(?:fetch|XMLHttpRequest)\s*\(|from\s+['"](?:axios|antd|@ant-design)/,name);
   assert.doesNotMatch(source,/['"`]\/preview\//,name);
 }
});
