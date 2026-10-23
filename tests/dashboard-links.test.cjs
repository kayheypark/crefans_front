const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const h=React.createElement,styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const mocks={
 './overview.module.css':styles,'./phone-frame.module.css':styles,'./choice.module.css':styles,'../CreatorPages':{CreatorProfilePage:()=>null},
 'next/link':props=>h('a',props),
 '@/components/ui/TextLink':{TextLink:props=>h('a',props)},
 '@/components/ui/Charts':{Trend:()=>null},
 '@/components/ui/DialogActions':{},'@/components/ui/Toggle':{Toggle:()=>null},'@/components/ui/SelectField':{},'@/components/ui/Primitives':{},
 '../ServiceUI':{PageTitle:({children,action})=>h('header',null,h('h1',null,children),action),Avatar:()=>h('span'),Empty:({title})=>h('p',null,title)},
};
const {DashboardPage}=loadTypeScript('components/crefans/studio/OverviewPages.tsx',mocks);

test('dashboard row links use injected destinations and activity without a destination remains noninteractive',()=>{
 const model={profile:{name:'주입된 크리에이터'},metrics:[],tasks:[{id:'task',title:'할 일',description:'내용',path:'accounts'}],activities:[{id:'linked',title:'연결된 활동',description:'활동 설명',time:'방금',path:'comments?post=provided'},{id:'static',title:'이동 없는 활동',description:'안내',time:'어제'}],contentPerformance:[{id:'provided-post',title:'주입된 게시물',image:'',views:8,likes:3,comments:1}]};
 let tree;act(()=>{tree=create(h(DashboardPage,{model,basePath:'/custom/studio'}));});
 try{
  const anchors=tree.root.findAllByType('a');
  assert.equal(anchors.find(item=>item.props.className==='task').props.href,'/custom/studio/accounts');
  assert.equal(anchors.find(item=>item.props.className==='activity').props.href,'/custom/studio/comments?post=provided');
  assert.equal(anchors.find(item=>item.props.className==='performanceRow').props.href,'/custom/studio/content/provided-post/edit');
  assert.equal(anchors.find(item=>item.props.className==='creatorBanner').props.href,'/custom/studio/settings');
  const staticActivity=tree.root.findAllByType('article').find(item=>item.props.className==='activity');
  assert.equal(staticActivity.findByType('strong').children[0],'이동 없는 활동');
  assert.equal(staticActivity.props.tabIndex,undefined);assert.equal(staticActivity.props.onClick,undefined);
 }finally{act(()=>tree.unmount());}
});

test('creator start and settings forms keep their primary button disabled until required fields are valid',()=>{
 const {CreatorStartPage,CreatorSettingsPage}=loadTypeScript('components/crefans/studio/OverviewPages.tsx',{...mocks,
  '@/components/ui/SelectField':{SelectField:({value,onChange,label})=>h('select',{value,'aria-label':label,onChange:event=>onChange(event.target.value)})},
  '@/components/ui/Primitives':{Field:({label,value,onChange,hint,error,...props})=>h('input',{...props,value,'aria-label':label,onChange}),TextAreaField:({label,value,onChange,hint,error,...props})=>h('textarea',{...props,value,'aria-label':label,onChange}),Dialog:({open,children})=>open?h('dialog',null,children):null},
  '@/components/ui/Toggle':{Toggle:({checked,onChange})=>h('input',{type:'checkbox',role:'switch',checked,onChange:event=>onChange(event.target.checked)})},
  '@/components/ui/DialogActions':{DialogActions:({children})=>h('footer',null,children)},
  '../ServiceUI':{PageTitle:({children})=>h('h1',null,children),Avatar:()=>h('span'),Empty:({title})=>h('p',null,title),Action:({variant,...props})=>h('button',props),Notice:({children})=>h('p',null,children)},
 });
 const model={profile:{name:'',handle:'haneul',bio:'',avatar:'',cover:'',category:'라이프스타일',active:true,commentsEnabled:true},started:false,categories:['라이프스타일'],period:'',metrics:[],activities:[],tasks:[],series:[],contentPerformance:[],completeOnboarding:async()=>({success:true,data:{message:'ok'},errorMessage:null,errorCode:null}),updateProfile:async()=>({success:true,data:{message:'ok'},errorMessage:null,errorCode:null}),setActivity:async()=>({success:true,data:{message:'ok'},errorMessage:null,errorCode:null}),setCommentsEnabled:async()=>({success:true,data:{message:'ok'},errorMessage:null,errorCode:null})};
 let start;act(()=>{start=create(React.createElement(CreatorStartPage,{model,basePath:'/studio'}));});
 try{
  const next=()=>start.root.findAllByType('button').find(button=>button.props.type==='submit');
  assert.equal(next().props.disabled,true);
  act(()=>start.root.findAllByType('input').find(input=>input.props.value==='').props.onChange({target:{value:'하늘'}}));
  assert.equal(next().props.disabled,false);
 }finally{act(()=>start.unmount());}
 let settings;act(()=>{settings=create(React.createElement(CreatorSettingsPage,{model,basePath:'/studio'}));});
 try{
  const submit=()=>settings.root.findAllByType('button').find(button=>button.props.type==='submit');
  assert.equal(submit().props.disabled,true);
  const field=label=>settings.root.findAllByType('input').concat(settings.root.findAllByType('textarea')).find(node=>node.props['aria-label']===label);
  assert.ok(field('소개 글')&&field('유튜브')&&field('인스타그램')&&field('페이스북'),'settings manage the long intro and the three SNS links');
  act(()=>field('크리에이터 활동명').props.onChange({target:{value:'하늘'}}));
  assert.equal(submit().props.disabled,false);
  act(()=>field('유튜브').props.onChange({target:{value:'youtube.com/@haneul'}}));
  assert.equal(submit().props.disabled,true,'a link without http(s) blocks saving');
  act(()=>field('유튜브').props.onChange({target:{value:'https://youtube.com/@haneul'}}));
  assert.equal(submit().props.disabled,false);
 }finally{act(()=>settings.unmount());}
});
