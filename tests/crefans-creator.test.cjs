const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');

const h=React.createElement;
const styles=new Proxy({},{get:(_,key)=>String(key)});
const flatten=value=>typeof value==='string'?value:Array.isArray(value)?value.map(flatten).join(''):value?.children?flatten(value.children):'';
const text=tree=>flatten(tree.toJSON());
const button=(tree,label)=>tree.root.findAllByType('button').find(node=>flatten(node.props.children)===label);
const ok=message=>({success:true,data:{message},errorMessage:null,errorCode:null});
const failure=message=>({success:false,data:null,errorMessage:message,errorCode:'REQUEST_DENIED'});

function pages(){
  const navigations=[];
  const search=new URLSearchParams();
  const exports=loadTypeScript('components/crefans/CreatorPages.tsx',{
    'next/link':({href,children,...props})=>h('a',{href,...props},children),
    'next/navigation':{useRouter:()=>({push:path=>navigations.push(path)}),useSearchParams:()=>search},
    './creator.module.css':styles,'./choice.module.css':styles,'./social.module.css':styles,'./chip-row.module.css':styles,'./media-type-icon.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./optional-image.module.css':new Proxy({},{get:(_,key)=>String(key)}),
    './Icon':()=>h('svg'),
    '@/components/ui/Primitives':{Dialog:({open,title,children})=>open?h('section',{role:'dialog','aria-label':title},children):null,Chip:({selected,children,onClick})=>h('button',{type:'button','aria-pressed':selected,onClick},children),Badge:({children,tone,label})=>h('span',{'data-tone':tone,'aria-label':label},children)},
    './ServiceUI':{
      Action:({variant,children,...props})=>h('button',props,children),
      Avatar:({creator})=>h('img',{alt:creator?.name}),
      Empty:({title,description,action})=>h('section',null,h('h2',null,title),description&&h('p',null,description),action),
      Notice:({children})=>h('p',null,children),
      PageTitle:({children})=>h('h1',null,children),
    },
  });
  return {...exports,navigations,search};
}

function inputs(){
  const creator={id:'artist-42',name:'다른 크리에이터',handle:'different',tags:['드로잉'],image:'/injected-portrait.png',cover:'/injected-cover.png',position:'center',bio:'주입된 소개',followers:'37',promoted:true};
  const plan={id:'independent-plan',name:'새로운 멤버십',price:27500,rank:2,benefits:['주입된 혜택']};
  return {
    basePath:'/catalogue',mode:'live',today:'2030-01-08',nextRenewAt:'2030-02-08',
    data:{creators:[creator],plans:[plan],posts:[],paymentHistory:[],categories:['드로잉']},
    following:[],toggleFollow(){},canAccess:()=>false,liked:[],saved:[],toggleLike(){},toggleSave(){},likeCounts:{},commentCounts:{},
    subscriptions:[],subscribe:async()=>ok('가입이 처리됐습니다.'),cancelSubscription:async()=>ok('해지가 처리됐습니다.'),
  };
}

test('creator exploration and profile render supplied identity and routes without inserting sample records',()=>{
  const {ExplorePage,CreatorProfilePage}=pages();
  const model=inputs();
  const followed=[];
  model.toggleFollow=id=>followed.push(id);
  let tree;
  act(()=>{tree=create(h(ExplorePage,{model}));});
  assert.match(text(tree),/다른 크리에이터/);
  assert.match(text(tree),/주입된 소개/);
  assert.match(text(tree),/드로잉/);
  const portraits=tree.root.findAllByType('img').filter(image=>image.props['aria-hidden']!=='true');
  assert.ok(portraits.length>=2,'card background and avatar both render');assert.ok(portraits.every(image=>image.props.src===undefined||['/injected-portrait.png','/injected-cover.png'].includes(image.props.src)));
  assert.ok(tree.root.findAllByType('a').every(link=>link.props.href==='/catalogue/creator/artist-42'));
  act(()=>button(tree,'팔로우').props.onClick());
  assert.deepEqual(followed,['artist-42']);
  act(()=>tree.update(h(CreatorProfilePage,{model,id:'artist-42'})));
  assert.ok(tree.root.findAllByType('dt').some(node=>flatten(node.props.children)==='팔로잉'),'the 팔로잉 column stays');
  assert.equal(tree.root.findByProps({'aria-label':'팔로잉 비공개'}).findAllByType('svg').length,1,'a private following count shows a lock instead of disappearing');
  assert.match(text(tree),/아직 게시물이 없어요/);
  act(()=>tree.update(h(CreatorProfilePage,{model,id:'missing'})));
  assert.match(text(tree),/크리에이터를 찾을 수 없어요/);
  act(()=>tree.update(h(ExplorePage,{model:{...model,data:{...model.data,creators:[]}}})));
  assert.match(text(tree),/아직 크리에이터가 없어요/);
  assert.equal(tree.root.findAllByType('img').length,0);
  act(()=>tree.unmount());
});

