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
 assert.equal(new Set(serviceEvents.map(event=>event.id)).size,4);
 assert.ok(serviceEvents.every(event=>event.rewards.length===1));
 assert.deepEqual(serviceEvents.flatMap(event=>event.rewards).map(({audience,title,details})=>({audience,title,details})),[
  {audience:'유용한 피드백 제공자 최대 3명',title:'네이버페이\n1만원 상품권',details:['유용한 피드백을 주신 분 중 최대 3명에게 드립니다.']},
  {audience:'크리에이터 3명',title:'주목할 크리에이터\n광고상품 30일',details:['크리에이터 3명에게 드립니다.','주목할 크리에이터 광고상품 이용권을 제공합니다.']},
  {audience:'팬 참여자 13명',title:'프로모션 100콩',details:['참여 확정 팬 13명, 받기 버튼으로 즉시 지급합니다.','프로모션 콩은 후원받은 사람이 출금할 수 있습니다.']},
  {audience:'참여 확정 회원 전원',title:'원년멤버 한정판 뱃지',details:['참여가 확정된 회원 전원, 받기 버튼으로 배지를 받아보세요.','받기 버튼을 누르면 프로필에 바로 표시됩니다.','표시 여부는 직접 선택할 수 있습니다.']},
 ]);
 assert.ok(serviceEvents.filter(event=>!['promotion-beans','founding-badge'].includes(event.id)).every(event=>event.schedule.includes('미정')));
 assert.match(serviceEvents[3].schedule,/받기 버튼.*즉시 지급/);
 assert.ok(serviceEvents[2].notes.flatMap(note=>note.items).some(note=>note.includes('직접 출금할 수 없으며 후원에 사용할 수 있습니다')));
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
test('every detail repeats common terms and only its own benefit conditions',()=>{
 const specific=[['유용한 피드백 선정','네이버페이 1만원 상품권'],['주목할 크리에이터 광고상품'],['프로모션 100콩과 출금'],['원년멤버 한정판 배지']];
 const common=['참여 대상과 지급 기준','개인정보·부정 참여·문의'];
 const commonNotes=serviceEvents[0].notes.filter(note=>common.includes(note.title));
 assert.equal(commonNotes.length,2);
 for(const [index,event] of serviceEvents.entries()){
  const shared=event.notes.filter(note=>common.includes(note.title));
  assert.deepEqual(shared.map(note=>note.title),common);
  assert.deepEqual(shared[0].items.slice(0,2),commonNotes[0].items.slice(0,2));
  assert.deepEqual(shared[1],commonNotes[1]);
  if(index===0)assert.match(shared[0].items[2],/khpark@crefans.com/);
  else if(index===2)assert.match(shared[0].items[2],/100콩 받기.*중복 지급되지 않습니다/);
  else if(index===3)assert.match(shared[0].items[2],/원년멤버 배지 받기.*중복 지급되지 않습니다/);
  else assert.match(shared[0].items[2],/참여 방법과 완료 기준.*미정/);
  assert.deepEqual(event.notes.filter(note=>!common.includes(note.title)).map(note=>note.title),specific[index]);
  const text=event.notes.flatMap(note=>note.items).join(' ');
  for(const requirement of ['만 19세','회원가입만으로','1인 1회',...(index>=2?['참여 기간은 확정 후']:['미정']),'소급','중복 수령','고객센터','광고성 정보 수신'])assert.ok(text.includes(requirement),requirement);
  if(index!==0)assert.doesNotMatch(text,/상품권|피드백의 구체성|등록 기한/);
  if(index!==1)assert.doesNotMatch(text,/광고상품|고정 노출|매출을 보장/);
  if(index!==2)assert.doesNotMatch(text,/출금|수수료|100콩|본인 계좌/);
  if(index!==3)assert.doesNotMatch(text,/기념 배지|숨길|크리에이터 인증/);
 }
 const gift=serviceEvents[0].notes.flatMap(note=>note.items).join(' ');
 assert.match(gift,/피드백 접수·선정 일정/);assert.match(gift,/상품권 발송에 추가 정보/);
 const beans=serviceEvents[2].notes.flatMap(note=>note.items).join(' ');
 for(const preserved of ['1,000콩','20%','8만원','본인 계정에 대한 후원은 허용되지','실제 은행 출금을 제공하지'])assert.ok(beans.includes(preserved));
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
   assert.equal((await generateMetadata(props)).title,basePath==='/service'?`${event.title} | 크레팬스`:`${event.title} · crefans`);
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
