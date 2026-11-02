'use client';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {BeanWalletLink} from './BeanPages';
import {SignInPrompt} from './SignInPrompt';
import {SIGNUP_COMPLETE_KEY,loginTarget} from '@/lib/crefans/login-return';
import {REFERRAL_DISCLOSURE_LABEL,REFERRAL_DISCLOSURE_NOTICE,storedReferral} from '@/lib/crefans/referral';
export {SignInPrompt} from './SignInPrompt';
import {MarqueeText,MarqueeMotionControl} from '@/components/ui/MarqueeText';

import {BackButton} from './BackButton';
import navigationButton from './back-button.module.css';
import {CreatorName} from './CreatorName';

import {LegalDocumentBody} from './LegalDocumentBody';
import {ServiceFooter} from './ServiceFooter';
import {DialogActions} from '@/components/ui/DialogActions';
import {useEffect,useRef,useState, type FormEvent, type ReactNode} from 'react';
import Link from 'next/link';
import {TextLink} from '@/components/ui/TextLink';
import {Toggle} from '@/components/ui/Toggle';
import {Checkbox} from '@/components/ui/Choice';
import {AccordionItem} from '@/components/ui/Accordion';
import {SelectField} from '@/components/ui/SelectField';
import {Chip,Dialog, Field,TextAreaField} from '@/components/ui/Primitives';
import {ChipRow} from '@/components/ui/ChipRow';
import type {ServiceViewModel} from '@/types/crefans';
import type {AccountActionResult,AccountSettingsUpdate,AccountPreferences} from '@/types/crefans-account';
import Icon,{type LandingIconName as IconName} from './Icon';
import {ProfileHeader} from './ProfileHeader';
import {ProfilePhotoDialog} from './ProfilePhotoDialog';
import c from './creator.module.css';
import {Brand} from './Brand';
import {Action, Avatar, Empty, Notice, PageTitle} from './ServiceUI';
import s from './account.module.css';

const emailIsValid=(value:string)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const Chevron=()=> <Icon name="chevron" width={16} height={16}/>;
function Feedback({children}:{children:ReactNode}){return <p className={s.feedback} role="status">{children}</p>;}
function Guidance({text}:{text?:string}){return text?<Notice>{text}</Notice>:null;}
function useActionFeedback(){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function run(operation:()=>Promise<AccountActionResult>,onSuccess?:(message:string)=>void){
    if(busy)return;
    setBusy(true);setError('');
    try{const result=await operation();if(result.success)onSuccess?.(result.data.message);else setError(result.errorMessage);}
    catch{setError('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');}
    finally{setBusy(false);}
  }
  return {busy,error,run,clearError:()=>setError('')};
}

