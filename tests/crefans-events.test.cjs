const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const {serviceEvents}=loadTypeScript('lib/content/events.ts');
const {EventsPage,EventDetailPage}=loadTypeScript('components/crefans/EventPages.tsx',{
 './events.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},
 'next/link':({children,...props})=>el('a',props,children),
 './Brand':{Brand:({href})=>el('a',{href,'aria-label':'crefans 홈'})},
 './BackButton':{BackButton:({href,label})=>el('a',{href,'aria-label':label})},
 './CommonPages':{CommonNavigation:()=>null},
 './ServiceUI':{ActionLink:({children,...props})=>el('a',props,children),PageTitle:({children,back})=>el('header',null,back,el('h1',null,children)),Empty:({title})=>el('p',null,title)},
});
function mount(Component,props){let tree;act(()=>{tree=create(el(Component,props));});return tree;}
const close=tree=>act(()=>tree.unmount());
test('beta appreciation content preserves the approved four rewards without invented dates',()=>{
 assert.equal(serviceEvents.length,4);
 assert.ok(serviceEvents.every(event=>event.campaignTitle==='크레팬스 오픈 기념 이벤트'));
 assert.doesNotMatch(JSON.stringify(serviceEvents),/원년멤버/);
 assert.equal(new Set(serviceEvents.map(event=>event.id)).size,4);
 assert.ok(serviceEvents.every(event=>event.rewards.length===1));
 assert.deepEqual(serviceEvents.flatMap(event=>event.rewards).map(({audience,title,details})=>({audience,title,details})),[
  {audience:'유용한 피드백 제공자 최대 3명',title:'네이버페이\n1만원 상품권',details:['유용한 피드백을 주신 분 중 최대 3명에게 드립니다.']},
  {audience:'기간 2배 이벤트 상품',title:'주목할 크리에이터\n노출기간 2배',details:['일반 상품 가격으로 두 배의 기간을 이용하는 별도 이벤트 상품입니다.','2일 3,900원 · 6일 11,700원 · 14일 27,300원 · 60일 117,000원 (VAT 포함)']},
  {audience:'전체 회원 · 계정당 1회',title:'프로모션 100콩',details:['전체 회원에게 계정당 한 번, 받기 버튼으로 즉시 지급합니다.','프로모션 콩은 후원받은 사람이 출금할 수 있습니다.']},
  {audience:'전체 회원 · 계정당 1회',title:'오픈 기념 한정판 배지',details:['크레팬스 전체 회원, 받기 버튼으로 오픈 기념 배지를 받아보세요.','받기 버튼을 누르면 프로필에 바로 표시됩니다.','표시 여부는 직접 선택할 수 있습니다.']},
 ]);
 assert.ok(serviceEvents.filter(event=>!['promotion-beans','founding-badge'].includes(event.id)).every(event=>event.schedule.includes('미정')));
 assert.match(serviceEvents[3].schedule,/받기 버튼.*즉시 지급/);
 assert.ok(serviceEvents[2].notes.flatMap(note=>note.items).some(note=>note.includes('직접 출금하거나 환불받을 수 없습니다')));
});
test('event list and detail share injected content and preserve preview/service destinations',()=>{
 for(const basePath of ['/preview','/service'])for(const source of serviceEvents){
  const event={...source,id:'injected',title:'주입된 이벤트'};
  const list=mount(EventsPage,{events:[event],basePath});
  assert.equal(list.root.findAllByType('a')[0].props.href,`${basePath}/events/injected`);
  const banner=list.root.findByType('img');
  assert.equal(list.root.findAllByType('a')[0].props['aria-label'],event.title);
  assert.equal(banner.props.alt,'');
  assert.equal(banner.props.src,event.image);
  assert.equal(banner.props.width,event.imageWidth);
  assert.equal(banner.props.height,event.imageHeight);
  assert.equal(banner.props.src,event.rewards[0].image);
  assert.equal(list.root.findByType('h2').props.children,event.banner.title);
  assert.equal(list.root.findByType('p').props.children,event.banner.description);close(list);
  const detail=mount(EventDetailPage,{event,basePath});
  assert.equal(detail.root.findByType('h1').props.children,event.title);
  assert.equal(detail.root.findByProps({'aria-label':'이벤트 목록으로'}).props.href,`${basePath}/events`);
  assert.deepEqual(detail.root.findAllByProps({className:'rewardTitle'}).map(node=>node.props.children),event.rewards.map(reward=>reward.title));
  const groups=detail.root.findAllByProps({className:'noteGroup'});
  assert.deepEqual(groups.map(group=>group.findByType('h3').props.children),event.notes.map(note=>note.title));
  assert.deepEqual(groups.map(group=>group.findAllByType('li').map(item=>item.props.children)),event.notes.map(note=>note.items));
  assert.deepEqual(detail.root.findAllByProps({className:'rewardNotice'}).map(node=>node.props.children[1]),event.rewards.filter(reward=>reward.notice).map(reward=>reward.notice));
  const artwork=detail.root.findAllByType('img');
  assert.deepEqual(artwork.map(node=>node.props.src),event.rewards.map(reward=>reward.image));
  assert.ok(artwork.every(node=>node.props.alt===''),'illustrations are decorative; reward text must remain HTML');
  const details=detail.root.findAllByProps({className:'rewardDetails'});
  assert.equal(details.length,1);
  for(let i=0;i<details.length;i++)assert.deepEqual(details[i].findAllByType('li').map(node=>node.props.children[1]),event.rewards[i].details);
  assert.ok(!JSON.stringify(detail.toJSON()).includes('beta-first.png'),'old full poster must not be embedded');
  assert.equal(detail.root.findAllByType('button').length,0,'announcement must not simulate benefit grants');
  close(detail);
 }
});
test('empty and missing event pages do not substitute promotional fixtures',()=>{
 const list=mount(EventsPage,{events:[],basePath:'/preview'});
 assert.match(JSON.stringify(list.toJSON()),/등록된 이벤트가 없습니다/);
 assert.equal(list.root.findAllByType('img').length,0);close(list);
 const detail=mount(EventDetailPage,{basePath:'/service'});
 assert.match(JSON.stringify(detail.toJSON()),/이벤트를 찾을 수 없습니다/);
 assert.equal(detail.root.findAllByType('dt').length,0);close(detail);
});

