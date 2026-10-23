const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const css=Object.fromEntries(['optional-image','image-upload','creator','service','ui','field','select','avatar'].map(name=>[`./${name}.module.css`,styles]));
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const plan={id:'standard',name:'Original',price:19900,benefits:['Original benefit'],active:true,version:1,image:'/original.png'};
const subscriber={id:'fan1',name:'Fan',handle:'fan',planId:plan.id,planSnapshot:{name:plan.name,price:plan.price,benefits:[...plan.benefits],version:1,image:plan.image},status:'active',joinedAt:'2026-08-12',renewAt:'2026-10-12'};
const now='2026-09-12T09:00:00.000Z';
const file={type:'image/png',size:100};
const {createLocalImageStore}=loadTypeScript('components/preview/studio/useLocalImages.ts');
const {canDeleteMembership,studioMembershipPlans,getCreatorPlans,getSubscriptionPlan}=loadTypeScript('lib/crefans/membership-plans.ts');
function urls(t){let next=0;const revoked=[];t.mock.method(URL,'createObjectURL',()=>`blob:test-${++next}`);t.mock.method(URL,'revokeObjectURL',url=>revoked.push(url));return revoked;}
function fixture({memberships=[plan],subscribers=[subscriber],protectedPlans=[]}={}){
 const {useMockManagement}=loadTypeScript('components/preview/studio/useMockManagement.ts',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams()},
  './management-fixtures':{managementNow:now,managementContents:[],managementMemberships:memberships,managementSubscribers:subscribers},
 });
 let model,tree;function Probe(){model=useMockManagement({getProtectedPlanIds:()=>protectedPlans});return null;}
 act(()=>tree=create(React.createElement(Probe)));
 return {get model(){return model;},close(){act(()=>tree.unmount());}};
}

test('local image validation rejects unsupported, empty and oversized files before allocating URLs',async t=>{
 urls(t);const store=createLocalImageStore();
 for(const invalid of [{type:'image/svg+xml',size:1},{type:'image/png',size:0},{type:'image/jpeg',size:5*1024*1024+1}]){
  assert.equal((await store.upload(invalid)).success,false);
 }
 assert.equal(URL.createObjectURL.mock.callCount(),0);
 for(const type of ['image/png','image/jpeg','image/webp'])assert.equal((await store.upload({type,size:5*1024*1024})).success,true);
 store.dispose();
});

test('draft URLs are discarded while saved images remain alive until their provider is disposed',async t=>{
 const revoked=urls(t),store=createLocalImageStore();
 const draft=(await store.upload(file)).data.image,saved=(await store.upload(file)).data.image;
 store.discard(draft);store.retain(saved);store.discard(saved);store.discard('/external.png');
 assert.deepEqual(revoked,[draft]);assert.equal(store.owns(draft),false);assert.equal(store.owns(saved),true);
 store.dispose();store.dispose();assert.deepEqual(revoked,[draft,saved]);
});

test('the shared membership card hides absent or broken images without reserving a placeholder',()=>{
 const {MembershipPlanCard}=loadTypeScript('components/crefans/MembershipPlanCard.tsx',css);
 let tree;const render=image=>React.createElement(MembershipPlanCard,{plan:{...plan,rank:2,image},onSelect(){}});
 act(()=>tree=create(render(undefined)));assert.equal(tree.root.findAllByType('img').length,0);
 act(()=>tree.update(render('/good.png')));assert.equal(tree.root.findByType('img').props.src,'/good.png');
 act(()=>tree.root.findByType('img').props.onError());assert.equal(tree.root.findAllByType('img').length,0);assert.match(JSON.stringify(tree.toJSON()),/Original/);
 act(()=>tree.update(render('/replacement.png')));assert.equal(tree.root.findByType('img').props.src,'/replacement.png');
 act(()=>tree.unmount());
});

