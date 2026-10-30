const test=require('node:test'),assert=require('node:assert/strict'),React=require('react');
const {create:createRenderer,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
const create=element=>{let view;act(()=>{view=createRenderer(element);});return view;};
const {CreatorName}=loadTypeScript('components/crefans/CreatorName.tsx');
function renderName(person){let view;act(()=>{view=create(React.createElement(CreatorName,{person}));});return view;}
test('only an explicit verified creator flag renders the named badge beside the nickname',()=>{
 for(const isVerified of [undefined,false,null,'true',1]){
  const view=renderName({name:'미인증',isVerified});
  assert.equal(view.root.findAllByType('img').length,0);view.unmount();
 }
 const view=renderName({name:'인증 작가',isVerified:true});
 const icon=view.root.findByType('img');assert.equal(icon.props.alt,'인증 크리에이터');
 assert.ok(icon.props.src.includes('verified-creator-v1.png'));
 assert.equal(view.root.findByProps({'data-marquee':true}).props.title,'인증 작가');view.unmount();
});
test('featured placement and creator status alone never grant a verification badge',()=>{
 for(const person of [{name:'광고',promoted:true},{name:'크리에이터',isCreator:true},{name:'PASS',identityVerified:true}]){
  const view=renderName(person);assert.equal(view.root.findAllByType('img').length,0);view.unmount();
 }
});

test('founding membership is explicit and independent of creator verification',()=>{
 for(const isFoundingMember of [undefined,false,null,'true',1]){
  const view=renderName({name:'미지급',isFoundingMember});
  assert.equal(view.root.findAllByType('img').length,0);view.unmount();
 }
 for(const isVerified of [false,true]){
  const view=renderName({name:'참여자',isFoundingMember:true,isVerified});
  const icons=view.root.findAllByType('img');
  assert.deepEqual(icons.map(icon=>icon.props.alt),isVerified?['인증 크리에이터','원년멤버 한정판 배지']:['원년멤버 한정판 배지']);
  assert.ok(icons.at(-1).props.src.includes('badge.webp'));view.unmount();
 }
});
test('preview badge recipients match their comment and profile identities without changing service assets',()=>{
 const {creators}=loadTypeScript('components/preview/service/fixtures.ts');
 const {landingCreators}=loadTypeScript('lib/content/landing.ts');
 const {previewViewer}=loadTypeScript('components/preview/founding-members.ts');
 const {messyCommentThreads,toSocialComments,toSocialReplies}=loadTypeScript('components/preview/comment-fixtures.ts');
 assert.deepEqual(creators.filter(person=>person.isFoundingMember).map(person=>person.id),['haneul','jiwoo']);
 assert.ok(landingCreators.every(person=>!person.isFoundingMember),'service landing assets do not receive preview-only awards');
 const threads=messyCommentThreads('morning',20);
 const comments=toSocialComments(threads);
 const jiwoo=creators.find(person=>person.id==='jiwoo');
 assert.deepEqual(comments.slice(0,3).map(comment=>comment.author.name),[previewViewer.name,jiwoo.name,'하늘']);
 assert.ok(comments.slice(0,3).every(comment=>comment.author.isFoundingMember));
 assert.equal(comments[0].author.image,previewViewer.image);
 assert.equal(comments[1].author.image,jiwoo.image);
 const creatorReplies=Object.values(toSocialReplies(threads)).flat().filter(reply=>reply.fromCreator);
 assert.ok(creatorReplies.length>0);
 assert.ok(creatorReplies.every(reply=>reply.author.isFoundingMember));
});

test('on the profile each badge is a button that shows its short meaning when clicked; elsewhere badges stay plain images',()=>{
 let view;act(()=>{view=create(React.createElement(CreatorName,{person:{name:'원년 작가',isVerified:true,isFoundingMember:true},explain:true}));});
 const buttons=view.root.findAllByType('button');assert.deepEqual(buttons.map(b=>b.props['aria-label']),['인증 크리에이터 배지 설명','원년멤버 배지 설명']);
 assert.equal(view.root.findAllByProps({role:'tooltip'}).length,0);
 act(()=>buttons[1].props.onClick());const tip=view.root.findByProps({role:'tooltip'});assert.equal(tip.children.join(''),'원년멤버: 크레팬스 오픈베타 원년멤버 기념 배지예요.');
 act(()=>buttons[1].props.onClick());assert.equal(view.root.findAllByProps({role:'tooltip'}).length,0,'a second click closes it');
 act(()=>buttons[0].props.onClick());assert.match(view.root.findByProps({role:'tooltip'}).children.join(''),/운영자가 확인한 크리에이터/);
 view.unmount();
 const plain=renderName({name:'목록',isVerified:true,isFoundingMember:true});assert.equal(plain.root.findAllByType('button').length,0);plain.unmount();
});