test('all four destinations are listed once in the approved order',()=>{
 for(const basePath of ['/preview','/service']){
  const tree=mount(EventsPage,{events:serviceEvents,basePath});
  assert.deepEqual(tree.root.findAllByType('a').map(node=>node.props.href),serviceEvents.map(event=>`${basePath}/events/${event.id}`));
  assert.equal(tree.root.findAllByType('img').length,4);close(tree);
 }
});
test('open claims have their own eligibility and expiry; other reward terms remain separate',()=>{
 for(const [index,event] of serviceEvents.entries()){
  const text=JSON.stringify(event);
  for(const item of (index===1?['소급','중복 적용','고객센터','광고성 정보 수신']:['소급','중복 수령','고객센터','광고성 정보 수신']))assert.ok(text.includes(item),item);
  if(index>=2){assert.match(text,/전체 회원/);assert.match(text,/계정당 1회/);assert.doesNotMatch(text,/참여 확정|참여가 확정|팬 13명|대상자로 지정|지급일은.*미정/);}
  else if(index===0)assert.match(text,/크리에이터 3명과 팬 13명/);else{assert.match(text,/50%/);assert.match(text,/총 노출기간/);assert.doesNotMatch(text,/30일 이용권|크리에이터 3명에게/);}
 }
 const beans=JSON.stringify(serviceEvents[2]);
 for(const text of ['30일(720시간)','사용하지 않은 이벤트 콩 잔액만','연장되지 않습니다','1,000콩','20%','8만원','실제 은행 출금을 제공하지'])assert.ok(beans.includes(text),text);
 assert.doesNotMatch(beans,/5년/);
 const badge=JSON.stringify(serviceEvents[3]);assert.match(badge,/배지에는 30일 사용기한이 적용되지/);assert.match(badge,/숨길/);
});
test('legacy omnibus links redirect to the four-event list and invalid IDs remain missing',async()=>{
 for(const basePath of ['/preview','/service']){
  const router=basePath==='/preview'?'@/components/preview/service/ServiceRouter':'@/components/service/ServiceRouter';
  const {default:Page,generateMetadata}=loadTypeScript(`app${basePath}/[...screen]/page.tsx`,{
   [router]:{__esModule:true,default:()=>null},
   'next/navigation':{redirect:target=>{throw new Error(`redirect:${target}`);},notFound:()=>{throw new Error('notFound');}},
  });
  await assert.rejects(Page({params:Promise.resolve({screen:['events','beta-first']})}),{message:`redirect:${basePath}/events`});
  await assert.rejects(Page({params:Promise.resolve({screen:['events','unknown']})}),{message:'notFound'});
  await assert.rejects(Page({params:Promise.resolve({screen:['events','beta-first','extra']})}),{message:'notFound'});
  for(const event of serviceEvents){
   const props={params:Promise.resolve({screen:['events',event.id]})};
   assert.ok(await Page(props));// Service event pages are public and use the share title format (lib/seo, 2026-11-01); preview keeps its plain title.
   assert.equal((await generateMetadata(props)).title,`${event.title} | 크레팬스(Crefans)`);
  }
 }
});