/** `onComplete` is the router's move to the completion page (presentation does not navigate by itself). */
export function SignupPage({model,onComplete}:{model:ServiceViewModel;onComplete?:()=>void}){
  const {account,accountActions,basePath}=model,task=useActionFeedback();
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[nickname,setNickname]=useState('');
  const [terms,setTerms]=useState(false),[privacy,setPrivacy]=useState(false),[marketing,setMarketing]=useState(false);
  const [submitted,setSubmitted]=useState(false),[policy,setPolicy]=useState<'terms'|'privacy'|'marketing'|null>(null);
  // Requirements come from the server; deferring PASS never marks the identity as verified.
  const [codeSent,setCodeSent]=useState(false),[code,setCode]=useState(''),[emailVerified,setEmailVerified]=useState(false),[emailNotice,setEmailNotice]=useState(''),[emailError,setEmailError]=useState(''),[verifying,setVerifying]=useState(false);
  const identityRequired=account.signupRequirements?.identityRequired!==false;
  const [ageAcknowledged,setAgeAcknowledged]=useState(false);
  // A referral link stored for this browser session asks for the disclosure agreement (2026-11-02); read after mount (sessionStorage).
  const [referred,setReferred]=useState(false),[referralDisclosure,setReferralDisclosure]=useState(false);
  useEffect(()=>{setReferred(!!storedReferral());},[]);
  const [passOpen,setPassOpen]=useState(false),[identityVerified,setIdentityVerified]=useState(false),[passPending,setPassPending]=useState(false),[passError,setPassError]=useState('');
  const errors={email:!emailIsValid(email)?'올바른 이메일 주소를 입력해주세요.':'',password:password.length<8?'비밀번호를 8자 이상 입력해주세요.':'',confirm:confirm!==password?'비밀번호가 서로 일치하지 않습니다.':'',nickname:!nickname.trim()?'닉네임을 입력해주세요.':''};
  const policiesReady=model.mode!=='live'||(account.agreements?.signupReady??account.agreements?.published)===true;
  const [inviteNotice,setInviteNotice]=useState('');
  const ready=policiesReady&&!Object.values(errors).some(Boolean)&&terms&&privacy&&emailVerified&&(identityRequired?identityVerified:ageAcknowledged)&&(!referred||referralDisclosure);
  function changeEmail(value:string){setEmail(value);setCodeSent(false);setCode('');setEmailVerified(false);setEmailNotice('');setEmailError('');}
  async function requestCode(){if(verifying||!emailIsValid(email))return;setVerifying(true);setEmailError('');setEmailNotice('');try{const result=await accountActions.requestSignupCode(email);if(result.success){setCodeSent(true);setEmailNotice(result.data.message);}else if(result.errorCode==='SIGNUP_INVITE_REQUIRED')setInviteNotice(result.errorMessage||'');else{setEmailError(result.errorMessage);if(result.errorCode==='RESEND_COOLDOWN')setCodeSent(true);}}catch{setEmailError('인증 코드를 보내지 못했어요. 다시 시도해주세요.');}finally{setVerifying(false);}}
  async function verifyCode(){if(verifying||!code.trim())return;setVerifying(true);setEmailError('');try{const result=await accountActions.verifySignupCode({email,code:code.trim()});if(result.success){setEmailVerified(true);setEmailNotice(result.data.message);}else setEmailError(result.errorMessage);}catch{setEmailError('인증 코드를 확인하지 못했어요. 다시 시도해주세요.');}finally{setVerifying(false);}}
  async function verifyPass(){if(passPending)return;setPassPending(true);setPassError('');try{const result=await accountActions.verifyIdentity();if(result.success){setIdentityVerified(true);setPassOpen(false);}else setPassError(result.errorMessage);}catch{setPassError('본인인증을 완료하지 못했어요. 다시 시도해주세요.');}finally{setPassPending(false);}}
  function submit(event:FormEvent){event.preventDefault();setSubmitted(true);if(ready)void task.run(()=>accountActions.signup({email,password,nickname,terms,privacy,marketing,emailVerified,identityVerified,ageAcknowledged,...(referred?{referralDisclosure}:{}),...(account.agreements?{policyVersions:account.agreements.versions}:{})}),()=>{try{sessionStorage.setItem(SIGNUP_COMPLETE_KEY,email);}catch{}setSubmitted(false);setPassword('');setConfirm('');onComplete?.();});}
  // 전체 동의 (2026-10-31): checks or clears every item shown, required and optional; clearing any one item clears it too.
  const allAgreed=terms&&privacy&&marketing&&(identityRequired||ageAcknowledged)&&(!referred||referralDisclosure);
  function agreeAll(checked:boolean){setTerms(checked);setPrivacy(checked);setMarketing(checked);if(!identityRequired)setAgeAcknowledged(checked);if(referred)setReferralDisclosure(checked);}
  return <section className={s.signup}><h1>회원가입</h1>
      <form onSubmit={submit} noValidate className={s.form}>
        <div className={s.verifyRow}><Field label="이메일" type="email" autoComplete="email" value={email} readOnly={emailVerified} onChange={e=>changeEmail(e.target.value)} placeholder="이메일을 입력하세요" error={submitted?errors.email:undefined}/>{emailVerified?<span className={s.verified}>인증 완료</span>:<Action type="button" variant="secondary" disabled={verifying||!emailIsValid(email)} onClick={()=>void requestCode()}>{codeSent?'다시 받기':'인증 코드 받기'}</Action>}</div>
        {codeSent&&!emailVerified&&<div className={s.verifyRow}><Field label="인증 코드" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value)} placeholder="6자리 코드"/><Action type="button" variant="secondary" disabled={verifying||!code.trim()} onClick={()=>void verifyCode()}>확인</Action></div>}
        {emailNotice&&<p className={s.hint} role="status">{emailNotice}</p>}{emailError&&<p className={s.error} role="alert">{emailError}</p>}
        <Field label="비밀번호" type="password" showPasswordToggle autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="비밀번호를 입력하세요" hint="8자 이상 입력해주세요." error={submitted?errors.password:undefined}/>
        <Field label="비밀번호 확인" type="password" showPasswordToggle autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="비밀번호를 다시 입력하세요" error={confirm&&confirm!==password?errors.confirm:undefined}/>
        <Field label="닉네임" autoComplete="nickname" maxLength={20} value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="닉네임을 입력하세요" error={submitted?errors.nickname:undefined}/>
        {identityRequired&&<div className={s.identityRow}><div><strong>본인인증</strong><span>{identityVerified?'PASS 본인인증 완료':'PASS 앱으로 본인인증을 진행합니다.'}</span></div>{identityVerified?<span className={s.verified}>인증 완료</span>:<Action type="button" variant="secondary" disabled={!policiesReady} onClick={()=>{setPassError('');setPassOpen(true);}}>PASS 본인인증</Action>}</div>}
        <div className={s.agreements}>
          <div className={s.agreeAll}><Checkbox label="전체 동의" description="필수 항목과 선택 항목(마케팅 정보 수신)에 모두 동의합니다. 선택 항목은 동의하지 않아도 가입할 수 있어요." checked={allAgreed} onChange={agreeAll}/></div>
          {!identityRequired&&<div><Checkbox label="만 19세 이상입니다 (필수)" checked={ageAcknowledged} onChange={setAgeAcknowledged}/></div>}
          <div><Checkbox label="이용약관 동의 (필수)" checked={terms} onChange={setTerms}/><button type="button" aria-label="이용약관 보기" onClick={()=>setPolicy('terms')}><Chevron/></button></div>
          <div><Checkbox label="개인정보 처리방침 확인 (필수)" checked={privacy} onChange={setPrivacy}/><button type="button" aria-label="개인정보 수집 및 이용 안내 보기" onClick={()=>setPolicy('privacy')}><Chevron/></button></div>
          {referred&&<div><Checkbox label={REFERRAL_DISCLOSURE_LABEL} description={REFERRAL_DISCLOSURE_NOTICE} checked={referralDisclosure} onChange={setReferralDisclosure}/></div>}
          <div><Checkbox label="마케팅 정보 수신 동의 (선택)" checked={marketing} onChange={setMarketing}/>{account.agreements&&<button type="button" aria-label="마케팅 정보 수신 안내 보기" onClick={()=>setPolicy('marketing')}><Chevron/></button>}</div>
          {submitted&&(!terms||!privacy)&&<p className={s.error} role="alert">이용약관에 동의하고 개인정보 처리방침을 확인해주세요.</p>}
          {submitted&&referred&&!referralDisclosure&&<p className={s.error} role="alert">초대 링크로 가입하려면 초대한 회원에게 표시되는 정보에 동의해주세요.</p>}
        </div>
        {task.error&&<p className={s.error} role="alert">{task.error}</p>}
        <Action type="submit" disabled={task.busy||!ready}>{task.busy?'확인 중…':'동의하고 가입하기'}</Action>
      </form>
    {identityRequired&&<Dialog open={passOpen} onClose={()=>{if(!passPending)setPassOpen(false);}} title="PASS 본인인증"><div className={s.dialogBody}><p>통신사 PASS 앱으로 연결해 본인인증을 진행합니다. 인증이 끝나면 이 화면으로 돌아옵니다.</p>{model.mode!=='live'&&<p className={s.hint}>목업에서는 아래 버튼을 누르면 인증이 완료된 것으로 처리됩니다.</p>}{passError&&<p className={s.error} role="alert">{passError}</p>}<DialogActions><Action variant="secondary" disabled={passPending} onClick={()=>setPassOpen(false)}>취소</Action><Action disabled={passPending} onClick={()=>void verifyPass()}>{passPending?'연결 중…':'PASS 앱으로 인증하기'}</Action></DialogActions></div></Dialog>}
    <Dialog open={!!inviteNotice} onClose={()=>setInviteNotice('')} title="가입 안내"><div className={s.dialogBody}><p>{inviteNotice}</p><DialogActions><Action type="button" onClick={()=>setInviteNotice('')}>확인</Action></DialogActions></div></Dialog>
    <Dialog open={!!policy} onClose={()=>setPolicy(null)} title={policy==='terms'?'이용약관':policy==='marketing'?'마케팅 정보 수신 동의':'개인정보 처리방침'}><div className={s.dialogBody}>{policy&&(account.agreements?<>{policy==='privacy'&&<LegalDocumentBody document={account.agreements.collection} idPrefix="signup-collection"/>}<LegalDocumentBody document={account.agreements.documents[policy]} idPrefix={`signup-${policy}`}/></>:<p className={s.ticketMessage}>{policy==='marketing'?'선택 동의입니다.':account.policies[policy]}</p>)}<DialogActions><Action variant="secondary" onClick={()=>setPolicy(null)}>확인</Action></DialogActions></div></Dialog>
  </section>;
}

