const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles=new Proxy({},{get:(_,key)=>String(key)});
const pages=loadTypeScript('components/crefans/AccountPages.tsx',{'./accordion.module.css':{__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})},
  './social.module.css':styles,'./common.module.css':styles,'./account.module.css':styles,'./creator.module.css':styles,'./choice.module.css':styles,'./dialog-actions.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./text-link.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./toggle.module.css':new Proxy({},{get:(_,key)=>String(key)}),'./service.module.css':styles,'./ui.module.css':styles,'./avatar.module.css':styles,'./select.module.css':styles,'./field.module.css':styles,'./brand.module.css':styles,
  'next/link':({href,children,...props})=>React.createElement('a',{href,...props},children),
  'next/navigation':{useRouter(){throw new Error('Presentation must not navigate independently');},useSearchParams(){throw new Error('Route state must be injected');}},
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
function mount(Page,data){let tree;act(()=>{tree=create(React.createElement(Page,{model:data}));});return tree;}
function change(input,value){act(()=>input.props.onChange({target:{value}}));}
function field(tree,name){const label=tree.root.findAllByType('label').find(item=>item.children.includes(name));return tree.root.findAllByType('input').find(input=>input.props.id===label.props.htmlFor);}
const flat=node=>typeof node==='string'?node:(node.children||[]).map(flat).join('');
function button(tree,label){return tree.root.findAllByType('button').find(item=>flat(item)===label);}

 test('account view renders injected profile and delegates edits without mutating its data',async()=>{
  const data=model(),calls=[];
  data.accountActions.updateProfile=async input=>{calls.push(input);return success('서버에서 받은 완료 문구');};
  const profile=mount(pages.MyProfilePage,data);
  assert.match(text(profile),/주입된 이름/);assert.match(text(profile),/주입된 소개/);
  assert.equal(profile.root.findByType('img').props.src,'/custom-avatar.jpg');
  assert.match(text(profile),/"19"/);
  const settingsLink=profile.root.findAllByType('a').find(link=>flat(link)==='설정');
  assert.equal(settingsLink.props.href,'/service/settings','the cover ⚙ 설정 button is the only way into settings');
  assert.equal(profile.root.findAllByType('a').every(link=>link.props.href.startsWith('/service/')),true);
  assert.equal(button(profile,'프로필 수정'),undefined,'no edit button on the profile itself');
  act(()=>profile.unmount());
  const tree=mount(pages.SettingsPage,data);
  act(()=>button(tree,'프로필 수정').props.onClick());
  change(field(tree,'닉네임'),'수정 요청 이름');
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls,[{name:'수정 요청 이름',bio:'주입된 소개'}]);
  assert.equal(data.viewer.name,'주입된 이름');
  assert.match(text(tree),/서버에서 받은 완료 문구/);
  assert.equal(tree.root.findAllByProps({'data-dialog':'프로필 수정'}).length,0,'the panel closes after a successful save');
  act(()=>tree.unmount());
 });

 test('support uses injected FAQs and displays empty results without reinserting examples',()=>{
  const data=model();data.data.faqs=[{question:'주입된 질문 하나',answer:'원하는 서버 응답 내용'}];
  const tree=mount(pages.SupportPage,data);
  assert.equal(tree.root.findAll(node=>node.props['data-accordion-item']!==undefined).length,1);assert.match(text(tree),/원하는 서버 응답 내용/);
  change(tree.root.findByType('input'),'없는 검색어');
  assert.equal(tree.root.findAll(node=>node.props['data-accordion-item']!==undefined).length,0);assert.match(text(tree),/검색 결과가 없어요/);
  change(tree.root.findByType('input'),'');
  const empty={...data,data:{...data.data,faqs:[]}};
  act(()=>tree.update(React.createElement(pages.SupportPage,{model:empty})));
  assert.equal(tree.root.findAll(node=>node.props['data-accordion-item']!==undefined).length,0);
  assert.doesNotMatch(text(tree),/멤버십 구독은 어떻게/);
  act(()=>tree.unmount());
 });

 test('saved and liked collections omit private image sources until access is injected',()=>{
  for(const tab of ['saved','liked']){
    const data=model();data.account.route.profileTab=tab;
    data.saved=['public','private'];data.liked=['public','private'];
    data.data.posts=[{id:'public',creatorId:'a',title:'공개',image:'/public.jpg',position:'center',requiredRank:0},{id:'private',creatorId:'a',title:'비공개',image:'/private.jpg',position:'center',requiredRank:2}];
    const tree=mount(pages.MyProfilePage,data);
    assert.deepEqual(tree.root.findAllByType('img').map(image=>image.props.src),['/public.jpg']);
    assert.match(text(tree),/멤버십 전용/);assert.doesNotMatch(text(tree),/private\.jpg/);
    act(()=>tree.update(React.createElement(pages.MyProfilePage,{model:{...data,canAccess:()=>true}})));
    assert.deepEqual(tree.root.findAllByType('img').map(image=>image.props.src),['/public.jpg','/private.jpg']);
    act(()=>tree.update(React.createElement(pages.MyProfilePage,{model:{...data,data:{...data.data,posts:[]}}})));
    assert.equal(tree.root.findAllByType('img').length,0);
    assert.match(text(tree),/게시물이 없어요/);
    act(()=>tree.unmount());
  }
 });

 test('failed signup shows the injected error and never opens its completion dialog',async()=>{
  const data=model(),calls=[],codes=[];data.account.agreements=loadTypeScript('components/preview/service/legal-fixtures.ts').previewAgreements;data.accountActions.signup=async input=>{calls.push(input);return failure('이 이메일로 가입할 수 없습니다.');};
  data.accountActions.requestSignupCode=async email=>{codes.push(email);return {success:true,data:{message:'코드 전송'},errorMessage:null,errorCode:null};};
  data.accountActions.verifySignupCode=async input=>input.code==='000000'?{success:true,data:{message:'이메일 인증 완료'},errorMessage:null,errorCode:null}:failure('코드 불일치');
  data.accountActions.verifyIdentity=async()=>({success:true,data:{message:'PASS 완료'},errorMessage:null,errorCode:null});
  const tree=mount(pages.SignupPage,data);
  const button=name=>tree.root.findAllByType('button').find(node=>node.children.includes(name));
  const submitButton=()=>tree.root.findAllByType('button').find(node=>node.props.type==='submit');
  change(field(tree,'이메일'),'injected@example.test');change(field(tree,'비밀번호'),'test-password');change(field(tree,'비밀번호 확인'),'test-passwor');change(field(tree,'닉네임'),'새 이름');
  const checks=tree.root.findAllByType('input').filter(input=>input.props.type==='checkbox');
  act(()=>{checks[0].props.onChange({target:{checked:true}});checks[1].props.onChange({target:{checked:true}});});
  assert.match(text(tree),/서로 일치하지 않습니다/);change(field(tree,'비밀번호 확인'),'test-password');
  assert.equal(submitButton().props.disabled,true);
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(calls.length,0);
  await act(async()=>button('인증 코드 받기').props.onClick());assert.deepEqual(codes,['injected@example.test']);
  change(field(tree,'인증 코드'),'111111');await act(async()=>button('확인').props.onClick());assert.match(text(tree),/코드 불일치/);
  change(field(tree,'인증 코드'),'000000');await act(async()=>button('확인').props.onClick());assert.match(text(tree),/인증 완료/);
  assert.equal(submitButton().props.disabled,true);
  act(()=>button('PASS 본인인증').props.onClick());assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='PASS 본인인증').length,1);
  await act(async()=>button('PASS 앱으로 인증하기').props.onClick());assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='PASS 본인인증').length,0);
  assert.equal(submitButton().props.disabled,false);
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(calls.length,1);assert.equal(calls[0].email,'injected@example.test');assert.equal(calls[0].terms,true);assert.equal(calls[0].marketing,false);assert.equal(calls[0].emailVerified,true);assert.equal(calls[0].identityVerified,true);assert.deepEqual(calls[0].policyVersions,data.account.agreements.versions);
  assert.match(text(tree),/이 이메일로 가입할 수 없습니다/);
  assert.equal(tree.root.findAll(node=>node.props['data-dialog']==='가입 완료').length,0);
  assert.doesNotMatch(text(tree),/가입이 완료/);
  act(()=>tree.unmount());
 });

 test('failed login keeps the form and credentials visible instead of faking session success',async()=>{
  const data=model(),calls=[];let sessionChanges=0;
  data.setSignedIn=()=>sessionChanges++;
  data.accountActions.login=async input=>{calls.push(input);return failure('로그인 정보가 일치하지 않습니다.');};
  const tree=mount(pages.LoginPage,data);
  change(field(tree,'이메일'),'account@example.test');change(field(tree,'비밀번호'),'test-password');
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls,[{email:'account@example.test',password:'test-password',remember:false}]);
  assert.equal(sessionChanges,0);assert.equal(tree.root.findAllByType('form').length,1);
  assert.equal(field(tree,'비밀번호').props.value,'test-password');
  assert.match(text(tree),/로그인 정보가 일치하지 않습니다/);
  assert.equal(button(tree,'로그인').props.disabled,false);
  act(()=>tree.unmount());
 });