test('membership recommendation and description come from injected fields, and empty plans remain empty',()=>{
  const {MembershipPage}=pages();
  const model=inputs();
  let tree;
  act(()=>{tree=create(h(MembershipPage,{model,id:'artist-42'}));});
  assert.match(text(tree),/새로운 멤버십/);
  assert.match(text(tree),/₩27,500/);
  assert.match(text(tree),/주입된 혜택/);
  assert.doesNotMatch(text(tree),/추천|더 많은 특별한 콘텐츠|디자인 체험용/);
  const provided={...model,data:{...model.data,plans:[{...model.data.plans[0],description:'직접 공급한 플랜 설명',recommended:true}]}};
  act(()=>tree.update(h(MembershipPage,{model:provided,id:'artist-42'})));
  assert.match(text(tree),/추천/);
  assert.match(text(tree),/직접 공급한 플랜 설명/);
  act(()=>tree.update(h(MembershipPage,{model:{...model,data:{...model.data,plans:[]}},id:'artist-42'})));
  assert.match(text(tree),/아직 멤버십이 없어요/);
  assert.equal(tree.root.findAllByType('button').length,0);
  act(()=>tree.unmount());
});

test('membership awaits the action result, blocks duplicate requests, and navigates only after success',async()=>{
  const {MembershipPage,navigations}=pages();
  const model=inputs();
  const calls=[];
  let resolve,request,tree;
  model.subscribe=(...args)=>{calls.push(args);return calls.length===1?new Promise(done=>{resolve=done;}):Promise.resolve(ok('가입 완료'));};
  act(()=>{tree=create(h(MembershipPage,{model,id:'artist-42'}));});
  act(()=>button(tree,'선택하고 계속').props.onClick());
  assert.match(text(tree),/2030.02.08/);
  const [confirmBox]=tree.root.findAllByType('input');
  act(()=>confirmBox.props.onChange({target:{checked:true}}));
  assert.match(text(tree),/닉네임, 프로필 식별명, 프로필 사진/);assert.match(text(tree),/동의하지 않으면 멤버십에 가입할 수 없습니다/);
  assert.equal(button(tree,'확인하고 계속').props.disabled,true,'consent to share with the creator is required');
  await act(async()=>{await button(tree,'확인하고 계속').props.onClick();});assert.deepEqual(calls,[]);
  act(()=>tree.root.findAllByType('input')[1].props.onChange({target:{checked:true}}));
  act(()=>{request=button(tree,'확인하고 계속').props.onClick();});
  const pendingButton=button(tree,'확인 중…');
  assert.equal(pendingButton.props.disabled,true);
  assert.equal(pendingButton.props['aria-busy'],true);
  assert.ok(tree.root.findAllByType('input').every(input=>input.props.disabled===true));
  act(()=>{pendingButton.props.onClick();});
  assert.deepEqual(calls,[['artist-42','independent-plan']]);
  assert.deepEqual(navigations,[]);
  await act(async()=>{resolve(failure('공급된 오류: 가입할 수 없습니다.'));await request;});
  assert.equal(flatten(tree.root.findByProps({role:'alert'}).props.children),'공급된 오류: 가입할 수 없습니다.');
  assert.deepEqual(navigations,[]);
  assert.equal(button(tree,'확인하고 계속').props.disabled,false);
  await act(async()=>{await button(tree,'확인하고 계속').props.onClick();});
  assert.deepEqual(navigations,['/catalogue/subscriptions']);
  act(()=>tree.unmount());
});

