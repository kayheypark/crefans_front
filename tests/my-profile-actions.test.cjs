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
    basePath:'/service',mode:'live',viewer:{name:'주입된 이름',handle:'injected',bio:'주입된 소개',image:'/custom-avatar.jpg'},
    following:['other'],saved:[],liked:[],canAccess:(_id,rank)=>rank===0,
    data:{creators:[],posts:[],faqs:[]},
    account:{email:'custom@example.test',stats:{posts:7,followers:19},preferences:{contentAlert:false,messageAlert:false,marketingAlert:false,showActivity:false,allowSearch:false},blockedCreatorIds:[],paymentMethods:[],tickets:[],inquiryCategories:[],banner:null,policies:{terms:'주입된 약관',privacy:'주입된 안내'},guidance:{},route:{profileTab:null,supportTab:'faq',settingsSection:null}},
    accountActions:{signup:unavailable,requestSignupCode:unavailable,verifySignupCode:unavailable,verifyIdentity:unavailable,login:unavailable,requestAuthHelp:unavailable,updateProfile:unavailable,updateSettings:unavailable,unblockCreator:unavailable,logout:unavailable,withdraw:unavailable,createInquiry:unavailable},
  };
}
function mount(Page,data){let tree;act(()=>{tree=create(React.createElement(beanContext.Provider,{value:{enabled:false,signedIn:true,wallet:null,refresh:async()=>{}}},React.createElement(Page,{model:data})));});return tree;}
test('my page: studio button for a member who is not a creator yet, settings behind a three-bar menu icon',()=>{
 for(const owners of [[],['me']]){
  const base=model(),tree=mount(pages.MyProfilePage,{...base,data:{...base.data,creatorPlans:{},plans:[]},ownCreatorIds:owners});
  try{
   const links=tree.root.findAllByType('a');
   const studio=links.filter(link=>link.props.href==='/service/studio');assert.equal(studio.length,1,`studio button with ownCreatorIds=${JSON.stringify(owners)}`);assert.match(JSON.stringify(studio[0].props.children),/스튜디오/);
   const settings=links.find(link=>link.props['aria-label']==='설정');assert.equal(settings.props.href,'/service/settings');
   assert.equal(settings.findByType('path').props.d,'M4 7h16M4 12h16M4 17h16','three horizontal bars, not the gear');
  }finally{act(()=>tree.unmount());}
 }
});
