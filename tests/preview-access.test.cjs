const test=require('node:test');
const assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const {hasPreviewAccess}=loadTypeScript('components/preview/service/access.ts');
const plans=[{id:'standard',rank:2}];
const subscription={creatorId:'haneul',planId:'standard',price:19900,renewAt:'2026-10-12',status:'active'};
test('preview access separates creator identity, membership tier, and public content',()=>{
 assert.equal(hasPreviewAccess([], 'haneul', 0,'2026-09-12',plans),true);
 assert.equal(hasPreviewAccess([], 'haneul', 1,'2026-09-12',plans),false);
 assert.equal(hasPreviewAccess([subscription], 'jiwoo', 1,'2026-09-12',plans),false);
 assert.equal(hasPreviewAccess([subscription], 'haneul', 2,'2026-09-12',plans),true);
 assert.equal(hasPreviewAccess([subscription], 'haneul', 3,'2026-09-12',plans),false);
});
test('cancelling renewal keeps access until the end date, expired memberships never unlock',()=>{
 const cancelled={...subscription,status:'cancelled'};
 assert.equal(hasPreviewAccess([cancelled], 'haneul', 2,'2026-10-12',plans),true);
 assert.equal(hasPreviewAccess([cancelled], 'haneul', 2,'2026-10-13',plans),false);
 assert.equal(hasPreviewAccess([{...subscription,status:'expired'}], 'haneul', 2,'2026-09-12',plans),false);
});

test('explicit product access is independent of rank and expired active records remain locked',()=>{
 const exactPlan={id:'custom',rank:1,entitlementMode:'exact'};
 const exactSubscription={...subscription,planId:'custom',planSnapshot:exactPlan};
 assert.equal(hasPreviewAccess([], 'haneul',0,'2026-09-12',[exactPlan],'custom'),false);
 assert.equal(hasPreviewAccess([exactSubscription], 'haneul',1,'2026-09-12',[exactPlan],'custom'),true);
 assert.equal(hasPreviewAccess([exactSubscription], 'haneul',1,'2026-09-12',[exactPlan],'other'),false);
 assert.equal(hasPreviewAccess([exactSubscription], 'haneul',1,'2026-09-12',[exactPlan]),true);
 assert.equal(hasPreviewAccess([subscription], 'haneul',1,'2026-09-12',plans,'custom'),false);
 assert.equal(hasPreviewAccess([{...subscription,renewAt:'2026-09-11'}], 'haneul',2,'2026-09-12',plans),false);
 assert.equal(hasPreviewAccess([{...subscription,planSnapshot:{id:'standard',rank:2}}], 'haneul',2,'2026-09-12',[]),true);
});

test('all purchased ranks obey minimum-level matrix even with historical exact snapshot metadata',()=>{
 for(const rank of[1,2,3])for(const required of[1,2,3]){
  const s={...subscription,planSnapshot:{id:'standard',rank,entitlementMode:'exact'}};
  assert.equal(hasPreviewAccess([s],'haneul',required,'2026-09-12',[]),rank>=required);
  assert.equal(hasPreviewAccess([s],'other',required,'2026-09-12',[]),false);
 }
 assert.equal(hasPreviewAccess([{...subscription,planSnapshot:{rank:'3'}}],'haneul',2,'2026-09-12',[]),false);
});