test('image selection forwards the File, allows selecting it again, and does nothing when disabled',()=>{
 const {ImageUpload}=loadTypeScript('components/ui/ImageUpload.tsx',css),received=[];
 let tree;const props={label:'Cover',accept:'image/png',onFileSelect:item=>received.push(item),onRemove(){}};
 act(()=>tree=create(React.createElement(ImageUpload,props)));
 const event={currentTarget:{files:[file],value:'fakepath'}};
 act(()=>tree.root.findByType('input').props.onChange(event));assert.deepEqual(received,[file]);assert.equal(event.currentTarget.value,'');
 act(()=>tree.update(React.createElement(ImageUpload,{...props,disabled:true})));
 act(()=>tree.root.findByType('input').props.onChange({currentTarget:{files:[file],value:'fakepath'}}));assert.equal(received.length,1);
 act(()=>tree.unmount());
});

test('membership image replacement and removal create new versions while preserving subscriber snapshots',async t=>{
 const revoked=urls(t),probe=fixture();let upload,result;
 const original=JSON.stringify(probe.model.subscribers);
 try{
  await act(async()=>{upload=await probe.model.actions.uploadMembershipImage(file);});
  await act(async()=>{result=await probe.model.actions.saveMembership({...plan,image:upload.data.image});});
  assert.equal(result.success,true);assert.equal(probe.model.memberships[0].image,upload.data.image);assert.equal(probe.model.memberships[0].version,2);
  probe.model.actions.discardMembershipImage(upload.data.image);assert.deepEqual(revoked,[]);
  await act(async()=>{result=await probe.model.actions.saveMembership({...plan,image:''});});
  assert.equal(result.success,true);assert.equal(probe.model.memberships[0].image,undefined);assert.equal(probe.model.memberships[0].version,3);
  assert.equal(JSON.stringify(probe.model.subscribers),original);assert.deepEqual(revoked,[]);
  await act(async()=>{result=await probe.model.actions.saveMembership({...plan,image:'blob:not-owned'});});assert.equal(result.success,false);
 }finally{probe.close();}
 assert.deepEqual(revoked,[upload.data.image]);
});

test('deletion requires no current entitlement, including cancelled subscriptions on their last access day',()=>{
 for(const status of ['active','cancelled']){
  assert.equal(canDeleteMembership(plan.id,[{...subscriber,status,renewAt:'2026-09-12'}],now),false);
  assert.equal(canDeleteMembership(plan.id,[{...subscriber,status,renewAt:'2026-09-11'}],now),true);
 }
 assert.equal(canDeleteMembership(plan.id,[{...subscriber,status:'expired'}],now),true);
 assert.equal(canDeleteMembership(plan.id,[{...subscriber,joinedAt:'2026-09-13'}],now),true);
 assert.equal(canDeleteMembership(plan.id,[],now),true);
});

test('deleting an unused membership hides it from sale while preserving history and rejecting later mutations',async()=>{
 const historical={...subscriber,status:'expired'},probe=fixture({subscribers:[historical]});let result;
 try{
  assert.equal(probe.model.memberships[0].canDelete,true);
  await act(async()=>{result=await probe.model.actions.deleteMembership(plan.id);});assert.equal(result.success,true);
  assert.equal(probe.model.memberships.length,0);assert.deepEqual(probe.model.subscribers,[historical]);
  await act(async()=>{result=await probe.model.actions.deleteMembership(plan.id);});assert.equal(result.success,false);
  await act(async()=>{result=await probe.model.actions.saveMembership(plan);});assert.equal(result.success,false);
  await act(async()=>{result=await probe.model.actions.setMembershipActive(plan.id,true);});assert.equal(result.success,false);
 }finally{probe.close();}
 for(const options of [{},{subscribers:[{...subscriber,status:'cancelled'}]},{subscribers:[],protectedPlans:[plan.id]}]){
  const guarded=fixture(options);
  try{await act(async()=>{result=await guarded.model.actions.deleteMembership(plan.id);});assert.equal(result.success,false);assert.equal(guarded.model.memberships.length,1);}finally{guarded.close();}
 }
});

test('creator scoped plans preserve existing tiers, mark new products exact and retain subscription snapshots',()=>{
 const original=[{...plan,rank:2}],newPlan={...plan,id:'new',name:'New',active:false};
 const mapped=studioMembershipPlans([plan,newPlan],original),data={plans:original,creatorPlans:{haneul:mapped}};
 assert.equal(mapped[0].rank,2);assert.equal(mapped[1].rank,1);assert.equal(mapped[1].entitlementMode,'tier');assert.equal(mapped[1].available,false);
 assert.equal(getCreatorPlans(data,'haneul'),mapped);assert.equal(getCreatorPlans(data,'jiwoo'),original);
 const snapshot={...original[0],image:'/old.png'};assert.equal(getSubscriptionPlan(data,{creatorId:'haneul',planId:plan.id,planSnapshot:snapshot}),snapshot);
});

