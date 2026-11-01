// Renders scripts/og/crefans-og.source.html to the 1200x630 share image used by lib/seo/site.ts.
const path=require('path'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:630}});
 await p.goto('file://'+path.resolve(__dirname,'og/crefans-og.source.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:path.resolve(__dirname,'../public/og/crefans-og.png')});await b.close();})();
