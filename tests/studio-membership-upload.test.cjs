const test=require('node:test'),assert=require('node:assert/strict'),React=require('react'),{create,act}=require('react-test-renderer'),{loadTypeScript}=require('./load-typescript.cjs');

test('live membership picker enforces the same image-only limits as preview before sending files',async()=>{
 const calls=[],ok=data=>({success:true,data,errorMessage:null,errorCode:null});let model,tree,fail=false;
 const {useStudioModel}=loadTypeScript('features/service/useStudioModel.ts',{'next/navigation':{useSearchParams:()=>new URLSearchParams()},'@/lib/api/platform':{platformRequest:async(path,body)=>{
  calls.push({path,body});if(path==='/media')return fail?{success:false,data:null,errorMessage:'업로드 실패',errorCode:'UPLOAD_FAILED'}:ok({url:'/api/v1/media/test/file',type:'image'});
  return ok({management:{}});
 }}});
 function Probe(){model=useStudioModel(true);return null;}
 await act(async()=>{tree=create(React.createElement(Probe));});
 try{
  calls.length=0;
  for(const [type,size,code] of [['video/mp4',10,'INVALID_IMAGE_TYPE'],['image/svg+xml',10,'INVALID_IMAGE_TYPE'],['image/png',0,'INVALID_IMAGE_SIZE'],['image/png',5*1024*1024+1,'INVALID_IMAGE_SIZE']]){
   const result=await model.management.actions.uploadMembershipImage(new File([new Uint8Array(size)],'file',{type}));assert.equal(result.success,false);assert.equal(result.errorCode,code);
  }
  assert.equal(calls.length,0,'rejected files never reach the upload API');
  for(const type of ['image/jpeg','image/png','image/webp']){
   const file=new File([new Uint8Array(5*1024*1024)],'cover',{type});const result=await model.management.actions.uploadMembershipImage(file);
   assert.equal(result.data.image,'/api/v1/media/test/file');assert.equal(calls.at(-1).path,'/media');assert.equal(calls.at(-1).body.get('file').size,file.size);
  }
  fail=true;const result=await model.management.actions.uploadMembershipImage(new File(['test'],'cover.png',{type:'image/png'}));assert.equal(result.success,false);assert.equal(result.errorMessage,'업로드 실패');
 }finally{act(()=>tree.unmount());}
});
