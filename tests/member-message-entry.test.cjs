// 2026-11-24: a member (fan) profile offers 메시지 → /messages?to=<id>; hidden on my own profile, a trial author, or someone I blocked.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;const el=React.createElement,styles={__esModule:true,default:new Proxy({},{get:(_,k)=>String(k)})};
const PublicMemberPage=loadTypeScript('components/crefans/PublicMemberPage.tsx',{
 './creator.module.css':styles,'./ProfileHeader':{ProfileHeader:({action})=>el('header',null,action)},
 './FollowButton':{FollowButton:()=>el('button',null,'팔로우')},'./ServiceUI':{Empty:({title})=>el('p',null,title),ActionLink:({href,children})=>el('a',{href},children)},'./Icon':{__esModule:true,default:()=>null},
 './CreatorPages':{ProfilePostsPanel:()=>null},'@/lib/crefans/post-media':{getPostMedia:()=>[]}}).default;
const profile={id:'fan 1',name:'팬',handle:'fan1',image:'',tags:[],isCreator:false};
const links=(overrides={},person=profile)=>{let view;act(()=>{view=create(el(PublicMemberPage,{profile:person,model:{basePath:'/service',following:[],blockedCreatorIds:[],viewerId:'me',toggleFollow(){},data:{posts:[]},...overrides}}));});const hrefs=view.root.findAllByType('a').map(a=>a.props.href);act(()=>view.unmount());return hrefs;};
test('member profile links 메시지 to a new conversation with that member',()=>{assert.deepEqual(links(),['/service/messages?to=fan%201']);});
test('no 메시지 on my own profile, a blocked member or a trial author',()=>{
 assert.deepEqual(links({viewerId:'fan 1'}),[]);
 assert.deepEqual(links({blockedCreatorIds:['fan 1']}),[]);
 assert.deepEqual(links({},{...profile,isGuest:true}),[]);
});
