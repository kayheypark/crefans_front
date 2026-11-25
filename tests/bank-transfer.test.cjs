// 2026-11-16 무통장입금 (콩 충전·AI 이용권·광고상품): card only when /payments/methods says card:true, 입금 안내, refund account.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement,css=new Proxy({},{get:(_,k)=>String(k)});
const words=n=>n==null?'':typeof n==='string'?n:Array.isArray(n)?n.map(words).join(' '):(n.children||[]).map(words).join(' ');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const methods=(bankTransfer,card)=>({bankTransfer,card,deadlineHours:24,refundBusinessDays:3});
const transfer={id:'bt1',kind:'bean',orderId:'c1',amount:3300,status:'awaiting',statusLabel:'입금 대기',depositorName:'홍길동',account:{bankName:'국민은행',accountNumber:'123-45-678901',holder:'크레팬스'},expiresAt:'2026-11-17T06:05:00.000Z',confirmedAt:null,cashReceipt:{type:'income',issued:false}};
const snackbar={'@/components/ui/SnackbarProvider':{useSnackbarMessage:()=>React.useState('')},'@/components/ui/Toast':{Toast:({message})=>message?el('output',null,message):null}};
const dialogs={'@/components/ui/Primitives':{...loadTypeScript('components/ui/Primitives.tsx'),Dialog:({open,title,children})=>open?el('section',{'data-dialog':title},children):null}};
const common={...snackbar,...dialogs,'next/link':({children,...p})=>el('a',p,children),'@/components/ui/InfoTooltip':{InfoTooltip:()=>null}};
const flat=n=>words(n).replace(/\s+/g,'');
const buttons=t=>t.root.findAll(n=>n.type==='button');
const byText=(t,s)=>buttons(t).find(b=>words(b.props.children).trim()===s);
const input=(t,label)=>{const id=t.root.findAll(n=>n.type==='label'&&words(n.props.children).replace(' *','').trim()===label)[0].props.htmlFor;return t.root.find(n=>n.type==='input'&&n.props.id===id);};
const type=(t,label,value)=>act(()=>input(t,label).props.onChange({target:{value}}));
const check=(t,label)=>act(()=>t.root.findAll(n=>n.type==='label').find(l=>words(l.children).includes(label)).findByType('input').props.onChange({target:{checked:true}}));

const lib=loadTypeScript('lib/crefans/bank-transfer.ts');
test('bank transfer form: 입금자명 required (≤20), optional cash receipt by phone or 10-digit business number',()=>{
 const form=patch=>({...lib.emptyBankTransferForm,...patch});
 assert.equal(lib.bankTransferFormValid(form({})),false,'empty depositor');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'   '})),false,'blank depositor');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'가'.repeat(21)})),false,'21 characters');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'가'.repeat(20)})),true);
 assert.equal(lib.bankTransferFormValid(form({depositorName:'홍길동',cashReceipt:true,receiptNumber:''})),false,'receipt asked without number');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'홍길동',cashReceipt:true,receiptNumber:'02-123-4567'})),false,'not a mobile number');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'홍길동',cashReceipt:true,receiptNumber:'010-1234-5678'})),true);
 assert.equal(lib.bankTransferFormValid(form({depositorName:'홍길동',cashReceipt:true,receiptType:'expense',receiptNumber:'123456789'})),false,'9 digits');
 assert.equal(lib.bankTransferFormValid(form({depositorName:'홍길동',cashReceipt:true,receiptType:'expense',receiptNumber:'123-45-67890'})),true);
 assert.deepEqual(lib.bankTransferInput(form({depositorName:' 홍길동 '})),{method:'bank_transfer',depositorName:'홍길동'});
 assert.deepEqual(lib.bankTransferInput(form({depositorName:'홍길동',cashReceipt:true,receiptNumber:'010-1234-5678'})),{method:'bank_transfer',depositorName:'홍길동',cashReceipt:{type:'income',number:'01012345678'}});
 assert.equal(lib.refundAccountValid(lib.emptyRefundAccount),false);
 assert.equal(lib.refundAccountValid({bankName:'국민은행',accountNumber:'12345',holder:'홍길동'}),false,'5 digits');
 assert.equal(lib.refundAccountValid({bankName:'국민은행',accountNumber:'123-45a-678',holder:'홍길동'}),false,'letters');
 assert.equal(lib.refundAccountValid({bankName:'국민은행',accountNumber:'123-456-789012',holder:''}),false,'holder');
 assert.deepEqual(lib.refundAccountInput({bankName:' 국민은행',accountNumber:'123-456-789012',holder:'홍길동 '}),{bankName:'국민은행',accountNumber:'123456789012',holder:'홍길동'});
 assert.equal(lib.kstDateTime('2026-11-17T06:05:00.000Z'),'2026. 11. 17. 오후 3:05 (한국 시간)');
});

