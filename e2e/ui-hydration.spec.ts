import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);

for(const screen of ['settings','feed'] as const){
  test(`early ${screen} actions wait for client initialization`,async({page})=>{
    let release!:()=>void;
    const scriptsReady=new Promise<void>(resolve=>{release=resolve;});
    await page.route('**/_next/static/**/*.js',async route=>{await scriptsReady;await route.continue();});
    let action:Promise<void>|undefined;
    try{
      await page.goto(`/preview/${screen}`,{waitUntil:'commit'});
      const control=screen==='settings'
        // 3f07359 (2026-11-04): the text-motion switch moved into the 표시 설정 dialog; its opener is the server-rendered settings control.
        ?page.locator('main').getByRole('button',{name:'표시 설정',includeHidden:true})
        :page.getByRole('article',{includeHidden:true}).filter({has:page.locator('a[href="/preview/post/moka-first-shoot"]')}).getByRole('button',{name:/댓글 .*펼치기/,includeHidden:true});
      await expect(control).toBeVisible();
      await control.focus();
      expect(await control.evaluate(el=>el===document.activeElement)).toBe(false);
      let completed=false;
      action=control.click().then(()=>{completed=true;});
      // Deliberately hold all application scripts: the early action must remain pending.
      await page.waitForTimeout(250);
      expect(completed).toBe(false);
      release();await action;
      if(screen==='settings')await expect(page.getByRole('dialog',{name:'표시 설정'}).getByRole('switch',{name:'텍스트 움직임',exact:true})).toBeVisible();
      else await expect(page.getByRole('textbox',{name:'댓글 남기기',exact:true})).toBeVisible();
      await expect(page.locator('main')).not.toHaveAttribute('inert','');
    }finally{release();await action?.catch(()=>{});}
  });
}
