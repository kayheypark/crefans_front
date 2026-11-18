const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
const styles={__esModule:true,default:new Proxy({},{get:(_,key)=>String(key)})};
const element=React.createElement;
const link=({children,...props})=>element('a',props,children);
const {Field,TextAreaField}=loadTypeScript('components/ui/Field.tsx',{'./field.module.css':styles});
function SelectField(){return null;}
const ui={
 Action:({variant,...props})=>element('button',props),
 ActionLink:({variant,...props})=>element('a',props),
 Avatar:({creator})=>element('img',{src:creator?.image,alt:creator?.name}),
 Empty:({title,description,action})=>element('section',null,element('h2',null,title),description,action),
 PageTitle:({children,action})=>element('header',null,element('h1',null,children),action),
 Notice:({children})=>element('p',null,children),
};
const mocks={
 './social.module.css':styles,'./chip-row.module.css':styles,'./content-post-preview.module.css':styles,'./phone-frame.module.css':styles,'./management.module.css':styles,
 './Icon':()=>null,'../Icon':()=>null,'./ServiceUI':ui,'../ServiceUI':ui,
 'next/link':link,'@/components/ui/TextLink':{TextLink:link},
 '@/components/ui/SelectField':{SelectField},'@/components/ui/BenefitsField':{},
 '@/components/ui/ImageUpload':{},'@/components/ui/Toggle':{Toggle:({checked,onChange,disabled})=>element('input',{type:'checkbox',role:'switch',checked,disabled,onChange:event=>onChange(event.target.checked)})},'@/components/ui/MediaUpload':{MediaUpload:({items,label,max})=>element('div',{'data-media-upload':label,'data-count':items.length,'data-max':max})},
 '@/components/ui/DataTable':loadTypeScript('components/ui/DataTable.tsx',{'./data-table.module.css':styles}),'@/components/ui/Pagination':{Pagination:()=>null},
 '@/components/ui/DialogActions':{DialogActions:({children})=>element('footer',null,children)},
 '@/components/ui/Primitives':{Field,TextAreaField,Dialog:({open,children})=>open?element('section',null,children):null},
};
const {ContentPostPreview,draftPostModel}=loadTypeScript('components/crefans/studio/ContentPostPreview.tsx',mocks);
const {ContentEditorPage,ContentManagementPage}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',{...mocks,'next/navigation':{useRouter:()=>({push(){}})}});
const creator={id:'injected-creator',name:'주입된 작성자',handle:'creator',image:'/creator.jpg',position:'center',tags:[],bio:'',followers:'0'};
const original={id:'existing',creatorId:creator.id,title:'기존 제목',body:'기존 본문',image:'/old.jpg',position:'65% 30%',requiredRank:3,time:'어제',likes:15,comments:2,supporterCount:9,views:1234};
const membership={id:'selected-plan',name:'새로 수정한 멤버십',price:15000,image:'/membership-cover.jpg',benefits:['혜택'],active:true,version:1};
const content={id:'existing',title:'초안 제목',body:'DRAFT_PRIVATE_BODY',commentsEnabled:true,media:[{id:'m1',type:'image',url:'/draft-private-image.jpg'},{id:'m2',type:'video',url:'/draft-private-video.mp4'}],accessPlanId:membership.id,status:'draft',scheduledAt:null,updatedAt:'2026-09-13T09:00:00.000Z'};
const calls=[];
const model={basePath:'/fan',data:{creators:[creator],posts:[original],plans:[{...membership,name:'옛 멤버십',rank:3}]},canAccess:()=>false,liked:[],saved:[],likeCounts:{existing:16},commentCounts:{existing:2},commentsByPost:{existing:[{id:'comment',author:{name:'팬',image:'/fan.jpg'},body:'PRIVATE_COMMENT',time:'어제'}]},toggleLike:()=>calls.push('like'),toggleSave:()=>calls.push('save'),addComment:async()=>{calls.push('comment');return {success:true,data:{message:'등록'}};}};
const props={content,memberships:[membership],model,creatorId:creator.id};
function mount(Component,input){let view;act(()=>{view=create(element(Component,input));});return view;}
function close(view){act(()=>view.unmount());}
function button(view,name){return view.root.findAllByType('button').find(item=>item.children.includes(name));}
const json=view=>JSON.stringify(view.toJSON());