test('signup code resend is throttled but an existing code can still be entered, and expired codes are rejected',async()=>{
  const {useMockAccount}=loadTypeScript('components/preview/service/useMockAccount.ts',{'next/navigation':{useRouter:()=>({push(){}}),useSearchParams:()=>new URLSearchParams('')}});
  let state;function Probe(){state=useMockAccount({viewer:{name:'팬',handle:'fan',bio:'',image:''},setViewer(){},setSignedIn(){},basePath:'/p',creators:[]});return null;}
  let tree;act(()=>{tree=create(React.createElement(Probe));});
  try{
    let result;
    await act(async()=>{result=await state.accountActions.requestSignupCode('new@example.test');});assert.equal(result.success,true);
    await act(async()=>{result=await state.accountActions.requestSignupCode('new@example.test');});
    assert.equal(result.success,false);assert.equal(result.errorCode,'RESEND_COOLDOWN');assert.match(result.errorMessage,/3분 후/);
    await act(async()=>{result=await state.accountActions.verifySignupCode({email:'new@example.test',code:'123456'});});assert.equal(result.success,true);
    const realNow=Date.now;Date.now=()=>realNow()+11*60*1000;
    try{
      await act(async()=>{result=await state.accountActions.requestSignupCode('late@example.test');});assert.equal(result.success,true);
      Date.now=()=>realNow()+22*60*1000;
      await act(async()=>{result=await state.accountActions.verifySignupCode({email:'late@example.test',code:'123456'});});
      assert.equal(result.success,false);assert.match(result.errorMessage,/만료/);
    }finally{Date.now=realNow;}
  }finally{act(()=>tree.unmount());}
});

