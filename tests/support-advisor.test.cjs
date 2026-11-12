const test=require('node:test');
const assert=require('node:assert/strict');
const React=require('react');
const {create,act}=require('react-test-renderer');
const {loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const el=React.createElement;
const advisor=loadTypeScript('lib/crefans/advisor.ts');
const link=({children,href,onClick})=>el('a',{href,onClick},children);
const {AdvisorChat,AdvisorAnswerText,AdvisorLauncher}=loadTypeScript('components/crefans/AdvisorChat.tsx',{'next/link':link});
const {mockAdvisorAnswers}=loadTypeScript('components/preview/service/advisor-fixtures.ts');
const text=node=>typeof node==='string'?node:(node.children||[]).map(text).join('');
const ok=data=>({success:true,data,errorMessage:null,errorCode:null});
const fail=(errorCode,errorMessage)=>({success:false,data:null,errorMessage,errorCode});

test('answer parsing keeps only bold and pipe tables; everything else stays literal text',()=>{
 const blocks=advisor.parseAnswer('**7일 이내** 환불\n\n| 구분 | 기간 |\n| --- | :-: |\n| 콩 | **7일** |\n| 멤버십 |\n<b>x</b> [링크](https://evil.example)');
 assert.equal(blocks.length,3);
 assert.deepEqual(blocks[0],{type:'paragraph',lines:[{text:'7일 이내',bold:true},{text:' 환불',bold:false}]});
 assert.equal(blocks[1].type,'table');
 assert.deepEqual(blocks[1].head.map(cell=>cell[0].text),['구분','기간']);
 assert.deepEqual(blocks[1].rows[0][1],[{text:'7일',bold:true}]);
 assert.deepEqual(blocks[1].rows[1][1],[],'short rows are padded to the header width');
 assert.deepEqual(blocks[2],{type:'paragraph',lines:[{text:'<b>x</b> [링크](https://evil.example)',bold:false}]});
 assert.equal(advisor.blockWordCount(blocks),3+2+2+1+2);
});

test('personal data, source links and stored turns follow the guide rules',()=>{
 for(const value of['kay@example.com 로 연락','010-1234-5678','1234 5678 9012 3456'])assert.equal(advisor.containsPersonalData(value),true,value);
 for(const value of['출금 PIN을 잊어버렸어요','7일 이내 10% 공제'])assert.equal(advisor.containsPersonalData(value),false,value);
 for(const url of['https://guide.crefans.com/fans/beans/','https://crefans.com/service/legal/terms','/service/support'])assert.equal(advisor.safeAdvisorUrl(url),true,url);
 for(const url of['javascript:alert(1)','//evil.example/x','http://guide.crefans.com/','https://guide.crefans.com.evil.example/'])assert.equal(advisor.safeAdvisorUrl(url),false,url);
 assert.equal(advisor.isAdvisorAnswer({answer:'a',found:true,sources:[{title:'t',section:'s',url:'javascript:x'}]}),false);
 assert.equal(advisor.isAdvisorAnswer(mockAdvisorAnswers.table),true);
 assert.deepEqual(advisor.ADVISOR_FINAL_ERRORS.includes('DAILY_LIMIT'),true);
});

test('AdvisorAnswerText renders bold and tables as elements, and reveals only the given number of words',()=>{
 let renderer;act(()=>{renderer=create(el(AdvisorAnswerText,{text:mockAdvisorAnswers.table.answer}));});
 assert.ok(renderer.root.findAllByType('strong').length>=3);
 assert.equal(renderer.root.findAllByType('table').length,1);
 assert.equal(renderer.root.findAllByType('th').length,3);
 act(()=>{renderer.update(el(AdvisorAnswerText,{text:'**하나** 둘 셋',shown:2}));});
 assert.equal(text(renderer.toJSON()),'하나 둘');
});

async function chat(ask){
 global.matchMedia=()=>({matches:true});// reduced motion: answers appear at once
 let renderer;await act(async()=>{renderer=create(el(AdvisorChat,{ask,basePath:'/service'}));});
 const send=async question=>{
  await act(async()=>{renderer.root.findByType('textarea').props.onChange({target:{value:question}});});
  await act(async()=>{renderer.root.findByType('form').props.onSubmit({preventDefault(){}});});
 };
 return {renderer,send};
}

test('AdvisorChat sends a question through the injected callback and shows the answer with its guides',async()=>{
 const asked=[];const {renderer,send}=await chat(async question=>{asked.push(question);return ok(mockAdvisorAnswers.table);});
 assert.ok(text(renderer.toJSON()).includes('무엇이 궁금하세요?'));
 await send('  콩 환불은 어떻게 되나요?  ');
 assert.deepEqual(asked,['콩 환불은 어떻게 되나요?']);
 const all=text(renderer.toJSON());
 assert.ok(all.includes('콩 환불은 어떻게 되나요?')&&all.includes('참고한 가이드 2'));
 assert.equal(renderer.root.findAllByType('table').length,1);
 const guide=renderer.root.findAll(node=>node.type==='a'&&String(node.props.href).startsWith('https://guide.crefans.com/'))[0];
 assert.equal(guide.props.target,'_blank');assert.equal(guide.props.rel,'noopener noreferrer');
});

test('AdvisorChat blocks personal data before calling the server and shows retry only for retryable errors',async()=>{
 let calls=0;const {renderer,send}=await chat(async()=>{calls++;return fail('PROVIDER_ERROR','답변을 가져오지 못했어요.');});
 await send('제 번호 010-1234-5678 로 연락 주세요');
 assert.equal(calls,0);assert.ok(text(renderer.toJSON()).includes('개인정보는 빼고'));
 await send('출금 PIN을 잊어버렸어요');
 assert.equal(calls,1);
 assert.ok(text(renderer.toJSON()).includes('계속되면 문의하기로 남겨 주세요.'));
 assert.equal(renderer.root.findAll(node=>node.type==='button'&&text(node)==='다시 시도').length,1);
 const limited=await chat(async()=>fail('DAILY_LIMIT','오늘 질문 15회를 모두 사용했어요.'));
 await limited.send('콩 충전');
 assert.equal(limited.renderer.root.findAll(node=>node.type==='button'&&text(node)==='다시 시도').length,0);
});

test('AdvisorLauncher opens the panel as a labelled dialog that blocks pull-to-refresh',async()=>{
 global.matchMedia=()=>({matches:true});global.window??={};
 let renderer;await act(async()=>{renderer=create(el(AdvisorLauncher,{ask:async()=>ok(mockAdvisorAnswers.plain),basePath:'/service'}));});
 const launcher=renderer.root.findByProps({'aria-haspopup':'dialog'});
 await act(async()=>{launcher.props.onClick();});
 const dialog=renderer.root.findByProps({role:'dialog'});
 assert.equal(dialog.props['aria-label'],'AI 가이드');assert.equal(dialog.props['data-pull-refresh-block'],'true');
 await act(async()=>{renderer.root.findByProps({'aria-label':'닫기'}).props.onClick();});
 assert.equal(renderer.root.findAllByProps({role:'dialog'}).length,0);
});

// 2026-11-12 KT 마이 AI 참고: 다른 질문, 멈추기, 질문 제목형.
test('AdvisorChat cycles 12 suggested questions four at a time',async()=>{
 const {renderer}=await chat(async()=>ok(mockAdvisorAnswers.plain));
 const shown=()=>renderer.root.findAll(node=>node.type==='button'&&typeof node.props['aria-label']==='string'&&node.props['aria-label'].includes(': ')).map(node=>node.props.title);
 const more=()=>renderer.root.findByProps({'aria-label':'다른 추천 질문 보기'});
 const seen=[];for(let i=0;i<3;i++){const now=shown();assert.equal(now.length,4);seen.push(...now);await act(async()=>{more().props.onClick();});}
 assert.equal(new Set(seen).size,12);assert.deepEqual(shown(),seen.slice(0,4),'back to the first group');
});

test('AdvisorChat stop aborts the request, drops a late answer and offers to ask again; questions are headings',async()=>{
 const signals=[];let release;
 const {renderer,send}=await chat((question,signal)=>{signals.push(signal);return signals.length===1?new Promise(r=>{release=r;}):Promise.resolve(ok(mockAdvisorAnswers.plain));});
 await send('출금 PIN을 잊어버렸어요');
 assert.ok(text(renderer.toJSON()).includes('가이드에서 찾고 있어요'));
 const stopButton=renderer.root.findByProps({'aria-label':'답변 멈추기'});
 assert.equal(renderer.root.findAllByProps({'aria-label':'보내기'}).length,0,'send is replaced while waiting');
 await act(async()=>{stopButton.props.onClick();});
 assert.equal(signals[0].aborted,true,'the request signal is aborted');
 assert.ok(text(renderer.toJSON()).includes('답변을 멈췄어요.'));
 await act(async()=>{release(ok(mockAdvisorAnswers.plain));});// a late answer is ignored
 assert.ok(!text(renderer.toJSON()).includes(mockAdvisorAnswers.plain.answer.slice(0,10)),'late answer dropped');
 assert.equal(renderer.root.findAllByProps({'aria-label':'보내기'}).length,1);
 const again=renderer.root.find(node=>node.type==='button'&&text(node)==='다시 묻기');
 await act(async()=>{again.props.onClick();});
 assert.equal(signals.length,2);assert.equal(renderer.root.findAll(node=>node.type==='button'&&text(node)==='다시 묻기').length,0);
 const headings=renderer.root.findAll(node=>node.type==='div'&&node.props.role==='heading');
 assert.equal(headings.length,1);assert.equal(headings[0].props['aria-level'],3);
});