function previewFixture(){
 const plans=[{...plan,rank:2}],initial={creatorId:'haneul',planId:plan.id,status:'active',renewAt:'2026-10-12',price:plan.price};
 const data={creators:[{id:'haneul'},{id:'jiwoo'}],plans,posts:[],notifications:[],messages:{},faqs:[],categories:[],paymentHistory:[initial]};
 const exports=loadTypeScript('components/preview/service/PreviewProvider.tsx',{
  'next/navigation':{useSearchParams:()=>new URLSearchParams()},
  '@/components/crefans/ApiState':{ApiState:({response,children})=>children(response.data)},
  './fixtures':{initialSubscriptions:[initial],initialComments:{},mockServiceResponse:ok(data)},
  './useMockAccount':{useMockAccount:()=>({account:{email:'fan@example.com'},accountActions:{signup:async()=>ok({})}})},
  './useMockSocial':{useMockSocial:()=>({})},
  './useMockCommon':{useMockCommon:()=>({paymentMethods:[],actions:{}})},
  './management-fixtures':{managementNow:now,managementContents:[],managementMemberships:[plan],managementSubscribers:[]},
 });
 let service,management,tree;function Probe(){service=exports.usePreview();management=exports.usePreviewManagement();return null;}
 act(()=>tree=create(React.createElement(exports.PreviewProvider,{response:ok(data)},React.createElement(Probe))));
 return {get service(){return service;},get management(){return management;},close(){act(()=>tree.unmount());}};
}

test('creator edits reach the same fan plan but preserve other creators, old subscriptions and receipts',async()=>{
 const probe=previewFixture();let result;
 try{
  await act(async()=>{result=await probe.management.actions.saveMembership({...plan,name:'New name',price:29900,image:'/new.png'});});assert.equal(result.success,true);
  assert.equal(getCreatorPlans(probe.service.data,'haneul')[0].image,'/new.png');assert.equal(getCreatorPlans(probe.service.data,'jiwoo')[0].image,'/original.png');
  assert.equal(probe.service.subscriptions[0].planSnapshot.price,19900);assert.equal(probe.service.subscriptions[0].planSnapshot.image,'/original.png');
  assert.equal(probe.service.data.paymentHistory[0].planSnapshot.name,'Original');
  await act(async()=>{result=await probe.management.actions.setMembershipActive(plan.id,false);});assert.equal(result.success,true);
  assert.equal(getCreatorPlans(probe.service.data,'haneul')[0].available,false);assert.equal(probe.service.canAccess('haneul',2),true);
  await act(async()=>{result=await probe.service.subscribe('haneul',plan.id);});assert.equal(result.success,false);
  await act(async()=>{result=await probe.management.actions.deleteMembership(plan.id);});assert.equal(result.success,false);
 }finally{probe.close();}
});

test('a new fan subscription immediately protects its creator membership from deletion',async()=>{
 const probe=previewFixture();let result,id;
 try{
  await act(async()=>{result=await probe.management.actions.saveMembership({name:'Standalone',price:15000,benefits:['Exclusive']});});id=result.data.id;
  assert.equal(probe.management.memberships.find(item=>item.id===id).canDelete,true);
  await act(async()=>{result=await probe.service.subscribe('haneul',id);});assert.equal(result.success,true);
  assert.equal(probe.management.memberships.find(item=>item.id===id).canDelete,false);
  assert.equal(probe.service.canAccess('haneul',1,id),true);assert.equal(probe.service.canAccess('haneul',1),true);
  await act(async()=>{result=await probe.management.actions.deleteMembership(id);});assert.equal(result.success,false);
  await act(async()=>{result=await probe.service.cancelSubscription('haneul');});assert.equal(result.success,true);
  assert.equal(probe.service.canAccess('haneul',1,id),true);
  await act(async()=>{result=await probe.management.actions.deleteMembership(id);});assert.equal(result.success,false);
 }finally{probe.close();}
});