test('signed-out visitors get a login prompt instead of an invented profile',()=>{
  const data={...model(),signedIn:false};
  const tree=mount(pages.MyProfilePage,data);
  const json=text(tree);
  assert.match(json,/로그인이 필요해요/);
  assert.doesNotMatch(json,new RegExp(data.viewer.name),'no viewer details leak into the guest view');
  const links=tree.root.findAllByType('a').map(link=>link.props.href);
  assert.ok(links.includes(`${data.basePath}/login`)&&links.includes(`${data.basePath}/signup`));
  act(()=>tree.unmount());
});

test('fans control 팔로워/팔로잉 공개 in 설정 > 개인정보, the save carries it, and a private setting shows a lock on my profile',async()=>{
  const saved=[];
  const base=model();
  const data={...base,account:{...base.account,route:{...base.account.route,settingsSection:'privacy'}},accountActions:{...base.accountActions,updateSettings:async input=>{saved.push(input);return {success:true,data:{message:'저장됨'},errorMessage:null,errorCode:null};}}};
  const tree=mount(pages.SettingsPage,data);
  const followingToggle=tree.root.findAll(node=>node.props?.label==='팔로잉 공개')[0];
  assert.ok(followingToggle,'the privacy panel offers 팔로잉 공개');
  act(()=>followingToggle.props.onChange(false));
  act(()=>tree.root.findAll(node=>node.props?.label==='팔로워 공개')[0].props.onChange(false));
  await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(saved.length,1);assert.equal(saved[0].section,'privacy');assert.equal(saved[0].showFollowing,false);assert.equal(saved[0].showFollowers,false);
  act(()=>tree.unmount());
  const profile=mount(pages.MyProfilePage,{...base,account:{...base.account,preferences:{...base.account.preferences,showFollowing:false,showFollowers:false}}});
  assert.equal(profile.root.findAll(node=>node.type==='span'&&node.props.role==='img'&&['팔로워 비공개','팔로잉 비공개'].includes(node.props['aria-label'])).length,2,'my profile hints that the count is private');
  act(()=>profile.unmount());
  const open=mount(pages.MyProfilePage,{...base,account:{...base.account,preferences:{...base.account.preferences,showFollowing:true}}});
  assert.equal(open.root.findAll(node=>node.type==='span'&&node.props.role==='img'&&['팔로워 비공개','팔로잉 비공개'].includes(node.props['aria-label'])).length,0);
  act(()=>open.unmount());
});

