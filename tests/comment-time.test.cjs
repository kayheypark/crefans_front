const test=require('node:test'),assert=require('node:assert/strict');
const {loadTypeScript}=require('./load-typescript.cjs');
const {displayRelativeTime}=loadTypeScript('lib/crefans/display-time.ts');
test('comment relative time keeps labels short at minute/hour/day boundaries and preserves fixture text',()=>{
 const now=Date.parse('2026-11-13T01:00:00Z'),at=seconds=>new Date(now-seconds*1000).toISOString();
 for(const [seconds,label] of [[0,'방금'],[59,'방금'],[60,'1분 전'],[3599,'59분 전'],[3600,'1시간 전'],[86399,'23시간 전'],[86400,'1일 전'],[172800,'2일 전'],[-60,'방금']])assert.equal(displayRelativeTime(at(seconds),now),label);
 assert.equal(displayRelativeTime('어제',now),'어제');assert.equal(displayRelativeTime(null,now),'');assert.equal(displayRelativeTime('2026-99-99T00:00:00Z',now),'');
});
