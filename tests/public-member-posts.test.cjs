// 2026-11-15: members who are not creators may post, so their public profile lists their posts (feed and media tabs share
// ProfilePostsPanel with creator profiles) instead of a fixed empty state.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;const el=React.createElement,styles={__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})};
const PublicMemberPage=loadTypeScript('components/crefans/PublicMemberPage.tsx',{
 './creator.module.css':styles,'./ProfileHeader':{ProfileHeader:({counts})=>el('header',{'data-counts':JSON.stringify(counts.map(c=>[c.label,typeof c.value==='number'?c.value:null]))})},
 './FollowButton':{FollowButton:()=>null},'./ServiceUI':{Empty:({title})=>el('p',null,title)},'./Icon':{__esModule:true,default:()=>null},
 './CreatorPages':{ProfilePostsPanel:({tab,posts})=>el('div',{'data-panel':tab,'data-posts':posts.map(p=>p.id).join(',')})},
 '@/lib/crefans/post-media':{getPostMedia:post=>post.media||[]}}).default;
test('member profile shows only that member\'s posts with feed and media counts',()=>{
 const posts=[{id:'m1',creatorId:'member',media:[{type:'image',url:'/a'}]},{id:'m2',creatorId:'member',media:[]},{id:'c1',creatorId:'creator',media:[]}];
 const model={basePath:'/service',following:[],toggleFollow(){},data:{posts}};let view;
 act(()=>{view=create(el(PublicMemberPage,{profile:{id:'member',name:'회원',handle:'member',bio:'',postCount:2,followers:'0',followingCount:0},model}));});
 const panel=()=>view.root.find(n=>n.props['data-panel']);
 assert.equal(panel().props['data-panel'],'피드');assert.equal(panel().props['data-posts'],'m1,m2','other authors are left out');
 const count=i=>view.root.findAll(n=>n.type==='button')[i].findAll(n=>n.type==='span').map(n=>n.children.join(''));assert.deepEqual([count(0),count(1),count(2)],[['2'],['1'],[]],'feed 2, media 1, 소개 has no count');
 act(()=>view.root.findAll(n=>n.type==='button')[1].props.onClick());assert.equal(panel().props['data-panel'],'미디어');
 act(()=>view.root.findAll(n=>n.type==='button')[2].props.onClick());assert.equal(view.root.findAll(n=>n.props['data-panel']).length,0,'소개 tab shows the bio instead');
 act(()=>view.unmount());
});