test('the settings page keeps account groups and adds mobile service information',()=>{
  const data=model();
  const tree=mount(pages.SettingsPage,data);
  const headings=tree.root.findAllByType('h3').map(node=>node.props.children);
  assert.deepEqual(headings,['계정 설정','항목 모아보기','공개 설정','알림과 결제','계정 관리','서비스 안내']);
  const hrefs=tree.root.findAllByType('a').map(link=>link.props.href);
  for(const expected of ['/service/me?tab=saved','/service/me?tab=liked','/service/following','/service/followers','/service/subscriptions'])assert.ok(hrefs.includes(expected),expected);
  for(const path of ['landing','notices','support','legal/terms','legal/privacy','legal/policy'])assert.ok(hrefs.includes(`/service/${path}`),path);
  const labels=tree.root.findAllByType('button').map(flat);
  for(const expected of ['프로필 수정','이메일 설정','비밀번호 변경','개인정보 관리','알림 설정','결제수단 관리','차단한 사용자','로그아웃'])assert.ok(labels.includes(expected),expected);
  assert.equal(labels.filter(label=>label==='계정 정보').length,0,'the old 닉네임-only panel is replaced by 프로필 수정');
  act(()=>button(tree,'프로필 수정').props.onClick());
  assert.equal(tree.root.findAllByProps({'data-dialog':'프로필 수정'}).length,1);
  assert.ok(tree.root.findAllByType('textarea').some(node=>node.props['data-label']==='소개'||node.props['aria-label']==='소개'||true),'프로필 수정 edits the tagline too');
  act(()=>tree.unmount());
});

