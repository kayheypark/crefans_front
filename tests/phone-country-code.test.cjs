// 2026-11-23 user report: autofill entered '+821044679801' on signup, the 010-only check kept '인증하기' disabled and nothing was sent.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;global.document=global.document||{body:{style:{}},activeElement:null,visibilityState:'visible',addEventListener(){},removeEventListener(){}};
const {mobileDigits}=loadTypeScript('lib/crefans/sms-link.ts');
const {PhoneCheckDialog}=loadTypeScript('components/crefans/PhoneCheckDialog.tsx',{'./events.module.css':{__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})}});
const words=n=>typeof n==='string'?n:Array.isArray(n)?n.map(words).join(''):n&&n.children?words(n.children):'';
test('+82 / 82 forms become the domestic 010 number; other numbers are left as digits',()=>{
 assert.equal(mobileDigits('+821044679801'),'01044679801');
 assert.equal(mobileDigits('+82 10-4467-9801'),'01044679801');
 assert.equal(mobileDigits('821044679801'),'01044679801');
 assert.equal(mobileDigits('010-4467-9801'),'01044679801');
 assert.equal(mobileDigits('+8221234567'),'8221234567','a Seoul landline stays invalid');
});
test('dialog: a +82 number enables 다음 and starts with the 010 digits',async()=>{
 const calls=[],check={start:async phone=>{calls.push(phone);return{success:true,data:{code:'1',receiver:'1666-3538',smsUri:'x',expiresAt:'z'},errorMessage:null,errorCode:null};},confirm:async()=>({success:true,data:{verified:true}})};
 let t;act(()=>{t=create(React.createElement(PhoneCheckDialog,{open:true,onClose(){},onVerified(){},check,platform:'ios'}));});
 const input=t.root.find(n=>n.type==='input'&&n.props.inputMode==='numeric');act(()=>input.props.onChange({target:{value:'+821044679801'}}));
 const next=t.root.findAll(n=>n.type==='button').find(n=>words(n.props.children).trim()==='다음');assert.equal(next.props.disabled,false);
 await act(async()=>next.props.onClick());assert.deepEqual(calls,['01044679801']);act(()=>t.unmount());
});
test('signup form uses the same normalization for the 인증하기 button',()=>{
 const src=require('node:fs').readFileSync(require('node:path').join(__dirname,'../components/crefans/AccountPages.tsx'),'utf8');
 assert.match(src,/phoneDigits=mobileDigits\(phone\)/);
});
