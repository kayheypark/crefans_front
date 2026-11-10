import {test,expect,enterPin} from './fixtures';
// 2026-11-11 PinPad: shuffled keypad + dots for every withdrawal PIN (preview mock data; no real payout).
// PC: compact card, number keys work on the focused pad. Mobile: full-screen dialog, keypad at the bottom, no sideways scroll.
test('출금 PIN 설정·멤버십 출금 확인을 PIN 키패드로 (PC 키보드·모바일 화면)',async({page,isMobile},info)=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/preview/studio/security');const setup=page.getByRole('group',{name:'새 출금 PIN 입력',exact:true});await expect(setup).toBeVisible();
 const digits=await setup.getByRole('button',{name:/^\d$/}).allTextContents();expect([...digits].sort()).toEqual(['0','1','2','3','4','5','6','7','8','9']);
 await page.screenshot({path:info.outputPath('01-setup.png'),fullPage:true});
 await enterPin(page,'246810','새 출금 PIN 입력');await enterPin(page,'135790','출금 PIN 한 번 더 입력');
 await expect(page.getByRole('alert').filter({hasText:'서로 달라'})).toHaveCount(1);await expect(page.getByRole('group',{name:'새 출금 PIN 입력',exact:true})).toBeVisible();
 await enterPin(page,'246810','새 출금 PIN 입력');await enterPin(page,'246810','출금 PIN 한 번 더 입력');await expect(page.getByText('출금 PIN이 설정되어 있어요')).toBeVisible();
 await page.getByRole('link',{name:'출금 요청으로 이동',exact:true}).click();
 await page.getByRole('spinbutton',{name:'출금 금액',exact:true}).fill('100000');await page.getByRole('button',{name:'신청 내용 확인',exact:true}).click();await page.getByRole('button',{name:'출금 요청하기',exact:true}).click();
 const pad=page.getByRole('group',{name:'출금 PIN 입력',exact:true});await expect(pad).toBeVisible();await expect(pad).toContainText('₩100,000');
 const box=await pad.boundingBox(),view=page.viewportSize()!;
 if(isMobile){const keys=await pad.locator('button').last().boundingBox();expect(keys!.y+keys!.height).toBeGreaterThan(view.height-120);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(view.width);}
 else expect(box!.width).toBeLessThanOrEqual(361);
 await expect(page.getByRole('dialog')).toHaveCSS('opacity','1');await page.waitForTimeout(400);await page.screenshot({path:info.outputPath('02-confirm.png')});
 if(isMobile)await enterPin(page,'246810','출금 PIN 입력');else await page.keyboard.type('246810');
 await expect(page.getByRole('heading',{name:'출금 요청을 확인해 주세요'})).toBeVisible();await page.screenshot({path:info.outputPath('03-done.png'),fullPage:true});
 expect(errors).toEqual([]);
});