test('subscription cancellation failure preserves the view and supplied errors; empty payment data adds no receipts',async()=>{
  const {SubscriptionsPage,search}=pages();
  const model=inputs();
  const subscription={creatorId:'artist-42',planId:'independent-plan',status:'active',renewAt:'2030-02-08',price:27500};
  model.subscriptions=[subscription];
  const cancelled=[];
  model.cancelSubscription=async id=>{cancelled.push(id);return failure('취소 요청이 거절됐습니다.');};
  let tree;
  act(()=>{tree=create(h(SubscriptionsPage,{model}));});
  act(()=>button(tree,'갱신 해지').props.onClick());
  await act(async()=>{await button(tree,'갱신 해지하기').props.onClick();});
  assert.deepEqual(cancelled,['artist-42']);
  assert.equal(subscription.status,'active');
  assert.equal(flatten(tree.root.findByProps({role:'alert'}).props.children),'취소 요청이 거절됐습니다.');
  assert.equal(flatten(tree.root.findByProps({role:'status'}).props.children),'');
  act(()=>button(tree,'구독 유지').props.onClick());
  search.set('tab','payments');
  act(()=>tree.update(h(SubscriptionsPage,{model})));
  assert.match(text(tree),/아직 결제 내역이 없어요/);
  assert.doesNotMatch(text(tree),/샘플 결제/);
  act(()=>tree.unmount());
});

test('profile lock labels use creator membership names for both product and minimum-tier posts',()=>{
 const {CreatorProfilePage}=pages(),model=inputs();
 const legacy={...model.data.plans[0],id:'basic',name:'베이직',rank:1};
 const exact={...legacy,id:'custom',name:'드로잉 클래스',entitlementMode:'exact'};
 const post={id:'restricted',creatorId:'artist-42',title:'수업 기록',body:'Private',image:'/private.png',position:'center',likes:0,comments:0,time:'어제',requiredRank:1,requiredPlanId:'custom'};
 model.data={...model.data,plans:[legacy],creatorPlans:{'artist-42':[legacy,exact]},posts:[post]};
 let tree;act(()=>tree=create(h(CreatorProfilePage,{model,id:'artist-42'})));
 act(()=>button(tree,'미디어').props.onClick());
 const tile=()=>tree.root.findAllByType('a').find(node=>node.props.href==='/catalogue/post/restricted');
 assert.equal(tile().props['aria-label'],'수업 기록 · 사진 1장, 동영상 0개 · 드로잉 클래스 전용 멤버에게 공개');
 const gather=node=>typeof node==='string'?node:node.children.map(gather).join('');const tileText=()=>gather(tile());
 assert.match(tileText(),/드로잉 클래스/);assert.doesNotMatch(tileText(),/베이직|클래스 이상/);
 act(()=>tree.update(h(CreatorProfilePage,{model:{...model,data:{...model.data,posts:[{...post,requiredPlanId:undefined}]}},id:'artist-42'})));
 assert.equal(tile().props['aria-label'],'수업 기록 · 사진 1장, 동영상 0개 · 베이직 이상 멤버에게 공개');assert.doesNotMatch(text(tree),/레벨 1 이상/);
 act(()=>tree.update(h(CreatorProfilePage,{model:{...model,data:{...model.data,posts:[{...post,requiredPlanId:'missing'}]}},id:'artist-42'})));
 assert.equal(tile().props['aria-label'],'수업 기록 · 사진 1장, 동영상 0개 · 멤버십 전용 멤버에게 공개');assert.doesNotMatch(text(tree),/레벨 1 이상/);
 act(()=>tree.unmount());
});

