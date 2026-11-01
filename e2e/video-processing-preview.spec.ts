import {test,expect} from '@playwright/test';

test('selected upload/list/feed designs and processing transitions',async({page},info)=>{
 const errors:string[]=[],unfinished:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(request.url().includes('catalog-unfinished'))unfinished.push(request.url());});
 await page.goto('/design-system');await page.getByRole('button',{name:'서비스 UI',exact:true}).click();
 const section=page.locator('#video-processing'),upload=section.locator('[data-processing-example="upload"]'),list=section.locator('[data-processing-example="list"]'),feed=section.locator('[data-processing-example="feed"]');
 await expect(upload.locator('[data-video-processing="upload"]')).toBeVisible();await expect(upload.locator('video')).toHaveCount(0);
 const tile=await upload.locator('[data-video-processing="upload"]').boundingBox(),label=await upload.getByText('영상 최적화 중',{exact:true}).boundingBox();expect(label!.y).toBeGreaterThan(tile!.y+tile!.height);
 await expect(list.locator('[data-video-processing="thumbnail"]')).toBeVisible();await expect(list.locator('[data-video-processing="badge"]')).toHaveText('최적화 중');await expect(list.locator('[data-status="published"]')).toHaveText('게시됨');
 const title=await list.getByRole('link',{name:'오늘의 촬영 이야기',exact:true}).boundingBox(),chip=await list.locator('[data-video-processing="badge"]').boundingBox();expect(chip!.y).toBeGreaterThan(title!.y);
 const placeholder=feed.locator('[data-video-processing="media"]');await expect(placeholder).toHaveText('영상 최적화 중완료되면 영상을 볼 수 있어요.');
 const centered=await placeholder.evaluate(node=>{const rect=node.getBoundingClientRect(),icon=node.querySelector('svg')!.getBoundingClientRect();return {display:getComputedStyle(node).display,offset:Math.abs((rect.left+rect.width/2)-(icon.left+icon.width/2)),width:rect.width,height:rect.height};});expect(centered.display).toBe('flex');expect(centered.offset).toBeLessThan(1);expect(centered.height).toBeGreaterThan(180);
 for(const [name,node] of [['upload',upload],['list',list],['feed',feed]] as const){await node.scrollIntoViewIfNeeded();await node.screenshot({path:info.outputPath(name+'.png'),style:'nav[aria-label="디자인 라이브러리 탐색"],nextjs-portal{visibility:hidden!important}'});}
 await page.emulateMedia({reducedMotion:'reduce'});expect(await placeholder.locator('[class*="spinner"]').evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
 async function choose(value:string){await section.getByRole('combobox',{name:'영상 처리 상태'}).click();await page.getByRole('option',{name:value,exact:true}).click();}
 await choose('최적화 중 · 로컬 미리보기 있음');await expect(upload.locator('video')).toHaveCount(1);await expect(upload.locator('[data-video-processing="upload"]')).toHaveAttribute('data-preview','true');await expect(feed.locator('video')).toHaveCount(0);
 await choose('완료');await expect(section.locator('[data-video-processing]')).toHaveCount(0);await expect(feed.locator('video')).toHaveAttribute('controls','');await expect(upload.locator('video')).toHaveCount(1);
 await choose('실패');await expect(upload.locator('[data-failed="true"]')).toContainText('변환 실패');await expect(upload.locator('[data-failed="true"]')).toContainText('삭제 후 다시 올려 주세요');await expect(upload.locator('video')).toHaveCount(0);await expect(feed.locator('video')).toHaveCount(0);
 await choose('최적화 중');await upload.getByRole('button',{name:'1번째 동영상 삭제',exact:true}).click();await expect(upload.locator('li')).toHaveCount(0);await expect(upload.getByText('0/10',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(unfinished).toEqual([]);expect(errors).toEqual([]);
});

test('existing preview editor, list and feed keep normal media controls',async({page},info)=>{
 await page.goto('/preview/studio/content/new');await expect(page.getByText('파일 업로드',{exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'사진·동영상 추가',exact:true})).toBeVisible();
 await page.goto('/preview/studio/content');await expect(page.getByRole('heading',{name:'게시물',exact:true})).toBeVisible();await expect(page.locator('[data-video-processing]')).toHaveCount(0);
 await page.goto('/preview/post/morning');const video=page.locator('video').first();await expect(video).toHaveAttribute('src',/video_1.mp4#t=0.001/);await expect(page.locator('[data-video-processing]')).toHaveCount(0);
 await page.screenshot({path:info.outputPath('normal-post.png')});
});
