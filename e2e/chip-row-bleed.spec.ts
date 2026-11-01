import {test,expect} from '@playwright/test';
import {settledShot} from './qa-settled';
test.afterEach(settledShot);
// the period chip rows on bean history pages must reach both screen edges on phones, like settings.
test('chip rows reach the screen edges on phones',async({page})=>{await page.setViewportSize({width:390,height:844});const out:Record<string,any>={};
 for(const path of ['/preview/settings','/preview/beans/charges','/preview/beans/history','/preview/beans/tips']){await page.goto(path);const row=page.getByRole('group',{name:path.includes('settings')?'설정 카테고리':'조회 기간',exact:true}).last();await row.waitFor();const box=await row.boundingBox();out[path]={left:Math.round(box!.x),right:Math.round(box!.x+box!.width),label:await row.getAttribute('aria-label')};}
 console.log(JSON.stringify(out));for(const v of Object.values(out))expect([v.left,v.right]).toEqual([0,390]);});