test('mock membership and receipt pages omit repeated preview notices while retaining contract details',()=>{
 const {MembershipPage,SubscriptionsPage}=pages(),model={...inputs(),mode:'mock'};
 const subscription={creatorId:'artist-42',planId:'independent-plan',status:'active',renewAt:'2030-02-08',price:27500};
 model.subscriptions=[subscription];model.data={...model.data,paymentHistory:[subscription]};
 let tree;act(()=>tree=create(h(MembershipPage,{model,id:'artist-42'})));
 assert.doesNotMatch(text(tree),/목업|미리보기|체험|샘플|실제 결제/);
 act(()=>button(tree,'선택하고 계속').props.onClick());
 assert.ok(button(tree,'확인하고 계속'));assert.match(text(tree),/이용 기간 종료일까지 혜택을 유지합니다/);
 assert.doesNotMatch(text(tree),/목업|미리보기|체험|샘플|실제 결제/);
 act(()=>tree.update(h(SubscriptionsPage,{model})));
 act(()=>button(tree,'결제 내역').props.onClick());
 const receipt=tree.root.findAllByType('button').find(node=>flatten(node.children).includes('상세 보기'));
 act(()=>receipt.props.onClick());
 assert.equal(tree.root.findByProps({role:'dialog'}).props['aria-label'],'결제 상세');
 assert.match(text(tree),/₩27,500/);assert.doesNotMatch(text(tree),/목업|미리보기|체험|샘플|실제 결제/);
 // 2026-11-07: the receipt names the seller and carries the intermediary notice in the dialog's one type size (시행규칙 제11조의2).
 const dialog=tree.root.findByProps({role:'dialog'}),seller=dialog.findAllByType('dt').find(n=>flatten(n.children)==='판매자');
 assert.ok(seller,'seller row');const notice=dialog.findAllByType('p').find(n=>flatten(n.children)==='크레팬스는 크리에이터 멤버십 거래의 통신판매중개자로 거래 당사자가 아니며, 멤버십의 판매자는 각 크리에이터입니다. 콩은 크레팬스가 직접 판매합니다.');
 assert.ok(notice,'intermediary notice');assert.ok(!notice.props.className&&!notice.props.style,'notice inherits .dialogContent font size like the seller row');
 act(()=>tree.unmount());
});