/** `next` (the screen that asked for login) and `navigate` are injected by the router. */
export function LoginPage({model,next=null,navigate}:{model:ServiceViewModel;next?:string|null;navigate?:(path:string)=>void}){
  const {account,accountActions,basePath}=model,task=useActionFeedback(),target=loginTarget(basePath,next);
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[remember,setRemember]=useState(false),[submitted,setSubmitted]=useState(false);
  // A just-registered email fills the form. A live member who is already signed in does not stay on this page (preview starts signed in).
  useEffect(()=>{try{const registered=sessionStorage.getItem(SIGNUP_COMPLETE_KEY);if(registered)setEmail(registered);}catch{}},[]);
  useEffect(()=>{if(model.mode==='live'&&model.signedIn)navigate?.(target);},[model.mode,model.signedIn,target,navigate]);
  function submit(event:FormEvent){event.preventDefault();setSubmitted(true);if(emailIsValid(email)&&password.length>=8)void task.run(()=>accountActions.login({email,password,remember}),()=>{setPassword('');try{sessionStorage.removeItem(SIGNUP_COMPLETE_KEY);}catch{}if(model.mode==='live'||next)navigate?.(target);});}// preview login picks its own landing unless a return path was given
  return <section className={s.login}><h1>로그인</h1>
    <form onSubmit={submit} noValidate className={s.form}>
      <Field label="이메일" type="email" autoComplete="email" placeholder="이메일" value={email} onChange={e=>setEmail(e.target.value)} error={submitted&&!emailIsValid(email)?'올바른 이메일 주소를 입력해주세요.':undefined}/>
      <Field label="비밀번호" type="password" showPasswordToggle autoComplete="current-password" placeholder="비밀번호" value={password} onChange={e=>setPassword(e.target.value)} error={submitted&&password.length<8?'비밀번호를 8자 이상 입력해주세요.':undefined}/>
      <div className={s.loginOptions}><Checkbox label="로그인 상태 유지" checked={remember} onChange={setRemember}/><TextLink href={`${basePath}/reset-password`}>비밀번호 찾기</TextLink></div>
      {task.error&&<p className={s.error} role="alert">{task.error}</p>}<Action type="submit" disabled={task.busy||!emailIsValid(email)||password.length<8}>{task.busy?'로그인 중…':'로그인'}</Action>
    </form>
    <p className={s.authFoot}>계정이 없으신가요? <TextLink href={`${basePath}/signup`}>회원가입</TextLink></p>
    <Guidance text={account.guidance.login}/>
    <BackButton className={s.homeLink} href={`${basePath}/landing`} label="메인으로 돌아가기"/>
  </section>;
}

