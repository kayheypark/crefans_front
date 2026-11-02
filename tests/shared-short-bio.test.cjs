const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const {useMockOverview}=loadTypeScript('components/preview/studio/useMockOverview.ts');
const {PreviewProvider,usePreview,usePreviewCreatorUpdate}=loadTypeScript('components/preview/service/PreviewProvider.tsx',{
 'next/navigation':{useRouter:()=>({push(){}}),useSearchParams:()=>new URLSearchParams()},
 '@/components/crefans/ApiState':{ApiState:({response,children})=>children(response.data)},
 '@/components/crefans/BeanContext':{BeanContext:React.createContext(null)},
 './useMockBeans':{useMockBeans:()=>({})},'./useMockSocial':{useMockSocial:()=>({})},'./useMockCommon':{useMockCommon:()=>({paymentMethods:[]})},'./useMockFoundingBadge':{useMockFoundingBadge:()=>({})},
 '../studio/useMockManagement':{useMockManagement:()=>({contents:[],memberships:[],subscribers:[]})},
});
for(const id of ['haneul','moka'])test(`shared mock short bio updates both ways for ${id}; detailed about remains separate`,async()=>{
 const previous=global.sessionStorage,storage=new Map([['crefans-preview-creator',id]]);global.sessionStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
 const data={creators:[{id,name:'테스트 창작자',handle:id,bio:'기존 소개',about:'상세 소개\n보존',image:'',tags:['사진']}],posts:[],paymentHistory:[],plans:[],creatorPlans:{[id]:[]}};
 let fan,studio,tree;function Probe(){fan=usePreview();studio=useMockOverview(fan.data.creators.find(c=>c.id===id),usePreviewCreatorUpdate());return null;}
 try{
  await act(async()=>{tree=create(React.createElement(PreviewProvider,{response:{success:true,data}},React.createElement(Probe)));});
  assert.equal(fan.viewer.bio,'기존 소개');assert.equal(studio.profile.bio,'기존 소개');
  await act(async()=>{assert.equal((await fan.accountActions.updateProfile({name:'테스트',bio:'회원 화면 수정'})).success,true);});
  assert.equal(studio.profile.bio,'회원 화면 수정');assert.equal(studio.profile.about,'상세 소개\n보존');
  await act(async()=>{assert.equal((await studio.updateProfile({...studio.profile,bio:'스튜디오 수정'})).success,true);});
  assert.equal(fan.viewer.bio,'스튜디오 수정');assert.equal(fan.data.creators[0].about,'상세 소개\n보존');
  await act(async()=>{assert.equal((await studio.updateProfile({...studio.profile,bio:'',about:'새 상세 소개'})).success,true);});
  assert.equal(fan.viewer.bio,'');assert.equal(studio.profile.bio,'');assert.equal(fan.data.creators[0].about,'새 상세 소개');
  await act(async()=>{assert.equal((await fan.accountActions.updateProfile({name:'테스트',bio:'x'.repeat(121)})).success,false);assert.equal((await studio.updateProfile({...studio.profile,bio:'x'.repeat(121)})).success,false);});
  assert.equal(fan.viewer.bio,'');assert.equal(studio.profile.about,'새 상세 소개');
 }finally{act(()=>tree?.unmount());global.sessionStorage=previous;}
});
