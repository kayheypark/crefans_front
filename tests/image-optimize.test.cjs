const {test}=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
// 2026-11-13: big photos are shrunk in the browser to a 4096px long edge before upload; outside a browser the file passes as is.
const {fitWithin,optimizeImage,optimizeMaxEdge}=loadTypeScript('lib/design/image-optimize.ts');
const {imageUploadMaxBytes}=loadTypeScript('lib/design/image-upload.ts');
test('long edge is capped at 4096px with the aspect ratio kept; small photos are not resized',()=>{
 assert.equal(optimizeMaxEdge,4096);
 assert.deepEqual(fitWithin(8000,6000),{width:4096,height:3072,resized:true});
 assert.deepEqual(fitWithin(3000,9000),{width:1365,height:4096,resized:true});
 assert.deepEqual(fitWithin(4096,2000),{width:4096,height:2000,resized:false});
 assert.deepEqual(fitWithin(1200,800),{width:1200,height:800,resized:false});
});
test('the per-photo limit is generous and a file that cannot be decoded here goes up unchanged',async()=>{
 assert.equal(imageUploadMaxBytes,50*1024*1024);
 const file=new File([new Uint8Array(10)],'a.heic',{type:'image/heic'});assert.equal(await optimizeImage(file),file);
 const jpeg=new File([new Uint8Array(10)],'a.jpg',{type:'image/jpeg'});assert.equal(await optimizeImage(jpeg),jpeg,'no DOM: unchanged');
});
