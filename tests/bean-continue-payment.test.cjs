const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-02 user decision: continuing an unpaid charge from the wallet shows the same payment conditions and needs the same agreement.
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
test('continuing an unpaid charge opens the payment conditions and pays only after the agreement, sending its version',async()=>{
 const paid=[],charge={id:'pending-charge',quantity:30,amount:3300,status:'pending',environment:'test'};
 const model={enabled:true,signedIn:true,basePath:'/service',loading:false,error:'',wallet:{page:1,accounts:[],charges:[charge],entries:[]},sent:[],refresh:async()=>{},payCharge:async(id,terms)=>{paid.push([id,terms]);return{success:true,data:{message:'결제창을 열었습니다.'}};}};
 const primitives=loadTypeScript('components/ui/Primitives.tsx');
 const {BeanHistoryPage}=loadTypeScript('components/crefans/BeanWalletPages.tsx',{'next/link':({children,...p})=>React.createElement('a',p,children),'./BeanContext':{useBeans:()=>model},'@/components/ui/SnackbarProvider':{useSnackbarMessage:()=>{const [m,set]=React.useState('');return[m,set];}},'@/components/ui/Primitives':{...primitives,Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null}});
 let tree;await act(async()=>{tree=create(React.createElement(BeanHistoryPage,{kind:'charges'}));});
 const button=label=>tree.root.findAllByType('button').find(b=>text(b)===label);
 try{
  act(()=>button('결제 계속').props.onClick());const dialog=tree.root.findByProps({'data-dialog':'결제 계속'});
  for(const phrase of['결제 전 확인','30콩 충전','3,300원 (VAT 포함)','7일 이내','유효기간'])assert.ok(text(dialog).includes(phrase),phrase);
  assert.equal(button('결제창 열기').props.disabled,true);assert.deepEqual(paid,[]);
  act(()=>tree.root.findByProps({type:'checkbox'}).props.onChange({target:{checked:true}}));assert.equal(button('결제창 열기').props.disabled,false);
  await act(async()=>{button('결제창 열기').props.onClick();});assert.deepEqual(paid,[['pending-charge','2026-11-02.1']]);assert.equal(tree.root.findAllByProps({'data-dialog':'결제 계속'}).length,0);
 }finally{act(()=>tree.unmount());}
});
