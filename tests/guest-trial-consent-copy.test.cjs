// 2026-11-23 /pilot-work: guests do get trial-ticket rewards (first post, first share; policy 17, terms 13), so the consent screen
// must not say no reward is given. The check renders the real component and reads every list item.
const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
const text=node=>typeof node==='string'?node:(Array.isArray(node)?node:node?.children||[]).map(text).join('');
const stub=()=>null;
const copyProblems=items=>{const all=items.join('\n'),problems=[];
 if(!items.some(t=>t.includes('체험 이용권 보상은 개인정보 처리방침 17항과 이용약관 13조를 따라요')))problems.push('reward rule missing');
 for(const w of ['보상은 주지 않','보상이 없','하트 같은 보상'])if(all.includes(w))problems.push('no-reward wording: '+w);
 return problems;};
const render=()=>{const {GuestTrialConsent}=loadTypeScript('components/crefans/GuestTrialConsent.tsx',{'./PullToRefresh':{PullToRefresh:stub},'./ServiceUI':{Action:stub,PageTitle:stub},'./BackButton':{BackButton:stub},'@/components/ui/Choice':{Checkbox:stub}});
 let r;act(()=>{r=create(React.createElement(GuestTrialConsent,{agreed:false,pending:false,error:'',onAgree(){},onStart(){}}));});
 return r.root.findAllByType('li').map(li=>text(li.props.children));};
test('guest consent: names the trial-ticket reward rule (policy 17, terms 13) and never says no reward is given',()=>{
 const items=render();assert.deepEqual(copyProblems(items),[]);
 assert.ok(items.some(t=>t.includes('댓글·후원·멤버십은 없고')));
 assert.ok(items.some(t=>t.includes('서버 보안키로 바꾼 값')),'2026-11-23 user decision: this sentence stays as is');
});
test('guest consent control: the checker flags the previous no-reward sentence',()=>{
 const old='체험 게시물에는 AI로 만든 사진만 올릴 수 있어요. 댓글, 후원, 멤버십이 없고, 하트 같은 보상은 주지 않아요.';
 assert.deepEqual(copyProblems([old]),['reward rule missing','no-reward wording: 보상은 주지 않','no-reward wording: 하트 같은 보상']);
});
