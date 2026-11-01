const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {getPostMembershipOffer}=loadTypeScript('lib/crefans/membership-plans.ts');
const plan=(id,rank,extra={})=>({id,name:id,rank,price:9900,benefits:['촬영 기록','여행 노트'],...extra});
const post={id:'locked',creatorId:'artist',title:'비공개 글',body:'PRIVATE_BODY',image:'/PRIVATE_IMAGE.jpg',position:'center',likes:0,comments:0,requiredRank:2,time:'오늘'};
const data={creators:[{id:'artist',name:'주입된 작가'}],plans:[plan('다른 작가',2)],creatorPlans:{artist:[plan('플러스',3,{price:21900}),plan('입문',1),plan('여행 클럽',2),plan('종료 상품',4,{available:false})]}};
test('offers use the same creator and current names, sort by level, exclude lower/retired plans without mutating input',()=>{
 const original=JSON.stringify(data),offer=getPostMembershipOffer(data,post);
 assert.equal(offer.label,'여행 클럽 이상');assert.match(offer.description,/여행 클럽/);assert.doesNotMatch(offer.description,/레벨/);
 assert.deepEqual(offer.plans.map(p=>p.id),['여행 클럽','플러스']);assert.equal(JSON.stringify(data),original);
 assert.deepEqual(getPostMembershipOffer({...data,creatorPlans:{artist:[]}},post).plans,[],'an empty creator list must not fall back to another creator');
});
test('exact products never suggest a higher tier or a replacement for a missing/retired product',()=>{
 const exact=getPostMembershipOffer(data,{...post,requiredPlanId:'여행 클럽'});assert.deepEqual(exact.plans.map(p=>p.id),['여행 클럽']);assert.equal(exact.label,'여행 클럽 전용');assert.doesNotMatch(exact.description,/이상/);
 assert.deepEqual(getPostMembershipOffer(data,{...post,requiredPlanId:'종료 상품'}).plans,[]);
 const missing=getPostMembershipOffer(data,{...post,requiredPlanId:'missing'});assert.deepEqual(missing.plans,[]);assert.doesNotMatch(missing.description,/다른 작가|레벨/);
 assert.deepEqual(getPostMembershipOffer(data,{...post,requiredRank:99}).plans,[]);
});
const h=React.createElement,styles=new Proxy({},{get:(_,k)=>String(k)});
const {PostMembershipNotice}=loadTypeScript('components/crefans/PostMembershipNotice.tsx',{
 './social.module.css':styles,'./Icon':()=>h('svg'),'next/link':({children,...props})=>h('a',props,children),
 '@/components/ui/Primitives':{Dialog:({open,title,onClose,children})=>open?h('section',{role:'dialog','aria-label':title},h('button',{'aria-label':'닫기',onClick:onClose}),children):null},
});
const text=tree=>JSON.stringify(tree.toJSON());
function mount(props){let tree;act(()=>{tree=create(h(PostMembershipNotice,{post,data,basePath:'/live',...props}));});return tree;}
const trigger=tree=>tree.root.findAllByType('button').find(n=>n.props['aria-haspopup']==='dialog');
const open=tree=>trigger(tree).props.onClick({currentTarget:{focus(){}}});
test('notice opens prices and benefits in place, and only offers links to the existing subscription flow',()=>{
 const tree=mount();try{
  assert.equal(tree.root.findAllByType('a').length,0);assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);
  act(()=>open(tree));assert.equal(trigger(tree).props['aria-expanded'],true);
  assert.equal(tree.root.findByProps({role:'dialog'}).props['aria-label'],'주입된 작가의 멤버십');assert.match(text(tree),/9,900/);assert.match(text(tree),/21,900/);assert.match(text(tree),/촬영 기록/);assert.match(text(tree),/여행 노트/);
  assert.doesNotMatch(text(tree),/PRIVATE_BODY|PRIVATE_IMAGE|종료 상품|다른 작가|입문/);
  assert.deepEqual(tree.root.findAllByType('a').map(n=>n.props.href),['/live/membership/artist?plan='+encodeURIComponent('여행 클럽'),'/live/membership/artist?plan='+encodeURIComponent('플러스')]);
  act(()=>tree.root.findByProps({'aria-label':'닫기'}).props.onClick());assert.equal(trigger(tree).props['aria-expanded'],false);
 }finally{act(()=>tree.unmount());}
});
test('unavailable and empty offers explain the state without a signup link, and read-only previews cannot open the layer',()=>{
 for(const changed of [{post:{...post,requiredPlanId:'종료 상품'}},{data:{...data,creatorPlans:{artist:[]}}}]){
  const tree=mount(changed);try{act(()=>open(tree));assert.match(text(tree),/판매 중 멤버십이 없습니다/);assert.equal(tree.root.findAllByType('a').length,0);}finally{act(()=>tree.unmount());}
 }
 const tree=mount({readOnly:true});try{assert.equal(trigger(tree).props.disabled,true);act(()=>open(tree));assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);}finally{act(()=>tree.unmount());}
});

test('notice uses the lowest eligible membership image and the layer shows each eligible product image, never protected media',()=>{
 const illustrated={...data,creatorPlans:{artist:data.creatorPlans.artist.map(p=>({...p,image:`/public/${p.id}.jpg`}))}};
 const tree=mount({data:illustrated});try{
  assert.deepEqual(tree.root.findAllByType('img').map(n=>n.props.src),['/public/여행 클럽.jpg']);
  act(()=>open(tree));
  assert.deepEqual(tree.root.findByProps({role:'dialog'}).findAllByType('img').map(n=>n.props.src),['/public/여행 클럽.jpg','/public/플러스.jpg']);
  assert.doesNotMatch(text(tree),/PRIVATE_IMAGE|PRIVATE_BODY|종료 상품.jpg|입문.jpg/);
 }finally{act(()=>tree.unmount());}
 const exact=mount({data:illustrated,post:{...post,requiredPlanId:'플러스'}});try{
  assert.deepEqual(exact.root.findAllByType('img').map(n=>n.props.src),['/public/플러스.jpg']);
  act(()=>open(exact));assert.deepEqual(exact.root.findByProps({role:'dialog'}).findAllByType('img').map(n=>n.props.src),['/public/플러스.jpg']);
 }finally{act(()=>exact.unmount());}
});

test('missing and broken membership images leave the notice and signup controls usable without substituting post media',()=>{
 const tree=mount();try{
  act(()=>open(tree));assert.equal(tree.root.findAllByType('img').length,0);
  const illustrated={...data,creatorPlans:{artist:[plan('여행 클럽',2,{image:'/public/cover.jpg'})]}};
  act(()=>tree.update(h(PostMembershipNotice,{post,data:illustrated,basePath:'/live'})));
  assert.equal(tree.root.findAllByType('img').length,2);
  act(()=>tree.root.findAllByType('img').forEach(image=>image.props.onError()));
  assert.equal(tree.root.findAllByType('img').length,0);assert.equal(trigger(tree).props.disabled,false);
  assert.equal(tree.root.findAllByType('a').length,1);assert.match(text(tree),/멤버십 전용 콘텐츠입니다/);assert.doesNotMatch(text(tree),/PRIVATE_IMAGE/);
 }finally{act(()=>tree.unmount());}
});