test('creator profile lists the memberships on sale before the posts and preselects the chosen plan on the membership page',()=>{
  const {CreatorProfilePage,MembershipPage,navigations}=pages(),model=inputs();
  const hidden={id:'retired-plan',name:'판매 종료',price:1000,rank:1,benefits:['없음'],available:false};
  const withPlans={...model,data:{...model.data,plans:[...model.data.plans,hidden]}};
  let tree;act(()=>tree=create(h(CreatorProfilePage,{model:withPlans,id:'artist-42'})));
  const json=JSON.stringify(tree.toJSON());
  assert.ok(json.indexOf('새로운 멤버십')<json.indexOf('프로필 내용'),'membership section renders above the content tabs');
  assert.equal(json.includes('판매 종료'),false,'plans that are not on sale stay hidden');
  const feedPost={id:'diary',creatorId:'artist-42',title:'주입된 일기',body:'본문 전체가 피드에 보입니다',image:'/diary.png',position:'center',likes:0,comments:0,requiredRank:0,time:'어제'};
  act(()=>tree.update(h(CreatorProfilePage,{model:{...withPlans,canAccess:()=>true,data:{...withPlans.data,posts:[feedPost]}},id:'artist-42'})));
  assert.match(JSON.stringify(tree.toJSON()),/본문 전체가 피드에 보입니다/,'feed tab renders full post cards like the home feed');
  const tabLabel=name=>{const node=tree.root.findAllByType('button').find(node=>flatten(node.props.children)===name);return name+(node.findAllByType('span').map(span=>span.props.children).join(''));};
  assert.equal(tabLabel('피드'),'피드1');assert.equal(tabLabel('미디어'),'미디어1');assert.equal(tabLabel('소개'),'소개');
  act(()=>button(tree,'미디어').props.onClick());
  assert.equal(JSON.stringify(tree.toJSON()).includes('본문 전체가 피드에 보입니다'),false,'media tab keeps the tile grid');
  act(()=>button(tree,'피드').props.onClick());
  act(()=>tree.update(h(CreatorProfilePage,{model:{...withPlans,data:{...withPlans.data,plans:[{...model.data.plans[0],description:'긴 설명',benefits:['하나','둘','셋','넷']}]}},id:'artist-42'})));
  const compactText=JSON.stringify(tree.toJSON());
  assert.equal(compactText.includes('긴 설명'),false);assert.equal(compactText.includes('"하나"'),false,'benefits stay on the membership page');assert.match(compactText,/₩27,500/);
  act(()=>button(tree,'가입하기').props.onClick());
  assert.deepEqual(navigations,['/catalogue/membership/artist-42?plan=independent-plan']);
  act(()=>tree.update(h(CreatorProfilePage,{model:{...withPlans,subscriptions:[{creatorId:'artist-42',planId:'independent-plan',status:'active',renewAt:'2030-02-08',price:27500}]},id:'artist-42'})));
  assert.equal(button(tree,'가입 중').props.disabled,true);
  act(()=>tree.update(h(CreatorProfilePage,{model:{...model,data:{...model.data,plans:[]}},id:'artist-42'})));
  assert.match(JSON.stringify(tree.toJSON()),/판매 중인 멤버십이 없어요/);
  const second={id:'second-plan',name:'두 번째 멤버십',price:5000,rank:1,benefits:['혜택']};
  let membership;act(()=>membership=create(h(MembershipPage,{model:{...model,data:{...model.data,plans:[model.data.plans[0],second]}},id:'artist-42',initialPlanId:'second-plan'})));
  // 2026-11-07: the separate selection summary bar was removed; the preselected plan card itself carries the selected state.
  const selected=membership.root.findAll(node=>node.props?.plan&&node.props.selected===true&&typeof node.type==='function');assert.equal(selected.length,1);assert.equal(selected[0].props.plan.id,'second-plan');
  assert.equal(JSON.stringify(membership.toJSON()).includes('구독 전 확인하세요'),false,'pre-subscribe info block removed');
});

test('explore shows paid placements as cards and everyone else as one-line rows without follow buttons',()=>{
  const {ExplorePage}=pages(),model=inputs();
  const plain={id:'plain-1',name:'일반 크리에이터',handle:'plain',tags:['드로잉'],image:'',position:'center',bio:'ROW_BIO_HIDDEN',followers:'1'};
  model.data={...model.data,creators:[plain,model.data.creators[0]]};
  let tree;act(()=>tree=create(h(ExplorePage,{model})));
  assert.equal(tree.root.findAllByType('article').length,1,'only the promoted creator gets a card');
  const rows=tree.root.findAllByType('li');
  assert.equal(rows.length,1);assert.match(flatten(rows[0]),/일반 크리에이터.*@plain/);
  assert.doesNotMatch(text(tree),/ROW_BIO_HIDDEN/,'rows stay minimal');
  assert.equal(tree.root.findAllByType('button').filter(node=>/^팔로우/.test(flatten(node.props.children))).length,1,'rows have no follow toggle');
  assert.match(text(tree),/주목할 크리에이터/);assert.match(text(tree),/모든 크리에이터/);
  const ad=tree.root.findAllByProps({'aria-label':'광고'});assert.equal(ad.length,1);assert.equal(ad[0].props['data-tone'],'outline');assert.match(text(tree),/AD/);
  assert.ok(tree.root.findAllByType('a').some(link=>link.props.href==='/catalogue/creator/plain-1'));
  act(()=>tree.update(h(ExplorePage,{model:{...model,data:{...model.data,creators:[plain]}}})));
  assert.equal(tree.root.findAllByType('article').length,0);assert.doesNotMatch(text(tree),/주목할 크리에이터|모든 크리에이터/,'no headings when there are no cards above');
  act(()=>tree.unmount());
});

