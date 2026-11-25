const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-02 user decision: continuing an unpaid charge from the wallet shows the same payment conditions and needs the same agreement.
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
test('pending legacy card charges cannot start another card payment',async()=>{
 const paid=[],charge={id:'pending-charge',quantity:30,amount:3300,status:'pending',environment:'test'};
 const model={enabled:true,signedIn:true,basePath:'/service',loading:false,error:'',paymentMethods:{bankTransfer:false,card:true,deadlineHours:24,refundBusinessDays:3},wallet:{page:1,accounts:[],charges:[charge],entries:[]},sent:[],refresh:async()=>{},payCharge:async(id,terms)=>{paid.push([id,terms]);return{success:true,data:{message:'결제창을 열었습니다.'}};}};
 const primitives=loadTypeScript('components/ui/Primitives.tsx');
 const {BeanHistoryPage}=loadTypeScript('components/crefans/BeanWalletPages.tsx',{'next/link':({children,...p})=>React.createElement('a',p,children),'./BeanContext':{useBeans:()=>model},'@/components/ui/SnackbarProvider':{useSnackbarMessage:()=>{const [m,set]=React.useState('');return[m,set];}},'@/components/ui/Primitives':{...primitives,Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null}});
 let tree;await act(async()=>{tree=create(React.createElement(BeanHistoryPage,{kind:'charges'}));});
 const button=label=>tree.root.findAllByType('button').find(b=>text(b)===label);
 try{
  assert.equal(button('결제 계속'),undefined);assert.deepEqual(paid,[]);
 }finally{act(()=>tree.unmount());}
});
