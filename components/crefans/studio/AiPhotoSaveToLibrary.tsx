'use client';
import {useRef,useState} from 'react';
import {Dialog,Field} from '@/components/ui/Primitives';
import {SelectField} from '@/components/ui/SelectField';
import {DialogActions} from '@/components/ui/DialogActions';
import {Action} from '../ServiceUI';
import {photoAssetSaveOptions} from '@/lib/crefans/photo-library';
import type {PhotoAssetCategory,PhotoLibraryModel} from '@/types/crefans-photo-library';
import type {StudioMedia} from '@/types/crefans-studio-management';
import s from './photo-library.module.css';

type Props={media:StudioMedia;model:PhotoLibraryModel;onClose:()=>void;onSaved:()=>void};
export function AiPhotoSaveToLibrary({media,model,onClose,onSaved}:Props){
 const [title,setTitle]=useState('AI로 만든 사진'),[category,setCategory]=useState<PhotoAssetCategory>('pose');
 const [saving,setSaving]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 async function save(){
  if(pending.current||!title.trim())return;
  pending.current=true;setSaving(true);setError('');
  try{
   const result=await model.save({id:media.id,title:title.trim(),category});
   if(!result.success){setError(result.errorMessage||'보관하지 못했어요. 다시 시도해 주세요.');return;}
   onSaved();
  }catch{setError('보관하지 못했어요. 연결을 확인하고 다시 시도해 주세요.');}
  finally{pending.current=false;setSaving(false);}
 }
 return <Dialog open title="내 보관함에 추가" onClose={()=>{if(!pending.current)onClose();}} persistent>
  <form className={s.body} onSubmit={event=>{event.preventDefault();void save();}} aria-busy={saving}>
   {/* eslint-disable-next-line @next/next/no-img-element -- generated private media, no extra upload */}
   <img className={s.saveResultPreview} src={media.url} alt="보관할 AI 사진"/>
   <p>이름과 분류를 정해 두면 내 보관함에서 다시 찾을 수 있어요.</p>
   <Field label="사진 이름" value={title} onChange={event=>setTitle(event.target.value)} maxLength={60} disabled={saving} required/>
   <SelectField label="보관 분류" value={category} onChange={value=>setCategory(value as PhotoAssetCategory)} options={photoAssetSaveOptions()} disabled={saving}/>
   {error&&<p role="alert">{error}</p>}
   <DialogActions>
    <Action type="button" variant="secondary" disabled={saving} onClick={onClose}>취소</Action>
    <Action type="submit" disabled={saving||!title.trim()}>{saving?'보관 중…':'보관함에 저장'}</Action>
   </DialogActions>
  </form>
 </Dialog>;
}