/** Replaces a signed-in page when there is no session; the guest gets a login nudge instead of an invented profile. */

export function MyProfilePage({model}:{model:ServiceViewModel}){
  if(model.signedIn===false)return <SignInPrompt basePath={model.basePath}/>;
  return <MyProfileContent model={model}/>;
}
function MyProfileContent({model}:{model:ServiceViewModel}){
  const {viewer,following,saved,liked,data,account,basePath}=model;
  const mode=account.route.profileTab,collection=mode==='saved'?saved:mode==='liked'?liked:null;
  const collectionPosts=collection?data.posts.filter(post=>collection.includes(post.id)):[];
  const [tab,setTab]=useState('피드');
  if(collection!==null)return <section className={s.profile}><PageTitle back={<BackButton href={`${basePath}/me`} label="내 프로필로 돌아가기"/>}>{mode==='saved'?'저장한 게시물':'좋아요한 게시물'}</PageTitle>{collectionPosts.length?<div className={s.savedGrid}>{collectionPosts.map(post=><Link href={`${basePath}/post/${post.id}`} key={post.id}>{model.canAccess(post.creatorId,post.requiredRank,post.requiredPlanId)?(post.image?<img src={post.image} alt={post.title} style={{objectPosition:post.position}}/>:<div className={s.collectionLocked}><Icon name="card"/><small>텍스트 게시물</small></div>):<div className={s.collectionLocked}><Icon name="lock"/><small>멤버십 전용</small></div>}<span>{post.title}</span></Link>)}</div>:<Empty title={mode==='saved'?'저장한 게시물이 없어요':'좋아요한 게시물이 없어요'} description="피드에서 마음에 드는 게시물을 담아보세요."/>}</section>;
  /** Same shell as a creator profile; the only differences are the ⚙ 설정 entry on the cover, no membership block, and empty feeds until the fan posts. */
  const privateFollowing=account.preferences.showFollowing===false;
  const tabs:[string,number|null][]=[['피드',0],['미디어',0],['소개',null]];
  const [photos,setPhotos]=useState(false),updatePhotos=model.accountActions.updatePhotos;
  return <div className={c.profile}>
    {updatePhotos&&<ProfilePhotoDialog open={photos} onClose={()=>setPhotos(false)} image={viewer.image} cover={viewer.cover} onSave={updatePhotos}/>}
    <ProfileHeader cover={viewer.cover} onEditPhotos={updatePhotos?()=>setPhotos(true):undefined} person={viewer} handle={viewer.handle} bio={viewer.bio} counts={[{label:'게시물',value:account.stats.posts},{label:'팔로워',private:account.preferences.showFollowers===false,value:account.stats.followers,href:`${basePath}/followers`},{label:'팔로잉',private:privateFollowing,href:`${basePath}/following`,value:<>{following.length}{privateFollowing&&<Icon name="lock" width="12" height="12" aria-label="비공개"/>}</>}]} action={<><BeanWalletLink basePath={basePath} className={`${c.coverControl} ${c.coverWallet}`}/><Link href={`${basePath}/settings`} className={`${c.coverControl} ${c.coverSettings}`} aria-label="설정"><Icon name="settings" width="18" height="18" aria-hidden="true"/></Link></>}/>
    <div className={c.tabs} aria-label="프로필 내용">{tabs.map(([item,count])=><button key={item} type="button" aria-pressed={tab===item} onClick={()=>setTab(item)}>{item}{count!==null&&<span className={c.tabCount}>{count}</span>}</button>)}</div>
    {tab==='소개'?<section className={c.about}><p>{viewer.bio||'아직 등록된 소개가 없습니다.'}</p></section>:<Empty title={tab==='피드'?'아직 게시물이 없어요':'아직 미디어가 없어요'} description="첫 게시물을 올리면 이곳에 모여요."/>}
  </div>;
}

