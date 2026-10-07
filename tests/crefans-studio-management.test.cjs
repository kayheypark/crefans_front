const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const now='2026-09-12T09:00:00.000Z';
const initialContent={id:'draft1',title:'Draft title',body:'Draft body',media:[],commentsEnabled:true,accessPlanId:'plan1',status:'draft',scheduledAt:null,updatedAt:now};
const plan={id:'plan1',name:'Original plan',price:9900,benefits:['Original benefit'],active:true,version:1};
const subscriber={id:'person1',name:'Injected fan',handle:'injected',planId:'plan1',planSnapshot:{name:'Original plan',price:9900,benefits:['Original benefit'],version:1},status:'active',joinedAt:'2026-08-12',renewAt:'2026-10-12'};
function fixtureHook(){
  const {useMockManagement}=loadTypeScript('components/preview/studio/useMockManagement.ts',{
    'next/navigation':{useSearchParams:()=>new URLSearchParams('plan=plan1&member=person1')},
    './management-fixtures':{managementNow:now,managementContents:[initialContent],managementMemberships:[plan],managementSubscribers:[subscriber]},
  });
  let current,tree;
  function Probe(){current=useMockManagement();return null;}
  act(()=>{tree=create(React.createElement(Probe));});
  return {get model(){return current;},close(){act(()=>tree.unmount());}};
}
const {ContentManagementPage,ContentEditorPage,MembershipManagementPage,SubscriberManagementPage}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',{
  './social.module.css':styles,'./chip-row.module.css':styles,'./content-post-preview.module.css':styles,'./phone-frame.module.css':styles,
  './management.module.css':styles,'./benefits-field.module.css':styles,'./data-table.module.css':styles,'./pagination.module.css':styles,'./media-upload.module.css':styles,'./toggle.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./optional-image.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./image-upload.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./toggle.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./service.module.css':styles,'./ui.module.css':styles,'./avatar.module.css':styles,'./select.module.css':styles,'./field.module.css':styles,
  'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),
  '@/components/ui/Primitives':{
    ...loadTypeScript('components/ui/Primitives.tsx',{'./ui.module.css':styles,'./field.module.css':styles,'./select.module.css':styles,'./choice.module.css':styles}),
    Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null,
  },
});
const json=tree=>JSON.stringify(tree.toJSON());
function button(tree,name){return tree.root.findAllByType('button').find(node=>node.children.includes(name));}
function mount(Page,model,id){let tree;act(()=>{tree=create(React.createElement(Page,{model,basePath:'/studio',id}));});return tree;}

test('draft publication preserves its identifier and schedules only after injected now',async()=>{
  const probe=fixtureHook();let response;
  await act(async()=>{response=await probe.model.actions.saveContent({...initialContent,status:'scheduled',scheduledAt:'2026-09-12T08:59:00.000Z'});});
  assert.equal(response.success,false);assert.equal(probe.model.contents[0].status,'draft');
  await act(async()=>{response=await probe.model.actions.saveContent({...initialContent,status:'scheduled',scheduledAt:'2026-09-13T09:00:00.000Z'});});
  assert.equal(response.success,true);assert.equal(probe.model.contents[0].scheduledAt,'2026-09-13T09:00:00.000Z');
  await act(async()=>{response=await probe.model.actions.saveContent({...initialContent,status:'published',scheduledAt:null});});
  assert.equal(response.success,true);assert.equal(probe.model.contents.length,1);assert.equal(probe.model.contents[0].id,'draft1');
  assert.equal(probe.model.contents[0].status,'published');assert.equal(probe.model.contents[0].scheduledAt,null);
  probe.close();
});

