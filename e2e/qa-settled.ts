import type {Page,TestInfo} from '@playwright/test';
// QA runs only (QA_SETTLED_SHOT=1): register per spec file with test.afterEach(settledShot). Waits for running CSS/Web
// animations (overlay fades, sheet slides) and keeps a settled end-of-test screen; the automatic screenshot can land mid-transition.
export async function settledShot({page}:{page:Page},info:TestInfo){
 if(!process.env.QA_SETTLED_SHOT||page.isClosed()||page.url()==='about:blank')return;
 try{await page.evaluate(()=>Promise.race([Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>null))),new Promise(r=>setTimeout(r,2000))]));await page.waitForTimeout(150);
  const file=info.outputPath('settled-final.png');await page.screenshot({path:file});await info.attach('settled-final',{path:file,contentType:'image/png'});}catch{}
}