type SettingsPanel='account'|'password'|'email'|'notifications'|'payment'|'privacy'|'blocked'|'withdraw'|null;
const settingsItems=[{key:'account',label:'프로필 수정',icon:'user'},{key:'email',label:'이메일 설정',icon:'mail'},{key:'password',label:'비밀번호 변경',icon:'lock'},{key:'privacy',label:'개인정보 관리',icon:'shield'},{key:'notifications',label:'알림 설정',icon:'bell'},{key:'payment',label:'결제수단 관리',icon:'card'},{key:'blocked',label:'차단한 사용자',icon:'ban'}] as const;
type SettingsItem=(typeof settingsItems)[number];
type SettingsLink=readonly [string,string,IconName?];
/** Reached from the ⚙ 설정 button on my profile. Tiers: what I can change about me, what I collected, what others may see, then notifications/payments and account management. */
const settingsGroups:{title:string;items?:SettingsItem['key'][];links?:SettingsLink[]}[]=[
  {title:'계정 설정',items:['account','email','password']},
  {title:'항목 모아보기',links:[['저장한 게시물','me?tab=saved','bookmark'],['좋아요한 게시물','me?tab=liked','heart'],['팔로잉 목록','following','users'],['팔로워 목록','followers','users']]},
  {title:'공개 설정',items:['privacy']},
  {title:'알림과 결제',items:['notifications','payment'],links:[['내 구독','subscriptions','card']]},
  {title:'계정 관리',items:['blocked']},
  {title:'서비스 안내'},
];
export function SettingsPage({model}:{model:ServiceViewModel}){
  const {viewer,account,accountActions,data,basePath}=model,task=useActionFeedback();
  const [category,setCategory]=useState('전체');
  const [panel,setPanel]=useState<SettingsPanel>(account.route.settingsSection),[notice,setNotice]=useSnackbarMessage();
  const [name,setName]=useState(viewer.name),[handle,setHandle]=useState(viewer.handle),[bio,setBio]=useState(viewer.bio),[email,setEmail]=useState(account.email),[currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[confirmPassword,setConfirmPassword]=useState(''),[error,setError]=useState('');
  const handleRequest=useRef(0),[handleCheck,setHandleCheck]=useState<{value:string;status:'checking'|'available'|'unavailable'|'error';message:string}|null>(null);
  const normalizedHandle=handle.trim(),handleValid=/^[a-z0-9_]{3,24}$/.test(normalizedHandle),handleChanged=normalizedHandle!==viewer.handle;
  const handleConfirmed=!handleChanged||(handleCheck?.value===normalizedHandle&&handleCheck.status==='available');
  const handleBusy=handleCheck?.status==='checking';
  function resetHandleCheck(){handleRequest.current++;setHandleCheck(null);}
  useEffect(()=>()=>{handleRequest.current++;},[]);
  async function checkHandle(){
    if(!handleValid||handleBusy)return;const value=normalizedHandle,request=++handleRequest.current;
    setHandleCheck({value,status:'checking',message:'핸들을 확인하고 있어요.'});
    try{const result=await accountActions.checkHandle(value);if(request!==handleRequest.current)return;
      setHandleCheck(result.success&&result.data.handle===value?{value,status:result.data.available?'available':'unavailable',message:result.data.available?'사용할 수 있는 핸들입니다.':'이미 사용 중인 핸들입니다.'}:{value,status:'error',message:result.errorMessage||'확인하지 못했습니다. 다시 시도해주세요.'});
    }catch{if(request===handleRequest.current)setHandleCheck({value,status:'error',message:'확인하지 못했습니다. 다시 시도해주세요.'});}
  }
  const [emailCode,setEmailCode]=useState(''),[emailSent,setEmailSent]=useState(false);
  const [preferences,setPreferences]=useState<AccountPreferences>({...account.preferences}),[confirmWithdraw,setConfirmWithdraw]=useState(false);
  const blockedCreators=data.creators.filter(creator=>account.blockedCreatorIds.includes(creator.id));
  function open(value:SettingsPanel){resetHandleCheck();setError('');task.clearError();setNotice('');setCurrentPassword('');setNewPassword('');setConfirmPassword('');setConfirmWithdraw(false);setName(viewer.name);setHandle(viewer.handle);setBio(viewer.bio);setEmail(account.email);setEmailCode('');setEmailSent(false);setPreferences({...account.preferences});setPanel(value);}
  function save(event:FormEvent){event.preventDefault();setError('');
    if(panel==='account'&&!name.trim()){setError('사용자명을 입력해주세요.');return;}
    if(panel==='email'&&model.mode==='live'&&!emailSent){if(!currentPassword){setError('현재 비밀번호를 입력해주세요.');return;}if(accountActions.requestEmailChange)void task.run(()=>accountActions.requestEmailChange!(email,currentPassword),message=>{setEmailSent(true);setCurrentPassword('');setNotice(message);});return;}
    if(panel==='email'&&!emailIsValid(email)){setError('올바른 이메일 주소를 입력해주세요.');return;}
    if(panel==='password'&&(!currentPassword||newPassword.length<8||newPassword!==confirmPassword)){setError(!currentPassword?'현재 비밀번호를 입력해주세요.':newPassword.length<8?'새 비밀번호를 8자 이상 입력해주세요.':'새 비밀번호가 서로 일치하지 않습니다.');return;}
    if(panel==='account'){if(handleChanged&&!handleValid){setError('핸들은 영문 소문자, 숫자, 밑줄 3~24자입니다.');return;}if(!handleConfirmed||handleBusy){setError('핸들 중복 확인을 완료해주세요.');return;}void task.run(async()=>{const result=await accountActions.updateProfile({name:name.trim(),bio:bio.trim(),...(handleChanged||handleValid?{handle:normalizedHandle}:{})});if(!result.success&&result.errorCode==='HANDLE_TAKEN')setHandleCheck({value:normalizedHandle,status:'unavailable',message:'이미 사용 중인 핸들입니다. 다시 확인해주세요.'});return result;},message=>{setNotice(message);setPanel(null);});return;}
    let input:AccountSettingsUpdate;
    if(panel==='email')input={section:panel,email,...(model.mode==='live'?{code:emailCode}:{})};
    else if(panel==='password')input={section:panel,currentPassword,newPassword};
    else if(panel==='notifications')input={section:panel,contentAlert:preferences.contentAlert,messageAlert:preferences.messageAlert,marketingAlert:preferences.marketingAlert,marketingVersion:account.agreements?.versions.marketing};
    else if(panel==='privacy')input={section:panel,showActivity:preferences.showActivity,allowSearch:preferences.allowSearch,showFollowers:preferences.showFollowers??true,showFollowing:preferences.showFollowing};
    else return;
    void task.run(()=>accountActions.updateSettings(input),message=>{setNotice(message);setCurrentPassword('');setNewPassword('');setConfirmPassword('');setPanel(null);});
  }
  const title=panel==='withdraw'?'회원 탈퇴':settingsItems.find(item=>item.key===panel)?.label||'설정';
  const panelReady=panel==='account'?!!name.trim()&&(!handleChanged||handleValid)&&handleConfirmed&&!handleBusy:panel==='email'?emailIsValid(email):panel==='password'?!!currentPassword&&newPassword.length>=8&&newPassword===confirmPassword:true;
  return <section className={s.settings} data-pull-refresh-block={task.busy||undefined}><PageTitle action={<Link href={`${basePath}/me`} className={navigationButton.button} aria-label="설정 닫기, 내 프로필로 이동" title="내 프로필로 이동"><Icon name="close" width={24} height={24} aria-hidden="true"/></Link>}>설정</PageTitle>
    <ChipRow label="설정 카테고리" className={s.settingsCategories}>
      <Chip selected={category==='전체'} onClick={()=>setCategory('전체')}>전체</Chip>
      {settingsGroups.map(group=><span key={group.title}><Chip selected={category===group.title} onClick={()=>setCategory(group.title)}>{group.title}</Chip></span>)}
    </ChipRow>
    {settingsGroups.filter(group=>group.title!=='서비스 안내'&&(category==='전체'||category===group.title)).map(group=><section className={s.menuGroup} key={group.title}><h3>{group.title}</h3><div className={s.menuList}>{group.items?.map(key=>{const item=settingsItems.find(entry=>entry.key===key)!;return <button key={item.key} type="button" onClick={()=>open(item.key)}><Icon name={item.icon} width={19} height={19}/><span>{item.label}</span><Chevron/></button>;})}{group.links?.map(([label,href,icon])=>/^https:/.test(href)?<a href={href} key={href} target="_blank" rel="noopener noreferrer"><span>{label} ↗</span><Chevron/></a>:<Link href={`${basePath}/${href}`} key={href}>{icon&&<Icon name={icon} width={19} height={19}/>}<span>{label}</span><Chevron/></Link>)}</div></section>)}
    <MarqueeMotionControl/>{(category==='전체'||category==='계정 관리')&&<div className={s.accountActions}><button disabled={task.busy} onClick={()=>void task.run(accountActions.logout,setNotice)}>로그아웃</button><button className={s.danger} onClick={()=>open('withdraw')}>회원 탈퇴 <Chevron/></button></div>}<Toast message={notice} onClose={()=>setNotice('')}/>{task.error&&!panel&&<p className={s.error} role="alert">{task.error}</p>}
    <Dialog open={!!panel} title={title} onClose={()=>{resetHandleCheck();setPanel(null);}}><form className={s.dialogBody} noValidate onSubmit={save}>
      {panel==='account'&&<><Avatar creator={viewer} size={64}/><Field label="사용자명" tooltip="크리에이터로 전환하지 않았을 때 프로필에 표시됩니다." value={name} onChange={e=>setName(e.target.value)} maxLength={20}/><div className={s.handleField}><Field label="핸들" value={handle} maxLength={24} autoComplete="username" autoCapitalize="none" spellCheck={false} disabled={task.busy} onChange={e=>{resetHandleCheck();setHandle(e.target.value.toLowerCase());setError('');task.clearError();}} action={<button className={s.handleCheck} type="button" disabled={task.busy||handleBusy||!handleValid} onClick={()=>void checkHandle()}>{handleBusy?'확인 중':'중복 확인'}</button>} error={handleChanged&&!handleValid?'핸들은 영문 소문자, 숫자, 밑줄 3~24자입니다.':undefined} hint="나를 구분하는 고유한 @아이디로, 프로필 주소에도 쓰여요. 영문 소문자, 숫자, 밑줄 3~24자."/><p className={s.handleStatus} data-state={handleCheck?.status} role="status" aria-live="polite">{handleCheck?.message||(handleChanged?'핸들을 변경하려면 중복 확인을 해주세요.':'현재 사용 중인 핸들입니다.')}</p></div><TextAreaField label="소개" tooltip="일반 회원 소개와 크리에이터 소개를 모두 입력하면, 프로필 페이지에는 크리에이터 소개가 우선 표시됩니다." value={bio} maxLength={120} rows={3} onChange={e=>setBio(e.target.value)}/><Guidance text={account.guidance.profile}/></>}
      {panel==='password'&&<><Field label="현재 비밀번호" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)}/><Field label="새 비밀번호" type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} hint="8자 이상 입력해주세요."/><Field label="새 비밀번호 확인" type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/><Guidance text={account.guidance.credentials}/></>}
      {panel==='email'&&<><Field label="이메일 주소" type="email" value={email} onChange={e=>{setEmail(e.target.value);setEmailSent(false);setEmailCode('');}}/>{model.mode==='live'&&!emailSent&&<Field label="현재 비밀번호" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} hint="본인 확인을 위해 현재 비밀번호를 입력해주세요."/>}{model.mode==='live'&&emailSent&&<Field label="인증 코드" value={emailCode} onChange={e=>setEmailCode(e.target.value)} maxLength={6} inputMode="numeric"/>}<p className={s.hint}>새 이메일 주소의 인증을 완료한 뒤 변경됩니다.</p></>}
      {panel==='notifications'&&<><Toggle label="새 콘텐츠 알림" description="구독한 크리에이터의 새로운 소식" checked={preferences.contentAlert} onChange={value=>setPreferences(previous=>({...previous,contentAlert:value}))}/><Toggle label="메시지 알림" description="새 메시지가 도착했을 때. 내 게시물·댓글에 달린 댓글·답글과 나를 태그한 댓글 알림은 항상 받습니다" checked={preferences.messageAlert} onChange={value=>setPreferences(previous=>({...previous,messageAlert:value}))}/><Toggle label="마케팅 알림" description="이메일·닉네임을 이벤트·프로모션 안내에 이용합니다. 동의 철회 또는 탈퇴 시까지 이용하며, 거부해도 필수 기능에 영향이 없습니다. 설정이나 메일 하단에서 무료로 철회할 수 있습니다. · 선택" checked={preferences.marketingAlert} onChange={value=>setPreferences(previous=>({...previous,marketingAlert:value}))}/><p className={s.hint}>구독·결제 등 필수 안내는 별도로 제공됩니다.</p></>}
      {panel==='privacy'&&<><Toggle label="활동 상태 공개" description="다른 사용자에게 온라인 상태 표시" checked={preferences.showActivity} onChange={value=>setPreferences(previous=>({...previous,showActivity:value}))}/><Toggle label="프로필 검색 허용" description="다른 사용자가 내 프로필을 검색" checked={preferences.allowSearch} onChange={value=>setPreferences(previous=>({...previous,allowSearch:value}))}/><Toggle label="팔로워 공개" description="끄면 다른 사람에게 팔로워 수와 목록 대신 자물쇠가 보여요" checked={preferences.showFollowers??true} onChange={value=>setPreferences(previous=>({...previous,showFollowers:value}))}/><Toggle label="팔로잉 공개" description="끄면 다른 사람에게 팔로잉 수와 목록 대신 자물쇠가 보여요" checked={preferences.showFollowing} onChange={value=>setPreferences(previous=>({...previous,showFollowing:value}))}/><Guidance text={account.guidance.preferences}/></>}
      {panel==='payment'&&<>{account.paymentMethods.length?<div className={s.menuList}>{account.paymentMethods.map(method=><div key={method.id}><strong>{method.label}</strong><p className={s.hint}>{method.description}</p></div>)}</div>:<Empty title="등록된 결제수단이 없어요" description="결제수단을 등록하고 관리하는 화면입니다."/>}<Guidance text={account.guidance.payment}/></>}
      {panel==='blocked'&&(blockedCreators.length?blockedCreators.map(creator=><div className={s.blocked} key={creator.id}><Avatar creator={creator} size={48}/><div><strong><CreatorName person={creator}/></strong><span><MarqueeText text={`@${creator.handle}`}/></span></div><Action type="button" variant="secondary" disabled={task.busy} onClick={()=>void task.run(()=>accountActions.unblockCreator(creator.id),setNotice)}>차단 해제</Action></div>):<Empty title="차단한 사용자가 없어요" description="차단한 사용자는 이곳에서 관리할 수 있습니다."/>)}
      {panel==='withdraw'&&<><p>탈퇴 전에 구독 상태와 결제 내역을 먼저 확인해주세요.</p>{!!model.ownCreatorIds?.length&&<p>크리에이터는 멤버십 판매 중단, 결제된 구독 기간 종료, 남은 수익 전액 출금 후 탈퇴할 수 있습니다.</p>}<p>남은 충전 콩은 지갑의 충전 내역에서 환불을 신청한 뒤 탈퇴해주세요. 프로모션콩은 탈퇴하면 사라집니다.</p><TextLink href={`${basePath}/subscriptions`} className={s.textLink} onClick={()=>setPanel(null)}>내 구독 확인하기</TextLink><TextLink href={`${basePath}/beans/charges`} className={s.textLink} onClick={()=>setPanel(null)}>충전 내역에서 환불하기</TextLink><Guidance text={account.guidance.withdraw}/><Checkbox label="안내를 확인했습니다." checked={confirmWithdraw} onChange={setConfirmWithdraw}/><DialogActions><Action variant="danger" type="button" disabled={!confirmWithdraw||task.busy} onClick={()=>void task.run(accountActions.withdraw,message=>{setNotice(message);setPanel(null);})}>{task.busy?'처리 중…':'탈퇴하기'}</Action></DialogActions></>}
      {(error||task.error)&&<p className={s.error} role="alert">{error||task.error}</p>}
      {panel&&['account','password','email','notifications','privacy'].includes(panel)&&<DialogActions><Action type="submit" disabled={task.busy||!panelReady||(panel==='email'&&model.mode==='live'&&emailSent&&!/^\d{6}$/.test(emailCode))}>{task.busy?'저장 중…':panel==='email'?(model.mode==='live'&&emailSent?'인증하고 변경':'인증 요청 확인'):'저장하기'}</Action></DialogActions>}
      {(panel==='payment'||panel==='blocked')&&<DialogActions><Action variant="secondary" type="button" onClick={()=>setPanel(null)}>닫기</Action>{panel==='payment'&&<Link href={`${basePath}/payment-methods`} className={s.primaryLink} onClick={()=>setPanel(null)}>결제수단 관리하기</Link>}</DialogActions>}
    </form></Dialog>
    {(category==='전체'||category==='서비스 안내')&&<section className={`${s.menuGroup} ${s.settingsService}`}><h3>서비스 안내</h3><ServiceFooter basePath={basePath} always/></section>}
  </section>;
}


