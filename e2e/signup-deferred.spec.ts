import {test,expect} from './fixtures';

test('초대된 이메일로 PASS 없이 가입하고 인증 권한 없이 로그인한다',async({page,scenario,control})=>{
 await control('signup-mode',{mode:'email-only',inviteOnly:true});
 try{
  await page.goto('/service/signup');
  await expect(page.getByRole('button',{name:'PASS 본인인증',exact:true})).toHaveCount(0);
  await page.getByLabel('이메일',{exact:true}).fill(scenario.signupEmail);
  await page.getByRole('button',{name:'인증 코드 받기',exact:true}).click();
  await expect(page.getByLabel('인증 코드',{exact:true})).toBeVisible();
  await expect.poll(async()=>(await control('mail')).code).toEqual(expect.any(String));
  await page.getByLabel('인증 코드',{exact:true}).fill((await control('mail')).code);
  await page.getByRole('button',{name:'확인',exact:true}).click();
  await page.getByLabel('비밀번호',{exact:true}).fill(scenario.password);
  await page.getByLabel('비밀번호 확인',{exact:true}).fill(scenario.password);
  await page.getByLabel('닉네임',{exact:true}).fill('이메일 가입 검증');
  await page.getByRole('checkbox',{name:'이용약관 동의 (필수)',exact:true}).check();
  await page.getByRole('checkbox',{name:'개인정보 처리방침 확인 (필수)',exact:true}).check();
  await expect(page.getByRole('button',{name:'동의하고 가입하기',exact:true})).toBeDisabled();
  await page.getByRole('checkbox',{name:'만 19세 이상입니다 (필수)',exact:true}).check();
  await expect(page.getByRole('button',{name:'동의하고 가입하기',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'동의하고 가입하기',exact:true}).click();
  await expect(page.getByRole('heading',{name:'가입 완료',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'로그인하러 가기',exact:true}).click();
  await page.getByLabel('이메일',{exact:true}).fill(scenario.signupEmail);
  await page.getByLabel('비밀번호',{exact:true}).fill(scenario.password);
  await page.getByRole('button',{name:'로그인',exact:true}).click();
  await expect(page.getByRole('link',{name:'이메일 가입 검증 내 프로필',exact:true})).toBeVisible();
 expect(await control('signup-wallet')).toEqual({walletCount:1,accountCount:5});
 }finally{await control('signup-mode',{mode:'pass'});}
});