const {BankTransferInstructions}=loadTypeScript('components/crefans/BankTransfer.tsx',common);
test('입금 안내 shows amount, bank, account with copy, holder, depositor, exact KST deadline, status and the manual-check rules',async()=>{
 const copied=[];const clipboard=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{clipboard:{writeText:async v=>{copied.push(v);}}}});
 let t;act(()=>{t=create(el(BankTransferInstructions,{transfer}));});
 try{
  const text=words(t.toJSON());
  for(const phrase of['3,300원','국민은행','123-45-678901','크레팬스','홍길동','2026. 11. 17. 오후 3:05 (한국 시간)','입금 대기','24시간','자동으로 취소','운영자가 직접 확인','정확히 같은 금액','소득공제'])assert.ok(text.includes(phrase),phrase);
  await act(async()=>{t.root.findByProps({'aria-label':'계좌번호 복사'}).props.onClick();});
  assert.deepEqual(copied,['123-45-678901']);assert.match(words(t.toJSON()),/계좌번호를 복사했어요/);
  act(()=>t.update(el(BankTransferInstructions,{transfer:{...transfer,status:'cancelled',statusLabel:'주문 취소'}})));
  assert.match(words(t.toJSON()),/주문 취소/);assert.match(words(t.toJSON()),/주문이 취소되었어요/);assert.doesNotMatch(words(t.toJSON()),/정확히 같은 금액/);
 }finally{act(()=>t.unmount());if(clipboard)Object.defineProperty(globalThis,'navigator',clipboard);else delete globalThis.navigator;}
});