test('draft adapter injects unsaved content and selected membership without changing fan data',()=>{
 const before=JSON.stringify(model);const preview=draftPostModel(props),post=preview.data.posts[0];
 assert.equal(post.supporterCount,9);assert.equal(post.views,1234);assert.equal(post.title,content.title);assert.equal(post.body,content.body);assert.equal(post.image,content.media[0].url);assert.deepEqual(post.media,[{type:'image',url:'/draft-private-image.jpg'},{type:'video',url:'/draft-private-video.mp4'}]);assert.equal(post.position,'center');assert.equal(post.creatorId,creator.id);
 assert.equal(preview.data.plans[0].name,membership.name);assert.equal(post.requiredRank,3);assert.equal(post.requiredPlanId,membership.id);assert.equal(preview.likeCounts.existing,16);assert.equal(JSON.stringify(model),before);
 const newPlan={...membership,id:'new-plan'};const withNewPlan=draftPostModel({...props,memberships:[newPlan],content:{...content,accessPlanId:newPlan.id}});
 assert.equal(withNewPlan.data.plans[0].entitlementMode,'tier');assert.equal(withNewPlan.data.posts[0].requiredPlanId,newPlan.id);assert.ok(withNewPlan.data.posts[0].requiredRank>0);
 const empty=draftPostModel({...props,content:{...content,id:'',accessPlanId:null,title:'',body:'',media:[]}});
 assert.equal(empty.data.posts[0].views,0);assert.equal(empty.data.posts[0].body,'');assert.equal(empty.data.posts[0].requiredRank,0);assert.equal(empty.data.posts[0].likes,0);assert.deepEqual(empty.commentsByPost,{});
 assert.equal(draftPostModel({...props,creatorId:'missing'}),null);assert.equal(draftPostModel({...props,content:{...content,accessPlanId:'missing'}}),null);
});

test('preview renders the shared fan PostDetail and toggles the real locked output without protected sources',()=>{
 const view=mount(ContentPostPreview,props);
 try{
  assert.equal(view.root.findAll(item=>item.type?.name==='PostDetailPage').length,1);
  assert.match(json(view),/DRAFT_PRIVATE_BODY/);assert.match(json(view),/draft-private-image/);assert.match(json(view),/주입된 작성자/);
  act(()=>view.root.findByType(SelectField).props.onChange('locked'));
  assert.doesNotMatch(json(view),/DRAFT_PRIVATE_BODY|draft-private-image|PRIVATE_COMMENT/);assert.match(json(view),/새로 수정한 멤버십/);assert.match(json(view),/멤버십 전용 콘텐츠/);
  assert.equal(view.root.findAllByType('a').length,0);assert.equal(view.root.findAllByType('textarea').length,0);assert.ok(view.root.findAllByType('img').some(img=>img.props.src==='/membership-cover.jpg'));
  act(()=>view.root.findByType(SelectField).props.onChange('eligible'));assert.match(json(view),/DRAFT_PRIVATE_BODY/);
 }finally{close(view);}
});

test('minimum-level draft previews carry current studio membership names instead of only an exact selected product',()=>{
 const input={...props,content:{...content,accessPlanId:null,accessLevel:2},memberships:[{...membership,rank:2},{...membership,id:'upper',name:'여행 일지',rank:3}]};
 const preview=draftPostModel(input);assert.equal(preview.data.posts[0].requiredRank,2);assert.equal(preview.data.plans.length,2);assert.equal(preview.data.plans[0].name,membership.name);
 const view=mount(ContentPostPreview,input);try{act(()=>view.root.findByType(SelectField).props.onChange('locked'));assert.match(json(view),/새로 수정한 멤버십/);assert.doesNotMatch(json(view),/레벨 2 이상|DRAFT_PRIVATE_BODY|draft-private-image/);}finally{close(view);}
});

