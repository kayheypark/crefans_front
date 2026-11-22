const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
// 2026-11-22 user decision: the basic service landing is removed; old links go to the AI photo landing with their query kept.
test('basic landing redirects to the AI photo landing and nothing links to it anymore',()=>{
 const page=fs.readFileSync('app/service/landing/page.tsx','utf8');
 assert.match(page,/redirect\('\/service\/landing-ai-image-generation'\+\(q\?'\?'\+q:''\)\)/);assert.doesNotMatch(page,/components\/service\/Landing/);
 assert.equal(fs.existsSync('components/service/Landing.tsx'),false);
 assert.doesNotMatch(fs.readFileSync('components/crefans/ServiceLinks.tsx','utf8'),/path:'landing'/);
 assert.doesNotMatch(fs.readFileSync('components/crefans/studio/StudioShell.tsx','utf8'),/\/landing`\}>서비스 소개/);
 assert.match(fs.readFileSync('components/business-card/BusinessCard.tsx','utf8'),/'https:\/\/crefans\.com\/service\/landing-ai-image-generation'/);
});