function chargePage(patch={}){
 const calls={created:[],paid:[],transfers:[]};
 const model={enabled:true,signedIn:true,mode:'live',basePath:'/service',wallet:{accounts:[]},loading:false,error:'',paymentMethods:methods(true,false),refresh:async()=>{},refreshPaymentMethods:async()=>{},
  createCharge:async(q,key,payment)=>{calls.created.push({q,key,payment});return ok({id:'c1',quantity:q,amount:q*110,status:'pending',environment:payment?'bank':'test',method:payment?'bank_transfer':'card'});},
  payCharge:async id=>{calls.paid.push(id);return ok({message:'결제창'});},bankTransfer:async id=>{calls.transfers.push(id);return ok(transfer);},...patch};
 const {BeanChargePage}=loadTypeScript('components/crefans/BeanChargePage.tsx',{...common,'./BeanContext':{useBeans:()=>model}});
 let t;act(()=>{t=create(el(BeanChargePage));});return{t,calls};
}
const radios=t=>t.root.findAll(n=>n.type==='input'&&n.props.type==='radio');
const selectBeans=(t,q)=>act(()=>radios(t).find(n=>Number(n.props.value)===q).props.onChange({target:{checked:true}}));
const agreeTerms=t=>check(t,'(필수)');
test('콩 충전 only accepts bank transfer regardless of card availability',()=>{
 for(const m of [methods(true,false),methods(true,true),methods(false,true),methods(false,false),null]){
  const {t}=chargePage({paymentMethods:m});
  try{
   const text=words(t.toJSON());
   assert.equal(/결제 준비 중/.test(text),!m?.bankTransfer);
   assert.equal(t.root.findAllByType('form').length,m?.bankTransfer?1:0);
   if(m?.bankTransfer)assert.match(text,/국민은행 무통장입금/);
   assert.ok(!radios(t).some(r=>words(r.parent.children).includes('카드')));
  }finally{act(()=>t.unmount());}
 }
});
test('a bank charge posts method, depositor and cash receipt, opens no payment window and shows the instructions',async()=>{
 const {t,calls}=chargePage();
 try{
  selectBeans(t,30);agreeTerms(t);
  const submit=()=>t.root.findByProps({type:'submit'});
  assert.equal(submit().props.disabled,true,'입금자명 missing');
  type(t,'입금자명','홍길동');assert.equal(submit().props.disabled,false);
  check(t,'현금영수증 신청');assert.equal(submit().props.disabled,true,'receipt number missing');
  type(t,'휴대폰 번호','010-1234-5678');assert.equal(submit().props.disabled,false);
  assert.equal(words(submit().props.children),'무통장입금으로 주문하기');
  await act(async()=>t.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(calls.created.length,1);
  assert.deepEqual(calls.created[0].payment,{method:'bank_transfer',depositorName:'홍길동',cashReceipt:{type:'income',number:'01012345678'}});
  assert.deepEqual(calls.paid,[],'no Toss window for a bank charge');assert.deepEqual(calls.transfers,['c1']);
  assert.equal(t.root.findAllByType('form').length,0);assert.match(words(t.toJSON()),/123-45-678901/);assert.match(words(t.toJSON()),/충전 내역 보기/);
 }finally{act(()=>t.unmount());}
});

const historyMods={...common,'./BeanContext':{useBeans:()=>null}};
const {BeanHistoryView}=loadTypeScript('components/crefans/BeanWalletPages.tsx',historyMods);
const wallet=charges=>({page:1,accounts:[],charges,entries:[],chargesTotal:charges.length});
const historyModel=charges=>({basePath:'/service',wallet:wallet(charges),sent:[],loading:false,error:''});
test('charge history: bank charges read 입금 대기 / 주문 취소, reopen the instructions, and card 결제 계속 only when card is open',()=>{
 const opened=[],bankPending={id:'b1',quantity:30,amount:3300,status:'pending',environment:'bank',method:'bank_transfer',expiresAt:'2026-11-17T06:05:00.000Z',createdAt:'2026-11-16T06:05:00.000Z'};
 const charges=[bankPending,{...bankPending,id:'b2',status:'cancelled'},{id:'k1',quantity:10,amount:1100,status:'pending',environment:'test',method:'card',createdAt:'2026-11-16T06:00:00.000Z'}];
 for(const cardAvailable of[false,true]){
  let t;act(()=>{t=create(el(BeanHistoryView,{kind:'charges',model:historyModel(charges),onPay:()=>{},onPage:()=>{},cardAvailable,onInstructions:c=>opened.push(c.id)}));});
  try{
   const text=words(t.toJSON());
   assert.match(text,/입금 대기/);assert.match(text,/주문 취소/);assert.match(text,/2026\. 11\. 17\. 오후 3:05 \(한국 시간\)까지 입금/);
   assert.equal(!!byText(t,'결제 계속'),false);
   assert.equal(buttons(t).filter(b=>words(b.props.children).trim()==='입금 안내 보기').length,1,'only the waiting bank charge');
   act(()=>byText(t,'입금 안내 보기').props.onClick());
  }finally{act(()=>t.unmount());}
 }
 assert.deepEqual(opened,['b1','b1']);
});
test('refunding a bank-transfer charge requires the refund account and explains the 3-business-day manual transfer',()=>{
 const confirmed=[],quote={chargeId:'b1',quantity:30,gross:3300,deduction:0,amount:3300,fullRefundWindow:true,waived:false};
 const render=refund=>{let t;act(()=>{t=create(el(BeanHistoryView,{kind:'charges',model:historyModel([]),onPay:()=>{},onPage:()=>{},refund,onRefundConfirm:a=>confirmed.push(a)}));});return t;};
 let t=render({quote,error:'',bank:true,businessDays:3});
 try{
  const confirm=()=>byText(t,'3,300원 환불 신청');
  assert.match(flat(t.toJSON()),/영업일기준3일/);assert.match(words(t.toJSON()),/환불받을 계좌/);
  assert.equal(confirm().props.disabled,true);
  type(t,'은행','국민은행');type(t,'계좌번호','123-456-789012');assert.equal(confirm().props.disabled,true,'holder missing');
  type(t,'예금주','홍길동');assert.equal(confirm().props.disabled,false);
  act(()=>confirm().props.onClick());assert.deepEqual(confirmed,[{bankName:'국민은행',accountNumber:'123456789012',holder:'홍길동'}]);
 }finally{act(()=>t.unmount());}
 t=render({quote,error:''});
 try{assert.doesNotMatch(words(t.toJSON()),/환불받을 계좌/,'card refunds go back to the card');assert.equal(byText(t,'3,300원 환불 신청').props.disabled,false);act(()=>byText(t,'3,300원 환불 신청').props.onClick());assert.deepEqual(confirmed.at(-1),undefined);}finally{act(()=>t.unmount());}
});

const ui={Action:({children,variant,...p})=>el('button',p,children),Empty:({title})=>el('section',null,title),PageTitle:({children,action})=>el('header',null,el('h1',null,children),action)};
const studio={...common,'../ServiceUI':ui,'@/components/ui/LoadingSpinner':{LoadingSpinner:()=>null},'@/components/ui/useDelayedLoading':{useDelayedLoading:()=>false},'@/components/ui/DialogActions':{DialogActions:({children})=>el('div',null,children)},'../BackButton':{BackButton:()=>null},'./shop.module.css':{__esModule:true,default:css},'./advertising.module.css':{__esModule:true,default:css}};
const {AdvertisingPage}=loadTypeScript('components/crefans/studio/AdvertisingPage.tsx',studio);
const {ShopPage}=loadTypeScript('components/crefans/studio/ShopPage.tsx',{...studio,'./AdvertisingPage':{AdvertisingPage}});
const product={id:'s1',name:'AI 사진 10회권',description:'',benefit:'AI 사진 10회 생성',amount:1000,validityLabel:'구매 후 30일',terms:'조건',termsVersion:'v',onSale:true,version:1};
const shopModel=patch=>({products:[product],orders:[],loading:false,error:'',paymentMethods:methods(true,false),refresh:async()=>{},refreshPaymentMethods:async()=>{},purchase:async()=>({success:false}),refund:async()=>({success:false}),...patch});
test('AI 이용권: card hidden when card:false, bank order shows the instructions, bank refund needs the account',async()=>{
 const purchases=[],refunds=[];
 const order={id:'o1',name:'AI 사진 10회권',amount:1000,benefit:'AI 사진 10회 생성',createdAt:'2026-11-16T06:00:00.000Z',quantity:10,remaining:10,status:'pending',statusLabel:'입금 대기',method:'bank_transfer'};
 let t;act(()=>{t=create(el(ShopPage,{basePath:'/service/studio',model:shopModel({purchase:async(p,payment)=>{purchases.push(payment);return ok({message:'접수',order});},bankTransfer:async()=>ok({...transfer,kind:'ai-shop',amount:1000})})}));});
 try{
  act(()=>buttons(t).find(b=>b.props['aria-label']==='AI 사진 10회권 상품 안내').props.onClick());
  assert.equal(radios(t).filter(r=>words(r.parent.children).includes('카드')).length,0);assert.match(words(t.toJSON()),/무통장입금/);
  check(t,'상품 내용과');const pay=()=>byText(t,'1,000원 무통장입금 주문');assert.equal(pay().props.disabled,true,'입금자명 missing');
  type(t,'입금자명','홍길동');assert.equal(pay().props.disabled,false);
  await act(async()=>pay().props.onClick());
  assert.deepEqual(purchases,[{method:'bank_transfer',depositorName:'홍길동'}]);assert.ok(t.root.findByProps({'data-dialog':'입금 안내'}));assert.match(words(t.toJSON()),/123-45-678901/);
 }finally{act(()=>t.unmount());}
 // Methods closed: 결제 준비 중 and no pay button.
 act(()=>{t=create(el(ShopPage,{basePath:'/service/studio',model:shopModel({paymentMethods:methods(false,false)})}));});
 try{act(()=>buttons(t).find(b=>b.props['aria-label']==='AI 사진 10회권 상품 안내').props.onClick());assert.match(words(t.toJSON()),/결제 준비 중/);assert.equal(buttons(t).some(b=>/주문|결제하기/.test(words(b.props.children))),false);}finally{act(()=>t.unmount());}
 const paid={...order,status:'paid',statusLabel:'구매 완료',remaining:4};
 act(()=>{t=create(el(ShopPage,{basePath:'/service/studio',model:shopModel({orders:[paid],refund:async(o,account)=>{refunds.push([o.id,account]);return ok({...paid,status:'refunding'});}})}));});
 try{
  act(()=>byText(t,'구매 내역').props.onClick());act(()=>byText(t,'잔여 이용권 환불').props.onClick());
  assert.match(flat(t.toJSON()),/영업일기준3일/);assert.equal(byText(t,'환불 요청').props.disabled,true);
  type(t,'은행','국민은행');type(t,'계좌번호','123456789012');type(t,'예금주','홍길동');assert.equal(byText(t,'환불 요청').props.disabled,false);
  await act(async()=>byText(t,'환불 요청').props.onClick());assert.deepEqual(refunds,[['o1',{bankName:'국민은행',accountNumber:'123456789012',holder:'홍길동'}]]);
 }finally{act(()=>t.unmount());}
});

test('광고상품: purchaseReady comes from methods.bankTransfer and the order posts the bank transfer input',async()=>{
 const requests=[];let answer=methods(true,false);
 const platformRequest=async(path,body)=>{requests.push([path,body]);if(path==='/payments/methods')return ok(answer);if(path==='/studio/advertising/orders'&&body)return ok({id:'ad1',status:'pending'});return ok([]);};
 const api={'@/lib/api/platform':{platformRequest},'./platform':{platformRequest}};
 const {useAdvertisingModel}=loadTypeScript('features/service/useAdvertisingModel.ts',api);
 for(const [bank,ready] of [[true,true],[false,false]]){
  answer=methods(bank,false);let model,t;function Probe(){model=useAdvertisingModel();return null;}
  await act(async()=>{t=create(el(Probe));});
  try{
   assert.equal(model.purchaseReady,ready);assert.equal(model.guidance===undefined,ready,'결제 준비 중 guidance only while closed');
   if(ready){requests.length=0;await act(async()=>{await model.purchase({id:'p1',version:2},{method:'bank_transfer',depositorName:'홍길동'});});
    const [path,body]=requests.find(([p,b])=>p==='/studio/advertising/orders'&&b);assert.equal(path,'/studio/advertising/orders');assert.equal(body.method,'bank_transfer');assert.equal(body.depositorName,'홍길동');assert.equal(body.productId,'p1');assert.equal(body.version,2);assert.ok(body.requestId);}
  }finally{act(()=>t.unmount());}
 }
});
test('광고상품 history: statusLabel, 입금 안내 for pending, 사용 only when ready, 환불 신청 only when refundable',()=>{
 const base={name:'주목할 크리에이터 7일',amount:11000,durationDays:7,createdAt:'2026-11-16T06:00:00.000Z',method:'bank_transfer'};
 const orders=[{...base,id:'a',status:'pending',statusLabel:'입금 대기',useStatus:'unavailable',refundable:false},{...base,id:'b',status:'paid',statusLabel:'구매 완료',useStatus:'ready',refundable:true},{...base,id:'c',status:'cancelled',statusLabel:'주문 취소',useStatus:'unavailable',refundable:false}];
 const model={products:[],orders,loading:false,error:'',purchaseReady:true,paymentMethods:methods(true,false),refresh:async()=>{},purchase:async()=>({success:false}),activate:async()=>({success:false}),bankTransfer:async()=>ok({...transfer,kind:'ad'}),refund:async()=>({success:false})};
 let t;act(()=>{t=create(el(AdvertisingPage,{model,basePath:'/service/studio',embedded:true,view:'orders'}));});
 try{
  const text=words(t.toJSON());assert.match(text,/입금 대기/);assert.match(text,/주문 취소/);assert.match(text,/사용 전/);
  const count=label=>buttons(t).filter(b=>words(b.props.children).trim()===label).length;
  assert.equal(count('입금 안내 보기'),1);assert.equal(count('사용'),1);assert.equal(count('환불 신청'),1);
  act(()=>byText(t,'환불 신청').props.onClick());const dialog=t.root.findByProps({'data-dialog':'광고상품 환불 신청'});
  assert.match(flat(dialog.children),/영업일기준3일/);assert.equal(dialog.findAll(n=>n.type==='button'&&words(n.props.children).trim()==='환불 신청')[0].props.disabled,true);
 }finally{act(()=>t.unmount());}
});
test('live bean model sends the bank transfer input with the charge and the refund account with the refund',async()=>{
 const requests=[];const platformRequest=async(path,body)=>{requests.push([path,body]);if(path==='/payments/methods?kind=bean')return ok(methods(true,false));if(path.startsWith('/beans/wallet'))return ok({page:1,accounts:[],charges:[],entries:[]});if(path.startsWith('/beans/tips'))return ok({items:[],total:0});return ok({});};
 const {useBeansModel}=loadTypeScript('features/service/useBeansModel.ts',{'@/lib/api/platform':{platformRequest},'./platform':{platformRequest}});
 let model,t;function Probe(){model=useBeansModel(true,true,[]);return null;}
 await act(async()=>{t=create(el(Probe));});
 try{
  assert.deepEqual(model.paymentMethods,methods(true,false));requests.length=0;
  const payment={method:'bank_transfer',depositorName:'홍길동',cashReceipt:{type:'expense',number:'1234567890'}};
  await act(async()=>{await model.createCharge(30,'req-1',payment);});
  assert.deepEqual(requests,[['/beans/charges',{quantity:30,requestId:'req-1',method:'bank_transfer',depositorName:'홍길동',cashReceipt:{type:'expense',number:'1234567890'}}]]);
  requests.length=0;const account={bankName:'국민은행',accountNumber:'123456789012',holder:'홍길동'};
  await act(async()=>{await model.refundCharge('c1','req-2',account);await model.bankTransfer('c1');});
  assert.deepEqual(requests,[['/beans/charges/c1/refund',{requestId:'req-2',refundAccount:account}],['/payments/bank-transfer/bean/c1',undefined]]);
 }finally{act(()=>t.unmount());}
});

// 2026-11-17 user decision: '입금했어요' alerts operators once; the button turns into a sent state and is not shown without the action.
test('입금했어요 sends one report, then shows it was sent',async()=>{
 let calls=0;const onReportDeposit=async()=>{calls++;return ok({reported:true,message:'입금했다고 운영팀에 알렸어요. 입금이 확인되면 바로 지급돼요.'});};
 let t;act(()=>{t=create(el(BankTransferInstructions,{transfer,onReportDeposit}));});
 const button=()=>t.root.findAll(n=>n.type==='button'&&/입금했어요|입금 알림을 보냈어요|알리는 중/.test(words(n.children)))[0];
 assert.match(words(button().children),/입금했어요/);
 await act(async()=>{await button().props.onClick();});await act(async()=>{await button().props.onClick();});
 assert.equal(calls,1,'reported once');assert.equal(button().props.disabled,true);assert.match(words(button().children),/입금 알림을 보냈어요/);
 act(()=>t.update(el(BankTransferInstructions,{transfer})));assert.equal(t.root.findAll(n=>n.type==='button'&&/입금했어요/.test(words(n.children))).length,0,'no button without the action');
 act(()=>t.unmount());
});
