// 2026-11-16 user decision: preview the exact SMS first; '인증하러 가기' opens the messaging app (mobile); PC gets the OCTOMO QR.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;global.document=global.document||{body:{style:{}},activeElement:null,visibilityState:'visible',addEventListener(){},removeEventListener(){}};
const styles=new Proxy({},{get:(_,k)=>String(k)});
const {PhoneCheckDialog}=loadTypeScript('components/crefans/PhoneCheckDialog.tsx',{'./events.module.css':{__esModule:true,default:styles}});
const ok=d=>({success:true,data:d,errorMessage:null,errorCode:null});
const words=n=>typeof n==='string'?n:Array.isArray(n)?n.map(words).join(''):n&&n.children?words(n.children):'';
function mount(platform,check){let t;act(()=>{t=create(React.createElement(PhoneCheckDialog,{open:true,onClose(){},onVerified(){},check,platform}));});return t;}
const btn=(t,label)=>t.root.findAll(n=>n.type==='button').find(n=>words(n.props.children).trim()===label);
async function toPreview(t){const input=t.root.find(n=>n.type==='input'&&n.props.inputMode==='numeric');act(()=>input.props.onChange({target:{value:'010-1234-5678'}}));await act(async()=>btn(t,'다음').props.onClick());}
test('mobile: preview shows receiver and code, then 인증하러 가기 → 보냈어요; no QR request',async()=>{
 const calls=[],check={start:async(phone,options)=>{calls.push(options);return ok({code:'654321',receiver:'1666-3538',smsUri:'x',expiresAt:'z'});},confirm:async()=>ok({verified:true})};
 const t=mount('ios',check);await toPreview(t);const text=words(t.toJSON());
 assert.match(text,/\+82 1666-3538/);assert.match(text,/문자 메시지 · SMS/);assert.doesNotMatch(text,/채워져 있어요/,'no caption under the preview');assert.match(text,/ㅂ/,'keyboard peek');assert.match(text,/1666-3538/);assert.match(text,/654321/);assert.equal(calls[0],undefined,'mobile does not ask for a QR');
 assert.ok(btn(t,'인증하러 가기'));assert.equal(btn(t,'보냈어요'),undefined,'confirm comes after opening the app');
 act(()=>btn(t,'인증하러 가기').props.onClick());assert.ok(btn(t,'보냈어요'));assert.match(words(t.toJSON()),/다시 열기/);act(()=>t.unmount());
});
test('PC: asks for the QR and shows it with a manual fallback; confirm is available right away',async()=>{
 const calls=[],check={start:async(phone,options)=>{calls.push(options);return ok({code:'111222',receiver:'1666-3538',smsUri:'x',expiresAt:'z',qrCode:'data:image/png;base64,AAAA'});},confirm:async()=>ok({verified:true})};
 const t=mount('desktop',check);await toPreview(t);assert.deepEqual(calls[0],{qr:true});
 assert.ok(t.root.find(n=>n.type==='img'&&n.props.src==='data:image/png;base64,AAAA'));assert.match(words(t.toJSON()),/QR이 안 되면/);assert.ok(btn(t,'보냈어요'));assert.equal(btn(t,'인증하러 가기'),undefined);act(()=>t.unmount());
});
