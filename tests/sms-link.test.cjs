// 2026-11-16: the messaging app opens with the code on both platforms (Android '?body=', iOS '&body=').
const test=require('node:test'),assert=require('node:assert/strict'),{loadTypeScript}=require('./load-typescript.cjs');
const {smsHref,smsPlatform}=loadTypeScript('lib/crefans/sms-link.ts');
test('platform detection and link format',()=>{
 assert.equal(smsPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)'),'ios');
 assert.equal(smsPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',5),'ios','iPadOS desktop UA with touch');
 assert.equal(smsPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',0),'desktop');
 assert.equal(smsPlatform('Mozilla/5.0 (Linux; Android 14; SM-S928N)'),'android');
 assert.equal(smsHref('1666-3538','123456','ios'),'sms:16663538&body=123456');
 assert.equal(smsHref('1666-3538','123456','android'),'sms:16663538?body=123456');
});
