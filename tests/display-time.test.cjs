const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const {displayTime}=loadTypeScript('lib/crefans/display-time.ts');
test('service ISO times are shown in Korea time; mockup display text and empty values stay as they are',()=>{
 const shown=displayTime('2026-10-30T22:55:24.900Z');
 assert.doesNotMatch(shown,/T\d{2}:|Z$/);assert.match(shown,/2026/);assert.match(shown,/31/);assert.match(shown,/07:55/);
 assert.equal(displayTime('3시간 전'),'3시간 전');assert.equal(displayTime(''),'');assert.equal(displayTime(undefined),'');assert.equal(displayTime(null),'');
});