test('the 소개 tab shows only the long intro and SNS links: no title, no membership link, no empty link slots',()=>{
  const {CreatorProfilePage}=pages(),model=inputs();
  const creator={...model.data.creators[0],about:'첫 줄\n\n둘째 줄 ABOUT_SENTINEL',links:{youtube:'https://youtube.com/@x',facebook:'https://facebook.com/x'}};
  model.data={...model.data,creators:[creator]};
  let tree;act(()=>tree=create(h(CreatorProfilePage,{model,id:'artist-42'})));
  act(()=>button(tree,'소개').props.onClick());
  const json=text(tree);
  assert.match(json,/ABOUT_SENTINEL/);assert.doesNotMatch(json,/의 이야기|멤버십 혜택 알아보기/);
  const links=tree.root.findAllByType('a').filter(a=>a.props.rel==='noopener noreferrer');
  assert.deepEqual(links.map(a=>a.props.href),['https://youtube.com/@x','https://facebook.com/x'],'instagram is missing so it is not rendered');
  assert.ok(links.every(a=>a.props.target==='_blank'));
  act(()=>tree.update(h(CreatorProfilePage,{model:{...model,data:{...model.data,creators:[{...creator,about:undefined,links:undefined}]}},id:'artist-42'})));
  assert.match(text(tree),/주입된 소개/,'falls back to the tagline');assert.equal(tree.root.findAllByType('ul').length,0);
  act(()=>tree.unmount());
});
test('payment detail has no refund entry even when the model exposes a refund action',()=>{
 const {SubscriptionsPage,search}=pages();search.set('tab','payments');const model=inputs();model.data.paymentHistory=[{creatorId:'artist-42',planId:'independent-plan',status:'active',renewAt:'2030-02-08',price:27500,orderId:'order-one',paidAt:'2030-01-08',paymentStatus:'paid'}];model.refundOrder=async()=>{throw Error('must not run');};let tree;act(()=>{tree=create(h(SubscriptionsPage,{model}));});act(()=>tree.root.findAllByType('button').find(node=>flatten(node.children).includes('상세 보기')).props.onClick());assert.equal(button(tree,'환불 요청'),undefined);assert.equal(button(tree,'전액 환불하기'),undefined);assert.ok(button(tree,'닫기'));act(()=>tree.unmount());
});


test('preview persona button delegates the injected action and never appears in live profiles',()=>{
 const {CreatorProfilePage}=pages(),model=inputs(),calls=[];let tree;
 const previewLogin={label:'모카로 로그인',onClick:()=>calls.push('moka')};
 act(()=>{tree=create(h(CreatorProfilePage,{model:{...model,mode:'mock'},id:'artist-42',previewLogin}));});
 assert.ok(button(tree,'모카로 로그인'));act(()=>button(tree,'모카로 로그인').props.onClick());assert.deepEqual(calls,['moka']);
 act(()=>tree.update(h(CreatorProfilePage,{model,id:'artist-42',previewLogin})));assert.equal(button(tree,'모카로 로그인'),undefined);
 act(()=>tree.update(h(CreatorProfilePage,{model:{...model,mode:'mock'},id:'artist-42'})));assert.equal(button(tree,'모카로 로그인'),undefined);
 act(()=>tree.unmount());
});

test('a creator card without a profile background shows the light gray cover with the white logo (2026-11-01)',()=>{
  const {CreatorCard}=loadTypeScript('components/crefans/CreatorCard.tsx',{'next/link':({href,children,...props})=>h('a',{href,...props},children),'./creator.module.css':styles,'./profile-photo.module.css':styles,'./ServiceUI':{Avatar:({creator})=>h('img',{alt:creator?.name})},'./FollowButton':{FollowButton:()=>h('button')},'./CreatorName':{CreatorName:({person})=>h('span',null,person.name)},'@/components/ui/MarqueeText':{MarqueeText:({text})=>h('span',null,text)}});
  const base={id:'c1',name:'배경 없음',handle:'nocover',tags:[],image:'/avatar.png',position:'center',bio:'',followers:'0'};
  let tree;act(()=>{tree=create(h(CreatorCard,{creator:base,href:'/c',following:false,onFollow:()=>{}}));});
  assert.deepEqual(tree.root.findAllByType('img').filter(i=>i.props.src==='/brand/crefans-logo-inverse.svg').length,1,'white logo');
  act(()=>{tree.update(h(CreatorCard,{creator:{...base,cover:'/cover.png'},href:'/c',following:false,onFollow:()=>{}}));});
  assert.equal(tree.root.findAllByType('img').filter(i=>i.props.src==='/brand/crefans-logo-inverse.svg').length,0);assert.ok(tree.root.findAllByType('img').some(i=>i.props.src==='/cover.png'),'background shown');
});