test('invalid content and unsafe media addresses leave the existing content unchanged',async()=>{
  const probe=fixtureHook();const original=JSON.stringify(probe.model.contents);let result;
  for(const input of [{...initialContent,title:''},{...initialContent,status:'published',body:''},{...initialContent,media:[{id:'m1',type:'image',url:'javascript:alert(1)'}]},{...initialContent,media:Array.from({length:11},(_,index)=>({id:`m${index}`,type:'image',url:'/ok.png'}))},{...initialContent,media:[{id:'m1',type:'gif',url:'/ok.png'}]},{...initialContent,accessPlanId:'missing'}]){
    await act(async()=>{result=await probe.model.actions.saveContent(input);});
    assert.equal(result.success,false);assert.equal(JSON.stringify(probe.model.contents),original);
  }
  probe.close();
});

test('membership edits and archiving preserve existing subscriber contract snapshots',async()=>{
  const probe=fixtureHook();const original=JSON.stringify(probe.model.subscribers);let result;
  await act(async()=>{result=await probe.model.actions.saveMembership({id:'plan1',name:'New plan',price:19900,benefits:['New benefit']});});
  assert.equal(result.success,true);assert.equal(probe.model.memberships[0].version,2);assert.equal(probe.model.memberships[0].price,19900);
  assert.equal(JSON.stringify(probe.model.subscribers),original);
  await act(async()=>{result=await probe.model.actions.setMembershipActive('plan1',false);});
  assert.equal(result.success,true);assert.equal(probe.model.memberships[0].active,false);
  assert.equal(JSON.stringify(probe.model.subscribers),original);
  assert.equal(subscriber.planSnapshot.price,9900);assert.equal(plan.version,1);
  probe.close();
});

test('content deletion is delegated only after the confirmation action',async()=>{
  const probe=fixtureHook(),calls=[];
  const model={...probe.model,actions:{...probe.model.actions,deleteContent:async id=>{calls.push(id);return {success:true,data:{message:'Deleted by action'},errorMessage:null,errorCode:null};}}};
  const tree=mount(ContentManagementPage,model);
  assert.equal(calls.length,0);act(()=>button(tree,'삭제').props.onClick());assert.equal(calls.length,0);
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='게시물 삭제').length,1);
  await act(async()=>button(tree,'삭제하기').props.onClick());
  assert.deepEqual(calls,['draft1']);assert.match(json(tree),/Deleted by action/);
  act(()=>tree.unmount());probe.close();
});

test('subscriber detail displays its injected historical price rather than the edited plan price',()=>{
  const probe=fixtureHook();const tree=mount(SubscriberManagementPage,{...probe.model,memberships:[{...plan,price:49900,version:2}]});
  assert.match(json(tree),/Injected fan/);assert.match(json(tree),/₩9,900/);assert.doesNotMatch(json(tree),/₩49,900/);
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='구독자 상세').length,1);
  assert.match(json(tree),/Original benefit/);
  act(()=>tree.update(React.createElement(SubscriberManagementPage,{model:{...probe.model,subscribers:[],memberships:[],selectedSubscriberId:'unknown'},basePath:'/studio'})));
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='구독자 상세').length,0);assert.match(json(tree),/조건에 맞는 구독자가 없어요/);
  act(()=>tree.unmount());probe.close();
});

test('unknown editor IDs and empty membership data render safe empty states',()=>{
  const probe=fixtureHook();const editor=mount(ContentEditorPage,probe.model,'unknown');
  assert.match(json(editor),/게시물을 찾을 수 없어요/);assert.equal(editor.root.findAllByType('form').length,0);
  const memberships=mount(MembershipManagementPage,{...probe.model,memberships:[],subscribers:[]});
  assert.match(json(memberships),/가입 가능한 멤버십이 없어요/);assert.doesNotMatch(json(memberships),/Original plan/);
  act(()=>{editor.unmount();memberships.unmount();});probe.close();
});