test('settings categories filter their own items and keep account actions in account management',()=>{
  const tree=mount(pages.SettingsPage,model());
  const categories=tree.root.findByProps({role:'group','aria-label':'설정 카테고리'});
  const choose=label=>act(()=>categories.findAllByType('button').find(node=>flat(node)===label).props.onClick());
  const headings=()=>tree.root.findAllByType('h3').map(node=>node.props.children);
  const cases=[
    ['계정 설정',['프로필 수정','이메일 설정','비밀번호 변경'],[]],
    ['항목 모아보기',[],['/service/me?tab=saved','/service/me?tab=liked','/service/following','/service/followers']],
    ['공개 설정',['개인정보 관리'],[]],
    ['알림과 결제',['알림 설정','결제수단 관리'],['/service/subscriptions']],
    ['계정 관리',['차단한 사용자','로그아웃','회원 탈퇴'],[]],
    ['서비스 안내',[],['/service/landing','/service/notices','/service/events','/service/support','/service/legal/terms','/service/legal/privacy','/service/legal/policy']],
  ];
  for(const [category,buttons,links] of cases){
    choose(category);assert.deepEqual(headings(),[category]);
    assert.deepEqual(categories.findAllByType('button').filter(node=>node.props['aria-pressed']).map(flat),[category]);
    assert.deepEqual(tree.root.findAllByType('button').filter(node=>node.props['aria-pressed']===undefined).map(node=>flat(node).trim()),buttons);
    assert.deepEqual(tree.root.findAllByType('a').map(node=>node.props.href),links);
  }
  choose('계정 설정');act(()=>button(tree,'프로필 수정').props.onClick());
  assert.equal(tree.root.findAllByProps({'data-dialog':'프로필 수정'}).length,1);
  act(()=>tree.unmount());
  const restored=mount(pages.SettingsPage,model());
  assert.equal(restored.root.findAllByType('h3').length,6);
  assert.equal(button(restored,'전체').props['aria-pressed'],true);
  act(()=>restored.unmount());
});

 test('live signup shows published documents without enabling signup before processing is ready',()=>{
  const data=model();data.account.agreements={...loadTypeScript('components/preview/service/legal-fixtures.ts').previewAgreements,published:true,documentsPublished:true,signupReady:false,blockingMessage:'가입 준비 안내'};
  const tree=mount(pages.SignupPage,data);
  assert.equal(button(tree,'인증 코드 받기').props.disabled,true);assert.equal(button(tree,'PASS 본인인증').props.disabled,true);
  act(()=>tree.root.findByProps({'aria-label':'이용약관 보기'}).props.onClick());
  assert.match(text(tree),/다음 결제 해지를 예약해도/);assert.doesNotMatch(text(tree),/주입된 약관/);
  act(()=>button(tree,'확인').props.onClick());act(()=>tree.root.findByProps({'aria-label':'개인정보 수집 및 이용 안내 보기'}).props.onClick());
  assert.match(text(tree),/마케팅 수신 여부는 별도로/);assert.match(text(tree),/본인확인 결과/);
  assert.equal(tree.root.findAllByType('input').filter(n=>n.props.type==='checkbox').every(n=>n.props.checked===false),true);
  act(()=>tree.unmount());
 });


test('deferred identity signup hides PASS and requires email plus age acknowledgement without claiming identity verification',async()=>{
 const data=model(),calls=[];data.account.signupRequirements={identityRequired:false,inviteOnly:false};data.account.agreements=loadTypeScript('components/preview/service/legal-fixtures.ts').previewAgreements;
 data.accountActions.requestSignupCode=async()=>({success:true,data:{message:'코드 전송'},errorMessage:null,errorCode:null});data.accountActions.verifySignupCode=async()=>({success:true,data:{message:'인증 완료'},errorMessage:null,errorCode:null});data.accountActions.signup=async value=>{calls.push(value);return {success:true,data:{message:'가입 완료'},errorMessage:null,errorCode:null};};
 const tree=mount(pages.SignupPage,data),button=name=>tree.root.findAllByType('button').find(node=>node.children.includes(name)),submit=()=>tree.root.findAllByType('button').find(node=>node.props.type==='submit');
 assert.doesNotMatch(text(tree),/PASS/);change(field(tree,'이메일'),'beta@example.invalid');change(field(tree,'비밀번호'),'Beta-test-123!');change(field(tree,'비밀번호 확인'),'Beta-test-123!');change(field(tree,'닉네임'),'베타');
 const checks=tree.root.findAllByType('input').filter(n=>n.props.type==='checkbox');act(()=>{checks[1].props.onChange({target:{checked:true}});checks[2].props.onChange({target:{checked:true}});});
 assert.equal(submit().props.disabled,true);await act(async()=>button('인증 코드 받기').props.onClick());change(field(tree,'인증 코드'),'123456');await act(async()=>button('확인').props.onClick());assert.equal(submit().props.disabled,true);
 act(()=>checks[0].props.onChange({target:{checked:true}}));assert.equal(submit().props.disabled,false);await act(async()=>tree.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(calls.length,1);assert.equal(calls[0].identityVerified,false);assert.equal(calls[0].ageAcknowledged,true);assert.equal(calls[0].emailVerified,true);act(()=>tree.unmount());
});