// 2026-11-01 SEO decision: event pages dropped the 'beta-' prefix; old addresses move permanently (301).
test('old beta- event addresses redirect with 301 and the event ids carry no beta- prefix',async()=>{
 const redirects=await require('../next.config.js').redirects(),{serviceEvents}=loadTypeScript('lib/content/events.ts');
 assert.ok(serviceEvents.length>0&&serviceEvents.every(e=>!e.id.startsWith('beta-')));
 for(const base of ['service','preview']){
  for(const e of serviceEvents)assert.ok(redirects.some(r=>r.source===`/${base}/events/beta-${e.id}`&&r.destination===`/${base}/events/${e.id}`&&r.statusCode===301),e.id);
  assert.ok(redirects.some(r=>r.source===`/${base}/events/beta-first`&&r.destination===`/${base}/events`&&r.statusCode===301));
 }
});


test('feedback email opens a Korean draft for the specified inbox on both routes without claiming receipt',()=>{
 const event=serviceEvents.find(e=>e.id==='feedback');
 for(const basePath of ['/preview','/service']){
  const tree=mount(EventDetailPage,{event,basePath});
  const draftLinks=tree.root.findAllByType('a').filter(a=>a.props.href.startsWith('mailto:'));
  assert.equal(draftLinks.length,1);
  const href=new URL(draftLinks[0].props.href);
  assert.equal(href.pathname,'khpark@crefans.com');
  assert.equal(href.searchParams.get('subject'),'[크레팬스 피드백 이벤트] @핸들 · 피드백 제목');
  const body=href.searchParams.get('body');
  for(const item of ['프로필 핸들(@아이디)','참여 유형(크리에이터 / 팬)','피드백 내용','해당하는 경우','재현 순서','기대했던 결과','실제 결과','개선 아이디어','첨부 자료(선택)'])assert.ok(body.includes(item),item);
  assert.ok(body.includes('\r\n'));
  assert.equal(href.searchParams.get('cc'),null);assert.equal(href.searchParams.get('bcc'),null);
  assert.equal(draftLinks[0].props.children,'이메일로 피드백 보내기');
  assert.match(JSON.stringify(tree.toJSON()),/이메일 발송만으로.*보장되지는 않습니다/);
  assert.match(JSON.stringify(tree.toJSON()),/메일 앱이 열리지 않으면/);
  assert.equal(tree.root.findAllByType('form').length,0);
  close(tree);
 }
 for(const event of serviceEvents.filter(e=>e.id!=='feedback')){
  assert.equal(event.submission,undefined);
  const tree=mount(EventDetailPage,{event,basePath:'/service'});
  assert.equal(tree.root.findAllByType('a').filter(a=>a.props.href.startsWith('mailto:')).length,0);close(tree);
 }
});