test('custom membership filter keeps the empty value as all memberships and delegates string values',()=>{
  const probe=fixtureHook();
  const secondPlan={...plan,id:'plan2',name:'Second plan'};
  const secondSubscriber={...subscriber,id:'person2',name:'Second fan',handle:'second',planId:'plan2',planSnapshot:{...subscriber.planSnapshot,name:'Second plan'}};
  const tree=mount(SubscriberManagementPage,{...probe.model,memberships:[plan,secondPlan],subscribers:[subscriber,secondSubscriber],selectedSubscriberId:null,selectedSubscriberPlanId:'plan1'});
  const filter=()=>tree.root.findAll(node=>node.type?.name==='SelectField'&&node.props.label==='멤버십 필터')[0];
  assert.deepEqual(filter().props.options[0],{value:'',label:'모든 멤버십'});
  assert.doesNotMatch(json(tree),/Second fan/);
  act(()=>filter().props.onChange(''));
  assert.match(json(tree),/Injected fan/);assert.match(json(tree),/Second fan/);
  act(()=>filter().props.onChange('plan2'));
  assert.doesNotMatch(json(tree),/Injected fan/);assert.match(json(tree),/Second fan/);
  act(()=>tree.unmount());probe.close();
});

function membershipField(tree,label){const control=tree.root.findAllByType('label').find(item=>item.children.includes(label));return tree.root.findAllByType('input').find(input=>input.props.id===control.props.htmlFor);}
function changeMembershipField(tree,label,value){act(()=>membershipField(tree,label).props.onChange({target:{value}}));}
const benefitAction=(tree,label)=>tree.root.findAllByType('button').find(item=>item.props['aria-label']===label);

test('membership editing saves individually edited, added and removed benefits as a trimmed array',async()=>{
 const probe=fixtureHook(),calls=[],original={...plan,benefits:['기존 혜택','삭제할 혜택']};
 const model={...probe.model,memberships:[original],actions:{...probe.model.actions,saveMembership:async input=>{calls.push(input);return {success:true,data:{id:original.id,message:'혜택 저장 완료'},errorMessage:null,errorCode:null};}}};
 const tree=mount(MembershipManagementPage,model);
 try{
  act(()=>button(tree,'수정').props.onClick());
  assert.equal(tree.root.findAllByType('textarea').length,0);
  assert.equal(membershipField(tree,'혜택 2').props.value,'삭제할 혜택');
  act(()=>benefitAction(tree,'혜택 2 삭제').props.onClick());
  changeMembershipField(tree,'혜택 1','  수정한 혜택  ');
  act(()=>benefitAction(tree,'혜택 추가').props.onClick());changeMembershipField(tree,'혜택 2',' 새 혜택 ');
  act(()=>benefitAction(tree,'혜택 추가').props.onClick());
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls,[{id:original.id,name:original.name,price:original.price,benefits:['수정한 혜택','새 혜택']}]);
  assert.deepEqual(original.benefits,['기존 혜택','삭제할 혜택']);
  assert.equal(tree.root.findAllByType('form').length,0);
 }finally{act(()=>tree.unmount());probe.close();}
});

test('new membership rejects empty benefits and preserves entered rows when the injected save fails',async()=>{
 const probe=fixtureHook(),calls=[];
 const model={...probe.model,memberships:[],actions:{...probe.model.actions,saveMembership:async input=>{calls.push(input);return {success:false,data:null,errorMessage:'저장이 거절되었습니다.',errorCode:'DENIED'};}}};
 const tree=mount(MembershipManagementPage,model);
 try{
  act(()=>button(tree,'멤버십 만들기').props.onClick());
  changeMembershipField(tree,'멤버십 이름','새 멤버십');changeMembershipField(tree,'월 구독료 (원)','15000');
  act(()=>benefitAction(tree,'혜택 1 삭제').props.onClick());
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(calls.length,0);assert.match(json(tree),/혜택을 하나 이상 입력해주세요/);
  act(()=>benefitAction(tree,'혜택 추가').props.onClick());changeMembershipField(tree,'혜택 1','직접 입력한 혜택');
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls[0],{id:undefined,name:'새 멤버십',price:15000,benefits:['직접 입력한 혜택']});
  assert.equal(membershipField(tree,'혜택 1').props.value,'직접 입력한 혜택');assert.match(json(tree),/저장이 거절되었습니다/);
 }finally{act(()=>tree.unmount());probe.close();}
});

