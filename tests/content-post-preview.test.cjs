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
 '@/components/ui/ImageUpload':{},'@/components/ui/Toggle':{Toggle:({checked,onChange,disabled})=>element('input',{type:'checkbox',role:'switch',checked,disabled,onChange:event=>onChange(event.target.checked)})},'@/components/ui/MediaUpload':{MediaUpload:({items,label,max})=>element('div',{'data-media-upload':label,'data-count':items.length,'data-max':max})},'@/components/ui/OptionalImage':{},
 '@/components/ui/DataTable':loadTypeScript('components/ui/DataTable.tsx',{'./data-table.module.css':styles}),'@/components/ui/Pagination':{Pagination:()=>null},
 '@/components/ui/DialogActions':{DialogActions:({children})=>element('footer',null,children)},
 '@/components/ui/Primitives':{Field,TextAreaField,Dialog:({open,children})=>open?element('section',null,children):null},
};
const {ContentPostPreview,draftPostModel}=loadTypeScript('components/crefans/studio/ContentPostPreview.tsx',mocks);
const {ContentEditorPage,ContentManagementPage}=loadTypeScript('components/crefans/studio/ManagementPages.tsx',mocks);
const creator={id:'injected-creator',name:'주입된 작성자',handle:'creator',image:'/creator.jpg',position:'center',tags:[],bio:'',followers:'0'};
const original={id:'existing',creatorId:creator.id,title:'기존 제목',body:'기존 본문',image:'/old.jpg',position:'65% 30%',requiredRank:3,time:'어제',likes:15,comments:2};
const membership={id:'selected-plan',name:'새로 수정한 멤버십',price:15000,benefits:['혜택'],active:true,version:1};
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
 assert.equal(post.title,content.title);assert.equal(post.body,content.body);assert.equal(post.image,content.media[0].url);assert.deepEqual(post.media,[{type:'image',url:'/draft-private-image.jpg'},{type:'video',url:'/draft-private-video.mp4'}]);assert.equal(post.position,'center');assert.equal(post.creatorId,creator.id);
 assert.equal(preview.data.plans[0].name,membership.name);assert.equal(post.requiredRank,3);assert.equal(post.requiredPlanId,membership.id);assert.equal(preview.likeCounts.existing,16);assert.equal(JSON.stringify(model),before);
 const newPlan={...membership,id:'new-plan'};const withNewPlan=draftPostModel({...props,memberships:[newPlan],content:{...content,accessPlanId:newPlan.id}});
 assert.equal(withNewPlan.data.plans[0].entitlementMode,'exact');assert.equal(withNewPlan.data.posts[0].requiredPlanId,newPlan.id);assert.ok(withNewPlan.data.posts[0].requiredRank>0);
 const empty=draftPostModel({...props,content:{...content,id:'',accessPlanId:null,title:'',body:'',media:[]}});
 assert.equal(empty.data.posts[0].body,'');assert.equal(empty.data.posts[0].requiredRank,0);assert.equal(empty.data.posts[0].likes,0);assert.deepEqual(empty.commentsByPost,{});
 assert.equal(draftPostModel({...props,creatorId:'missing'}),null);assert.equal(draftPostModel({...props,content:{...content,accessPlanId:'missing'}}),null);
});

test('preview renders the shared fan PostDetail and toggles the real locked output without protected sources',()=>{
 const view=mount(ContentPostPreview,props);
 try{
  assert.equal(view.root.findAll(item=>item.type?.name==='PostDetailPage').length,1);
  assert.match(json(view),/DRAFT_PRIVATE_BODY/);assert.match(json(view),/draft-private-image/);assert.match(json(view),/주입된 작성자/);
  act(()=>view.root.findByType(SelectField).props.onChange('locked'));
  assert.doesNotMatch(json(view),/DRAFT_PRIVATE_BODY|draft-private-image|PRIVATE_COMMENT/);assert.match(json(view),/새로 수정한 멤버십/);assert.match(json(view),/멤버십 전용 콘텐츠/);
  assert.equal(view.root.findAllByType('a').length,0);assert.equal(view.root.findAllByType('textarea').length,0);
  act(()=>view.root.findByType(SelectField).props.onChange('eligible'));assert.match(json(view),/DRAFT_PRIVATE_BODY/);
 }finally{close(view);}
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
  assert.equal(view.root.findByProps({'data-media-upload':'미디어 · 선택'}).props['data-count'],2);assert.equal(view.root.findByProps({'data-media-upload':'미디어 · 선택'}).props['data-max'],10);
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
