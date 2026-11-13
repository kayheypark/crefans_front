const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');
global.IS_REACT_ACT_ENVIRONMENT=true;
test('live photo editor sends costume IDs with other edits and omits references for ordinary edits',async()=>{
 let remaining=10;const calls=[],ok=data=>({success:true,data,errorMessage:null,errorCode:null});let model,tree;
 const {useStudioModel}=loadTypeScript('features/service/useStudioModel.ts',{'next/navigation':{useSearchParams:()=>new URLSearchParams()},'@/lib/api/platform':{platformRequest:async(path,body)=>{
  calls.push({path,body});if(path.endsWith('/quota'))return ok({allowed:true,remaining,limit:10});if(path.endsWith('/edit'))return ok({images:[],remaining:9});return ok({management:{}});
 }}});
 function Probe(){model=useStudioModel(true);return null;}
 await act(async()=>{tree=create(React.createElement(Probe));});
 try{
  remaining=0;await act(async()=>model.management.actions.refreshAiPhotoQuota());assert.equal(model.management.aiPhotoQuota.remaining,0);
  remaining=10;await act(async()=>model.management.actions.refreshAiPhotoQuota());assert.equal(model.management.aiPhotoQuota.remaining,10);
  const input={source:{id:'source'},kind:'combined',editKinds:['outfit','background'],style:'cosplay',prompt:'의상 참조 사진 1의 코디를 적용해줘. 흰 스튜디오',costumeIds:['maid','aot-scout'],targetGender:'female',mask:new Blob(['mask'],{type:'image/png'}),consent:true};
  await act(async()=>{await model.management.actions.aiEditPhoto(input);});const body=calls.find(c=>c.path.endsWith('/edit')).body;
  assert.deepEqual(JSON.parse(body.get('costumeIds')),input.costumeIds);assert.equal(body.get('prompt'),input.prompt);assert.deepEqual(JSON.parse(body.get('editKinds')),input.editKinds);assert.equal(body.get('targetGender'),'female');assert.equal(body.get('mask').type,'image/png');assert.equal(body.get('sourceId'),'source');
  calls.length=0;await act(async()=>{await model.management.actions.aiEditPhoto({source:input.source,kind:'expression',style:'photo',prompt:'무표정',consent:true});});assert.equal(calls.find(c=>c.path.endsWith('/edit')).body.has('costumeIds'),false);
 }finally{act(()=>tree.unmount());}
});