test('membership deletion appears only when eligible and delegates only after confirmation',async()=>{
 const probe=fixtureHook(),calls=[];
 const model={...probe.model,memberships:[{...plan,canDelete:false}],actions:{...probe.model.actions,deleteMembership:async id=>{calls.push(id);return {success:true,data:{message:'삭제 완료'},errorMessage:null,errorCode:null};}}};
 const tree=mount(MembershipManagementPage,model);
 try{
  assert.equal(button(tree,'삭제'),undefined);
  act(()=>tree.update(React.createElement(MembershipManagementPage,{model:{...model,memberships:[{...plan,canDelete:true}]},basePath:'/studio'})));
  act(()=>button(tree,'삭제').props.onClick());assert.deepEqual(calls,[]);
  act(()=>button(tree,'취소').props.onClick());assert.deepEqual(calls,[]);assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='멤버십을 삭제할까요?').length,0);
  act(()=>button(tree,'삭제').props.onClick());await act(async()=>button(tree,'삭제하기').props.onClick());assert.deepEqual(calls,[plan.id]);
 }finally{act(()=>tree.unmount());probe.close();}
});

test('membership activation delegates the shared switch value without altering subscribed contracts',async()=>{
 const probe=fixtureHook(),calls=[];
 const model={...probe.model,actions:{...probe.model.actions,setMembershipActive:async(id,active)=>{calls.push([id,active]);return {success:true,data:{message:'상태 변경 완료'},errorMessage:null,errorCode:null};}}};
 const tree=mount(MembershipManagementPage,model);
 try{
  const input=()=>tree.root.findAllByType('input').find(node=>node.props.role==='switch');
  assert.equal(input().props.checked,true);
  act(()=>input().props.onChange({target:{checked:false}}));
  assert.deepEqual(calls,[]);assert.equal(input().props.checked,true);
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='멤버십을 숨길까요?').length,1);
  act(()=>button(tree,'취소').props.onClick());assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='멤버십을 숨길까요?').length,0);assert.deepEqual(calls,[]);
  act(()=>input().props.onChange({target:{checked:false}}));
  await act(async()=>button(tree,'숨기기').props.onClick());assert.deepEqual(calls,[[plan.id,false]]);
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='멤버십을 숨길까요?').length,0);
  assert.match(json(tree),/기존 구독자의 가입 당시 조건과 이용 권한은 유지됩니다/);
 }finally{act(()=>tree.unmount());probe.close();}
});

test('editor comment toggle follows the studio-wide switch and saves the per-post flag',async()=>{
  const {loadTypeScript:load}=require('./load-typescript.cjs');
  const {postCommentsAllowed}=load('lib/crefans/comments.ts');
  assert.equal(postCommentsAllowed(true,true),true);assert.equal(postCommentsAllowed(true,false),false);assert.equal(postCommentsAllowed(false,true),false);assert.equal(postCommentsAllowed(true,undefined),true);
  const probe=fixtureHook(),saved=[];
  const model={...probe.model,actions:{...probe.model.actions,saveContent:async input=>{saved.push(input);return {success:true,data:{id:'draft1',message:'저장'},errorMessage:null,errorCode:null};}}};
  const tree=mount(ContentEditorPage,model,'draft1');
  try{
    const toggle=()=>tree.root.findAllByType('input').find(input=>input.props.role==='switch');
    assert.equal(toggle().props.checked,true);assert.equal(toggle().props.disabled,false);
    act(()=>toggle().props.onChange({target:{checked:false}}));
    await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
    assert.equal(saved[0].commentsEnabled,false);
  }finally{act(()=>tree.unmount());}
  let locked;act(()=>{locked=create(React.createElement(ContentEditorPage,{model,basePath:'/studio',id:'draft1',commentsGloballyEnabled:false}));});
  try{
    const toggle=locked.root.findAllByType('input').find(input=>input.props.role==='switch');
    assert.equal(toggle.props.disabled,true);assert.match(json(locked),/크리에이터 설정에서 먼저 켜 주세요/);
  }finally{act(()=>locked.unmount());}
  probe.close();
});
