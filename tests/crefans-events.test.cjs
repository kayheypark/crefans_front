const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const el=React.createElement;
const {serviceEvents}=loadTypeScript('lib/content/events.ts');
const {EventsPage,EventDetailPage}=loadTypeScript('components/crefans/EventPages.tsx',{
 './events.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},
 'next/link':({children,...props})=>el('a',props,children),
 './Brand':{Brand:({href})=>el('a',{href,'aria-label':'crefans 홈'})},
 './BackButton':{BackButton:({href,label})=>el('a',{href,'aria-label':label})},
 './CommonPages':{CommonNavigation:()=>null},
 './ServiceUI':{PageTitle:({children,back})=>el('header',null,back,el('h1',null,children)),Empty:({title})=>el('p',null,title)},
});
function mount(Component,props){let tree;act(()=>{tree=create(el(Component,props));});return tree;}
const close=tree=>act(()=>tree.unmount());
test('beta appreciation content preserves the approved four rewards without invented dates',()=>{
 assert.deepEqual(serviceEvents[0].rewards.map(({audience,title,details})=>({audience,title,details})),[
  {audience:'참여 확정 테스터 전원',title:'원년멤버 한정판 뱃지',details:['참여가 확정된 테스터 전원에게 드립니다.','배지 지급 후 프로필 페이지에 표시됩니다.','표시 여부는 직접 선택할 수 있습니다.']},
  {audience:'크리에이터 3명',title:'주목할 크리에이터\n광고상품 30일',details:['크리에이터 3명에게 드립니다.','주목할 크리에이터 광고상품 이용권을 제공합니다.']},
  {audience:'팬 참여자 13명',title:'프로모션 100콩',details:['팬 참여자 13명에게 지급합니다.','프로모션 콩은 후원받은 사람이 출금할 수 있습니다.']},
  {audience:'유용한 피드백 제공자 최대 3명',title:'배민 1만원 상품권',details:['유용한 피드백을 주신 분 중 최대 3명에게 드립니다.']},
 ]);
 assert.match(serviceEvents[0].schedule,/미정/);
 assert.ok(serviceEvents[0].notes.flatMap(note=>note.items).some(note=>note.includes('직접 출금할 수 없으며 후원에 사용할 수 있습니다')));
});
test('event list and detail share injected content and preserve preview/service destinations',()=>{
 for(const basePath of ['/preview','/service']){
  const event={...serviceEvents[0],id:'injected',title:'주입된 이벤트'};
  const list=mount(EventsPage,{events:[event],basePath});
  assert.equal(list.root.findAllByType('a')[0].props.href,`${basePath}/events/injected`);
  const banner=list.root.findByType('img');
  assert.equal(banner.props.alt,event.title);
  assert.equal(banner.props.src,event.image);
  assert.equal(banner.props.width/banner.props.height,3);
  assert.equal(list.root.findAllByType('h2').length,0);
  assert.equal(list.root.findAllByType('p').length,0);close(list);
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
  assert.equal(details.length,4);
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