test('preview readOnly blocks real fan callbacks and navigation while preserving the comment UI',async()=>{
 calls.length=0;const view=mount(ContentPostPreview,{...props,content:{...content,accessPlanId:null}});
 try{
  assert.equal(view.root.findAllByType(SelectField).length,0);assert.equal(view.root.findAllByType('a').length,0);
  const interactive=view.root.findAllByType('button');assert.ok(interactive.every(item=>item.props.disabled));
  act(()=>interactive.filter(item=>item.props.onClick).forEach(item=>item.props.onClick()));
  const textarea=view.root.findByType('textarea');assert.equal(textarea.props.readOnly,true);
  act(()=>textarea.props.onChange({target:{value:'전송하면 안 되는 댓글'}}));
  await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.deepEqual(calls,[]);assert.equal(view.root.findByType('textarea').props.value,'');
 }finally{close(view);}
});

const management={now:content.updatedAt,contents:[content],memberships:[membership],subscribers:[],actions:{saveContent:async()=>{throw new Error('Preview must not save');},uploadContentMedia:async()=>{throw new Error('Preview must not upload');},discardContentMedia(){}}};
test('editor shows a live phone-frame preview beside the form that follows unsaved title, body and visibility',()=>{
 const view=mount(ContentEditorPage,{model:management,basePath:'/studio',id:content.id,previewModel:model,previewCreatorId:creator.id});
 try{
  const detail=()=>view.root.findAll(item=>item.type?.name==='PostDetailPage');
  assert.equal(detail().length,1);assert.equal(view.root.findAllByProps({'aria-label':'모바일 화면 미리보기'}).length,1);
  assert.equal(button(view,'팬 화면 미리보기'),undefined);assert.equal(view.root.findAll(node=>node.type==='form'&&node.props.className==='editor').length,1);
  act(()=>view.root.findByProps({maxLength:120}).props.onChange({target:{value:'저장하지 않은 제목'}}));
  act(()=>view.root.findAll(node=>node.type==='textarea'&&node.props.maxLength===10000)[0].props.onChange({target:{value:'저장하지 않은 본문'}}));
  const audience=view.root.findAllByType(SelectField);
  act(()=>audience[0].props.onChange(''));
  assert.equal(detail()[0].props.model.data.posts[0].title,'저장하지 않은 제목');assert.equal(detail()[0].props.model.data.posts[0].body,'저장하지 않은 본문');assert.equal(detail()[0].props.model.data.posts[0].requiredRank,0);
  assert.equal(view.root.findByProps({maxLength:120}).props.value,'저장하지 않은 제목');
  assert.equal(view.root.findByProps({'data-media-upload':'파일 업로드'}).props['data-count'],2);assert.equal(view.root.findByProps({'data-media-upload':'파일 업로드'}).props['data-max'],10);
 }finally{close(view);}
});

