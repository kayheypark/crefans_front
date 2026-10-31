'use client';
import {useEffect,useId,useRef,useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import type {AccountActionResult,ProfilePhotoChange} from '@/types/crefans-account';
import {Action} from './ServiceUI';
import s from './profile-photo.module.css';

const accept='image/jpeg,image/png,image/webp',maxBytes=5*1024*1024;
export function CameraIcon({size=18}:{size?:number}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>;}
type Pick={file:File|null;preview:string};// file null = remove

/** Profile photo and background photo editor for the member's own profile. Uploading and saving are injected by the model. */
export function ProfilePhotoDialog({open,onClose,image,cover,onSave}:{open:boolean;onClose:()=>void;image?:string;cover?:string;onSave:(input:ProfilePhotoChange)=>Promise<AccountActionResult>}){
  const [avatar,setAvatar]=useState<Pick>(),[background,setBackground]=useState<Pick>(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{if(open){setAvatar(undefined);setBackground(undefined);setError('');}},[open]);
  useEffect(()=>()=>{for(const pick of[avatar,background])if(pick?.file)URL.revokeObjectURL(pick.preview);},[avatar,background]);
  function choose(file:File|undefined,set:(pick:Pick)=>void){if(!file)return;if(!accept.split(',').includes(file.type)){setError('JPG·PNG·WEBP 사진만 올릴 수 있어요.');return;}if(file.size>maxBytes){setError('사진은 한 장에 5MB 이하만 올릴 수 있어요.');return;}setError('');set({file,preview:URL.createObjectURL(file)});}
  async function save(){if(busy)return;setBusy(true);setError('');const result=await onSave({...(avatar?{avatar:avatar.file}:{}),...(background?{cover:background.file}:{})});setBusy(false);if(result.success)onClose();else setError(result.errorMessage||'사진을 저장하지 못했어요. 다시 시도해주세요.');}
  const shownAvatar=avatar?avatar.preview:image||'',shownCover=background?background.preview:cover||'';
  return <Dialog open={open} onClose={()=>{if(!busy)onClose();}} title="프로필 사진 변경"><div className={s.body}>
    <section className={s.section}><div className={s.avatar}>{shownAvatar?<img src={shownAvatar} alt="프로필 사진 미리보기"/>:<CameraIcon size={28}/>}</div><div className={s.meta}><strong>프로필 사진</strong><p>정사각형으로 잘려 원형으로 보여요.</p><PhotoButtons label="프로필 사진" busy={busy} has={!!shownAvatar} onFile={file=>choose(file,setAvatar)} onRemove={()=>setAvatar({file:null,preview:''})}/></div></section>
    <section className={`${s.section} ${s.coverSection}`}><div className={s.meta}><strong>배경 사진</strong><p>프로필 위쪽에 가로로 넓게 보여요. 권장 1500×500(3:1)</p></div><div className={s.cover}>{shownCover?<img src={shownCover} alt="배경 사진 미리보기"/>:<span><CameraIcon size={24}/>배경 사진이 없어요</span>}</div><PhotoButtons label="배경 사진" busy={busy} has={!!shownCover} onFile={file=>choose(file,setBackground)} onRemove={()=>setBackground({file:null,preview:''})}/></section>
    <p className={s.hint}>JPG·PNG·WEBP, 한 장 최대 5MB. 저장하면 크리에이터 프로필에도 같은 사진이 쓰여요.</p>
    {error&&<p className={s.error} role="alert">{error}</p>}
    <DialogActions><Action variant="secondary" type="button" disabled={busy} onClick={onClose}>취소</Action><Action type="button" disabled={busy||(!avatar&&!background)} onClick={()=>void save()}>{busy?'저장 중…':'저장'}</Action></DialogActions>
  </div></Dialog>;
}
function PhotoButtons({label,busy,has,onFile,onRemove}:{label:string;busy:boolean;has:boolean;onFile:(file?:File)=>void;onRemove:()=>void}){
  const input=useRef<HTMLInputElement>(null),id=useId();
  return <div className={s.buttons}><input ref={input} id={id} className={s.file} type="file" accept={accept} aria-label={`${label} 파일`} disabled={busy} onChange={event=>{const file=event.currentTarget.files?.[0];event.currentTarget.value='';onFile(file);}}/>
    <button type="button" className={s.pick} disabled={busy} onClick={()=>input.current?.click()}><CameraIcon/>{`${label} 선택`}</button>{has&&<button type="button" className={s.remove} disabled={busy} onClick={onRemove}>{`${label} 삭제`}</button>}</div>;
}