test('resume confirms the original date and price, requires fresh consent, and preserves cancellation on failure',async()=>{
 const {SubscriptionsPage}=pages(),model=inputs(),calls=[];
 const sub={id:'sub-one',creatorId:'artist-42',planId:'independent-plan',status:'cancelled',renewAt:'2030-02-08',price:27500};model.subscriptions=[sub];
 model.resumeSubscription=async(...args)=>{calls.push(args);return failure('기본 카드를 등록해주세요.');};
 let tree;act(()=>{tree=create(h(SubscriptionsPage,{model}));});
 assert.equal(button(tree,'갱신 해지'),undefined);assert.match(text(tree),/종료일까지 이용 가능/);
 act(()=>button(tree,'다시 이용할래요').props.onClick());
 const dialog=()=>tree.root.findByProps({role:'dialog','aria-label':'다시 이용할까요?'});
 const confirm=()=>dialog().findAllByType('button').find(b=>flatten(b.props.children)==='다시 이용할래요');
 assert.equal(confirm().props.disabled,true);assert.match(text(tree),/지금은 결제하지 않아요/);assert.match(text(tree),/2030.02.08/);assert.match(text(tree),/27,500원/);
 await act(async()=>{await confirm().props.onClick();});assert.equal(calls.length,0);
 act(()=>dialog().findByType('input').props.onChange({target:{checked:true}}));
 await act(async()=>{await confirm().props.onClick();});assert.equal(calls.length,1);assert.equal(calls[0][0].id,'sub-one');assert.equal(calls[0][1],'2026-11-02.1');assert.equal(sub.status,'cancelled');assert.equal(flatten(dialog().findByProps({role:'alert'}).props.children),'기본 카드를 등록해주세요.');
 act(()=>button(tree,'취소').props.onClick());act(()=>button(tree,'다시 이용할래요').props.onClick());assert.equal(confirm().props.disabled,true);act(()=>tree.unmount());
});
test('resume blocks double submission and closing while pending, success closes the dialog',async()=>{
 const {SubscriptionsPage}=pages(),model=inputs();model.subscriptions=[{id:'sub-one',creatorId:'artist-42',planId:'independent-plan',status:'cancelled',renewAt:'2030-02-08',price:27500}];
 let resolve,calls=0,tree,request;model.resumeSubscription=()=>{calls++;return new Promise(r=>{resolve=r;});};
 act(()=>{tree=create(h(SubscriptionsPage,{model}));});act(()=>button(tree,'다시 이용할래요').props.onClick());
 act(()=>tree.root.findByType('input').props.onChange({target:{checked:true}}));
 const dialog=()=>tree.root.findByProps({role:'dialog','aria-label':'다시 이용할까요?'});
 const confirm=dialog().findAllByType('button').find(b=>flatten(b.props.children)==='다시 이용할래요');
 act(()=>{request=confirm.props.onClick();confirm.props.onClick();});assert.equal(calls,1);assert.equal(button(tree,'처리 중…').props.disabled,true);assert.equal(button(tree,'취소').props.disabled,true);
 await act(async()=>{resolve(ok('다음 결제일부터 다시 이용합니다.'));await request;});assert.equal(tree.root.findAllByProps({role:'dialog'}).length,0);assert.match(text(tree),/다음 결제일부터 다시 이용합니다/);act(()=>tree.unmount());
});