test('content-list preview opens the same fan view in a dialog while the table and its search stay mounted',()=>{
 const view=mount(ContentManagementPage,{model:management,basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{
  assert.equal(view.root.findAllByType('table').length,1);
  act(()=>view.root.findByProps({'aria-label':'게시물 검색'}).props.onChange({target:{value:'초안'}}));
  assert.equal(view.root.findAll(item=>item.type?.name==='PostDetailPage').length,0);
  act(()=>button(view,'미리보기').props.onClick());assert.equal(view.root.findAll(item=>item.type?.name==='PostDetailPage').length,1);
  assert.equal(view.root.findByProps({'aria-label':'게시물 검색'}).props.value,'초안');assert.equal(view.root.findAllByType('table').length,1);assert.ok(button(view,'미리보기'));
 }finally{close(view);}
});


test('new draft preview uses the same Seoul timestamp on server and browser timezones',()=>{
 const previous=process.env.TZ;
 try{
  const values=['UTC','Asia/Seoul','America/Los_Angeles'].map(timezone=>{
   process.env.TZ=timezone;
   return draftPostModel({...props,content:{...content,id:''}}).data.posts[0].time;
  });
  assert.deepEqual(values,['9월 13일 오후 06:00','9월 13일 오후 06:00','9월 13일 오후 06:00']);
 }finally{if(previous===undefined)delete process.env.TZ;else process.env.TZ=previous;}
});

test('an operator-hidden post is marked in the studio content list so its author knows why fans cannot see it',()=>{
 const hidden={...management,contents:[{...content,hiddenByOperator:true}]};
 const view=mount(ContentManagementPage,{model:hidden,basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{assert.equal(view.root.findAll(n=>n.type==='span'&&n.children?.join?.('')==='운영 정책에 따라 숨김').length,1);}finally{act(()=>view.unmount());}
 const shown=mount(ContentManagementPage,{model:management,basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{assert.equal(shown.root.findAll(n=>n.type==='span'&&n.children?.join?.('')==='운영 정책에 따라 숨김').length,0);}finally{act(()=>shown.unmount());}
});

test('an unpublished post is marked in the studio list next to its status',()=>{
 const text=n=>n.type==='span'&&n.props['data-status']==='unpublished';
 const view=mount(ContentManagementPage,{model:{...management,contents:[{...content,unpublished:true}]},basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{assert.ok(view.root.findAll(text).length>=1);assert.equal(view.root.findAll(text)[0].children.join(''),'미공개');}finally{act(()=>view.unmount());}
 const shown=mount(ContentManagementPage,{model:management,basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{assert.equal(shown.root.findAll(text).length,0);}finally{act(()=>shown.unmount());}
});

test('the editor switches visibility only after confirming, and explains operator hiding it cannot lift',async()=>{
 const calls=[];const actions={...management.actions,setContentPublic:async(id,isPublic)=>{calls.push([id,isPublic]);return {success:true,data:{message:'게시물을 미공개로 바꿨습니다. 작성자에게만 보입니다.'},errorMessage:null,errorCode:null};}};
 const view=mount(ContentEditorPage,{model:{...management,actions},basePath:'/studio',id:content.id,previewModel:model,previewCreatorId:creator.id});
 try{
  const box=()=>view.root.findByProps({'aria-label':'공개 상태'});
  assert.match(JSON.stringify(box().findAllByType('strong').map(n=>n.children)),/공개 중/);
  assert.equal(button(view,'게시물을 미공개로 바꿀까요?'),undefined);
  await act(async()=>button(view,'미공개로 전환').props.onClick());
  assert.equal(calls.length,0,'opening the dialog does not change anything');
  const confirm=view.root.findAll(n=>n.type==='button'&&n.children?.join?.('')==='미공개로 전환');assert.equal(confirm.length,2,'the dialog adds its own confirm button');
  await act(async()=>confirm[1].props.onClick());
  assert.deepEqual(calls,[[content.id,false]]);
 }finally{act(()=>view.unmount());}
 const hidden=mount(ContentEditorPage,{model:{...management,contents:[{...content,unpublished:true,hiddenByOperator:true}],actions},basePath:'/studio',id:content.id,previewModel:model,previewCreatorId:creator.id});
 try{const box=hidden.root.findByProps({'aria-label':'공개 상태'});assert.match(JSON.stringify(box.findAllByType('strong').map(n=>n.children)),/미공개/);assert.ok(box.findAll(n=>n.type==='p'&&String(n.children).includes('운영자만 해제')).length===1);assert.ok(button(hidden,'다시 공개'));}finally{act(()=>hidden.unmount());}
});

test('published rows link to the fan post; drafts and scheduled rows keep the preview dialog (2026-11-07)',()=>{
 const mixed={...management,contents:[{...content,id:'live post',title:'발행 글',status:'published'},{...content,status:'draft'},{...content,id:'later',title:'예약 글',status:'scheduled',scheduledAt:content.updatedAt}]};
 const view=mount(ContentManagementPage,{model:mixed,basePath:'/service/studio',previewModel:model,previewCreatorId:creator.id});
 try{
  const links=view.root.findAll(node=>node.type==='a'&&node.props.href?.startsWith('/service/post/'));
  const published=mixed.contents.filter(item=>item.status==='published');
  assert.ok(published.length>0&&mixed.contents.some(item=>item.status!=='published'),'fixture has both kinds');
  for(const item of published)assert.ok(links.some(a=>a.props.href===`/service/post/${encodeURIComponent(item.id)}`),item.id);
  assert.ok(links.every(a=>published.some(item=>a.props.href===`/service/post/${encodeURIComponent(item.id)}`)),'no fan link for unpublished rows');
  assert.deepEqual([...new Set(links.map(a=>a.props.href))],['/service/post/live%20post'],'only the published row links out (table and mobile card)');
  assert.equal(button(view,'미리보기')?.props.type,'button','unpublished rows keep the preview button');
 }finally{close(view);}
});

// 2026-11-15: a member who is not a creator writes public posts only, so the editor hides scope, schedule and tips and always
// sends tipsEnabled:false with no plan or level.
test('member mode editor hides scope, schedule and tips and publishes a public post without tips',async()=>{
 const saved=[];const actions={...management.actions,saveContent:async input=>{saved.push(input);return {success:true,data:{id:'member-post'},errorMessage:null,errorCode:null};}};
 const view=mount(ContentEditorPage,{model:{...management,contents:[],memberships:[],actions},basePath:'/studio',previewModel:model,previewCreatorId:creator.id,memberMode:true});
 try{
  assert.equal(view.root.findAllByType(SelectField).filter(n=>n.props.label==='공개 범위').length,0,'no membership scope');
  const text=JSON.stringify(view.toJSON());assert.doesNotMatch(text,/이 게시물에서 후원 받기/);assert.doesNotMatch(text,/예약 사용/);
  await act(async()=>view.root.find(n=>n.type==='input'&&n.props.placeholder==='제목을 입력하세요').props.onChange({target:{value:'회원 글'}}));
  await act(async()=>view.root.find(n=>n.type==='textarea'&&n.props.placeholder==='내용을 입력하세요').props.onChange({target:{value:'본문'}}));
  await act(async()=>button(view,'지금 게시하기').props.onClick());
  assert.equal(saved.length,1);assert.equal(saved[0].tipsEnabled,false);assert.equal(saved[0].accessPlanId,null);assert.equal(saved[0].accessLevel,null);assert.equal(saved[0].status,'published');
 }finally{act(()=>view.unmount());}
 const creatorView=mount(ContentEditorPage,{model:{...management,contents:[]},basePath:'/studio',previewModel:model,previewCreatorId:creator.id});
 try{assert.match(JSON.stringify(creatorView.toJSON()),/이 게시물에서 후원 받기/,'creators keep the tips option');}finally{act(()=>creatorView.unmount());}
});

// 2026-11-17 user decision: the signed-out trial starts with the landing page's fictional person already added.
test('guest trial editor adds the fictional sample photo once and says how to replace it',async()=>{
 const uploads=[],previousFetch=global.fetch;global.fetch=async url=>({ok:true,blob:async()=>new Blob(['img'],{type:'image/webp'}),url});
 const guestModel={now:content.updatedAt,contents:[],memberships:[],subscribers:[],actions:{aiEditPhoto:async()=>({success:false}),saveContent:async()=>({success:false}),uploadContentMedia:async file=>{uploads.push(file.name);return {success:true,data:{id:'sample-1',type:'image',url:'/api/v1/media/sample-1/file'}};},discardContentMedia(){}}};
 let view;
 try{
  await act(async()=>{view=create(element(ContentEditorPage,{model:guestModel,basePath:'/service/try',previewModel:model,previewCreatorId:creator.id,guest:{backHref:'/service/feed',doneHref:'/service/try?done=1',notice:'안내',caption:async()=>({success:false}),samplePhoto:{url:'/illustrations/landing/ai-photo/base-v1.webp',name:'crefans-sample-virtual-person.webp'}}}));await new Promise(r=>setTimeout(r,10));});
  assert.deepEqual(uploads,['crefans-sample-virtual-person.webp'],'uploaded once through the normal trial upload');
  assert.match(JSON.stringify(view.toJSON()),/가상 인물 샘플 사진이 미리 들어가 있어요/);
  assert.match(JSON.stringify(view.toJSON()),/샘플 원본을 등록해드렸어요\./,'snackbar tells the visitor the sample was added');
  // 2026-11-17: the next step is highlighted until the AI editor is opened once.
  assert.match(JSON.stringify(view.toJSON()),/이제 여기를 눌러 의상·포즈를 골라 보세요/);const aiButton=view.root.find(node=>node.type==='button'&&node.props['aria-label']==='AI 사진 편집');
  act(()=>aiButton.props.onClick());assert.doesNotMatch(JSON.stringify(view.toJSON()),/이제 여기를 눌러/);
  await act(async()=>{await new Promise(r=>setTimeout(r,10));});assert.equal(uploads.length,1,'not repeated on re-render');
 }finally{global.fetch=previousFetch;if(view)act(()=>view.unmount());}
});

test('AI photo decision replaces only the source attachment in both editor layouts',async()=>{
 let aiProps;
 const {ContentEditorPage:Editor}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',{...mocks,'next/navigation':{useRouter:()=>({push(){}})},'./AiPhotoDialog':{AiPhotoDialog:props=>{aiProps=props;return null;}},'@/components/ui/MediaUpload':{MediaUpload:props=>element('div',{'data-attachment-ids':props.items.map(i=>i.id).join(',')})}});
 for(const memberMode of [false,true]){
  const discarded=[],editing={...content,media:[{id:'source',type:'image',url:'/source.jpg'},{id:'other',type:'image',url:'/other.jpg'},{id:'video',type:'video',url:'/video.mp4'}]};
  const management={now:content.updatedAt,contents:[editing],memberships:[],subscribers:[],actions:{aiEditPhoto:async()=>({success:false}),saveContent:async()=>({success:false}),discardContentMedia:url=>discarded.push(url)}};
  const view=mount(Editor,{model:management,basePath:'/studio',id:editing.id,memberMode});
  assert.equal(view.root.findByProps({'data-attachment-ids':'source,other,video'}).type,'div');
  await act(async()=>aiProps.onAdd([{id:'made',type:'image',url:'/made.jpg',aiGenerated:true}],undefined,['source']));
  assert.equal(view.root.findByProps({'data-attachment-ids':'other,video,made'}).type,'div');
  assert.deepEqual(discarded,[],'previously saved attachments are not physically deleted');
  close(view);
 }
});

test('guest caption fields appear only after successful AI writing and remain editable',async()=>{
 let resolve;
 const editing={...content,media:[{id:'made',type:'image',url:'/made.jpg',aiGenerated:true}]};
 const management={now:content.updatedAt,contents:[editing],memberships:[],subscribers:[],actions:{saveContent:async()=>({success:false}),discardContentMedia(){}}};
 const view=mount(ContentEditorPage,{model:management,basePath:'/service/try',id:editing.id,guest:{backHref:'/feed',doneHref:'/done',notice:'안내',caption:()=>new Promise(r=>{resolve=r;})}});
 const fields=()=>view.root.findAll(n=>n.type==='input'&&n.props.placeholder==='제목을 입력하세요'||n.type==='textarea'&&n.props.placeholder==='내용을 입력하세요');
 try{
  assert.equal(fields().length,0);assert.doesNotMatch(json(view),/고른 항목 이름과 요청 문장만/);
  await act(async()=>button(view,'AI로 내용 작성').props.onClick());assert.equal(fields().length,0);assert(button(view,'쓰는 중…').props.disabled);
  await act(async()=>resolve({success:false,errorMessage:'작성 실패'}));assert.equal(fields().length,0);assert(button(view,'AI로 내용 작성'));
  await act(async()=>button(view,'AI로 내용 작성').props.onClick());await act(async()=>resolve({success:true,data:{title:'AI 제목',body:'AI 본문',source:'ai'}}));
  assert.equal(fields().length,2);assert.deepEqual(fields().map(n=>n.props.value),['AI 제목','AI 본문']);
  await act(async()=>fields()[0].props.onChange({target:{value:'내 제목'}}));assert.equal(fields()[0].props.value,'내 제목');
  await act(async()=>button(view,'AI로 내용 작성').props.onClick());await act(async()=>resolve({success:false,errorMessage:'재작성 실패'}));assert.equal(fields()[0].props.value,'내 제목');assert.equal(fields().length,2);
 }finally{close(view);}
});
