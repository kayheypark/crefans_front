// 2026-11-13 user request: my page always shows the studio button and opens settings from a three-bar menu icon.
// Same loader as crefans-account.test.cjs, with an inert router (MyProfilePage now reads it).
const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const beanContext=React.createContext(null);
const pages=loadTypeScript('components/crefans/AccountPages.tsx',{'./accordion.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},
  './social.module.css':styles,'./common.module.css':styles,'./account.module.css':styles,'./creator.module.css':styles,'./choice.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./toggle.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./service.module.css':styles,'./ui.module.css':styles,'./avatar.module.css':styles,'./select.module.css':styles,'./field.module.css':styles,'./brand.module.css':styles,
  './BeanContext':{useBeans:()=>React.useContext(beanContext)},
  'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),
  'next/navigation':{useRouter(){return{push(){},replace(){},prefetch(){},refresh(){}};},useSearchParams(){return new URLSearchParams();},usePathname(){return '/service/me';}},
  '@/components/ui/Primitives':{
    ...loadTypeScript('components/ui/Primitives.tsx',{'./ui.module.css':styles,'./field.module.css':styles,'./select.module.css':styles,'./choice.module.css':styles}),
    Dialog:({open,title,children})=>open?React.createElement('section',{'data-dialog':title},children):null,
  },
});
const text=tree=>JSON.stringify(tree.toJSON());
const failure=message=>({success:false,data:null,errorMessage:message,errorCode:'REJECTED'});
const success=message=>({success:true,data:{message},errorMessage:null,errorCode:null});
function model(){
  const unavailable=async()=>failure('이 동작은 테스트에 주입하지 않았습니다.');
  return{
    basePath:'/service',mode:'preview',viewer:{name:'주입된 이름',handle:'injected',bio:'주입된 소개',image:'/custom-avatar.jpg'},
    following:['other'],saved:[],liked:[],canAccess:(_id,rank)=>rank===0,
    data:{creators:[],posts:[],faqs:[]},
    account:{email:'custom@example.test',stats:{posts:7,followers:19},preferences:{contentAlert:false,messageAlert:false,marketingAlert:false,showActivity:false,allowSearch:false},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{terms:'주입된 약관',privacy:'주입된 안내'},guidance:{},route:{profileTab:null,supportTab:'faq',settingsSection:null}},
    accountActions:{signup:unavailable,requestSignupCode:unavailable,verifySignupCode:unavailable,verifyIdentity:unavailable,login:unavailable,requestAuthHelp:unavailable,updateProfile:unavailable,updateSettings:unavailable,unblockCreator:unavailable,logout:unavailable,withdraw:unavailable,createInquiry:unavailable},
  };
}
function mount(Page,data){let tree;act(()=>{tree=create(React.createElement(beanContext.Provider,{value:{enabled:false,signedIn:true,wallet:null,refresh:async()=>{}}},React.createElement(Page,{model:data})));});return tree;}
// 2026-11-15: a member who is not a creator gets 글쓰기 (their posts open in the member studio); a creator keeps 스튜디오.
test('my page: 글쓰기 for a member who is not a creator, 스튜디오 for a creator, settings behind a three-bar menu icon',()=>{
 for(const owners of [[],['me']]){
  const base=model();base.photoLibrary={};base.accountActions.updatePhotos=async()=>{};
  const tree=mount(pages.MyProfilePage,{...base,data:{...base.data,creatorPlans:{},plans:[]},ownCreatorIds:owners});
  try{
   const library=tree.root.findAllByType('button').filter(button=>button.children.includes('내 보관함'));
   assert.equal(library.length,1);
   assert.deepEqual(library[0].parent.findAllByType('button').map(button=>button.children.at(-1)),['내 보관함','배경 사진 변경']);
   const links=tree.root.findAllByType('a');
   const [href,label]=owners.length?['/service/studio','스튜디오']:['/service/studio/content/new','글쓰기'];const studio=links.filter(link=>link.props.href===href);assert.equal(studio.length,1,`cover button with ownCreatorIds=${JSON.stringify(owners)}`);assert.match(JSON.stringify(studio[0].props.children),new RegExp(label));
   const settings=links.find(link=>link.props['aria-label']==='설정');assert.equal(settings.props.href,'/service/settings');
   assert.equal(settings.findByType('path').props.d,'M4 7h16M4 12h16M4 17h16','three horizontal bars, not the gear');
  }finally{act(()=>tree.unmount());}
 }
});