export function SupportPage({model}:{model:ServiceViewModel}){
  const {account,accountActions,data,basePath}=model,task=useActionFeedback(),isQna=account.route.supportTab==='qna';
  const [search,setSearch]=useState(''),[category,setCategory]=useState(account.inquiryCategories[0]||''),[title,setTitle]=useState(''),[message,setMessage]=useState(''),[submitted,setSubmitted]=useState(false),[activeTicketId,setActiveTicketId]=useState<string|null>(null),[notice,setNotice]=useSnackbarMessage();
  const activeTicket=account.tickets.find(ticket=>ticket.id===activeTicketId);
  const filtered=data.faqs.filter(item=>`${item.question} ${item.answer}`.includes(search.trim()));
  function submit(event:FormEvent){event.preventDefault();setSubmitted(true);if(!category||!title.trim()||!message.trim())return;void task.run(()=>accountActions.createInquiry({category,title:title.trim(),message:message.trim()}),result=>{setTitle('');setMessage('');setSubmitted(false);setNotice(result);});}
  return <section className={s.support} data-pull-refresh-block={isQna||undefined}><PageTitle>고객센터</PageTitle><p>평일10~18시 · 2영업일 내 첫 답변을 목표로 합니다.</p><nav aria-label="이용안내" className={s.tabs}><Link href={`${basePath}/guide/fan`}>팬 이용안내</Link><Link href={`${basePath}/guide/creator`}>크리에이터 이용안내</Link></nav><nav className={s.tabs} aria-label="고객센터 메뉴"><Link href={`${basePath}/support`} aria-current={!isQna?'page':undefined}>자주 묻는 질문</Link><Link href={`${basePath}/support?tab=qna`} aria-current={isQna?'page':undefined}>문의하기</Link></nav>
    {!isQna?<><label className={s.search}><Icon name="search" width={19} height={19}/><input aria-label="자주 묻는 질문 검색" placeholder="궁금한 내용을 검색해보세요" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className={s.faqs}>{filtered.length?filtered.map(item=><AccordionItem key={item.question} title={item.question}>{item.answer}</AccordionItem>):<Empty title="검색 결과가 없어요" description="다른 단어로 검색하거나 문의를 남겨주세요." action={<TextLink href={`${basePath}/support?tab=qna`} className={s.textLink}>문의하기</TextLink>}/>}</div></>:<><form className={s.form} onSubmit={submit} noValidate><SelectField label="문의 유형" value={category} onChange={setCategory} options={account.inquiryCategories.map(item=>({value:item,label:item}))} placeholder="문의 유형을 선택해주세요" error={submitted&&!category?'문의 유형을 선택해주세요.':undefined} required/><Field label="제목" value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="문의 제목을 입력해주세요" error={submitted&&!title.trim()?'문의 제목을 입력해주세요.':undefined}/><TextAreaField label="문의 내용" rows={6} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} placeholder="문의 내용을 자세히 알려주세요" error={submitted&&!message.trim()?'문의 내용을 입력해주세요.':undefined}/><p className={s.hint}>비밀번호, 카드 번호 등 민감한 정보는 입력하지 마세요.</p>{task.error&&<p className={s.error} role="alert">{task.error}</p>}<Action type="submit" disabled={task.busy||!account.inquiryCategories.length||!category||!title.trim()||!message.trim()}>{task.busy?'등록 중…':'문의 등록하기'}</Action></form><Toast message={notice} onClose={()=>setNotice('')}/><h2 className={s.subheading}>내 문의 내역</h2>{account.tickets.length?<div className={s.ticketList}>{account.tickets.map(ticket=><button key={ticket.id} onClick={()=>setActiveTicketId(ticket.id)}><span><small>{ticket.category} · {ticket.statusLabel}</small><strong>{ticket.title}</strong></span><Chevron/></button>)}</div>:<Empty title="문의 내역이 없어요" description="남겨주신 문의를 이곳에서 확인할 수 있어요."/>}<Guidance text={account.guidance.support}/></>}
    <Dialog open={!!activeTicket} onClose={()=>setActiveTicketId(null)} title="문의 상세"><div className={s.dialogBody}>{activeTicket&&<><span className={s.hint}>{activeTicket.category} · {activeTicket.statusLabel}</span><h3>{activeTicket.title}</h3><p className={s.ticketMessage}>{activeTicket.message}</p>{activeTicket.reply&&<><h3>답변</h3><p className={s.ticketMessage}>{activeTicket.reply}</p></>}<Guidance text={account.guidance.ticket}/></>}<DialogActions><Action variant="secondary" onClick={()=>setActiveTicketId(null)}>닫기</Action></DialogActions></div></Dialog>
  </section>;
}
