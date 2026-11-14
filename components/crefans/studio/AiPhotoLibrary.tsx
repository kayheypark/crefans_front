"use client";
import {useEffect,useRef,useState} from 'react';
import {Dialog,Field} from '@/components/ui/Primitives';
import {SelectField} from '@/components/ui/SelectField';
import {Action} from '../ServiceUI';
import type {PhotoAsset,PhotoAssetCategory,PhotoLibraryModel} from '@/types/crefans-photo-library';
import type {StudioMedia} from '@/types/crefans-studio-management';
import {photoAssetCategories,photoAssetLabel} from '@/lib/crefans/photo-library';
import {imageUploadAccept} from '@/lib/design/image-upload';
import s from './photo-library.module.css';
export function AiPhotoLibrary({open,model,selected,onSelect,onChanged,onClose}:{open:boolean;model:PhotoLibraryModel;selected:PhotoAsset[];onSelect:(item:PhotoAsset)=>void;onChanged:(id:string)=>void;onClose:()=>void}){
 const latest=useRef(model);latest.current=model;
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[page,setPage]=useState(0),[revision,setRevision]=useState(0),[items,setItems]=useState<PhotoAsset[]>([]),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(false),[spinner,setSpinner]=useState(false),[error,setError]=useState('');
 const [editing,setEditing]=useState<PhotoAsset|'new'|null>(null),[file,setFile]=useState<File|null>(null),[savedMedia,setSavedMedia]=useState<StudioMedia|null>(null),[title,setTitle]=useState(''),[assetCategory,setAssetCategory]=useState<PhotoAssetCategory>('pose'),[preview,setPreview]=useState(''),[saving,setSaving]=useState(false);
 useEffect(()=>{if(!open)return;let live=true;setLoading(true);const slow=setTimeout(()=>{if(live)setSpinner(true);},1000);const timer=setTimeout(()=>{void latest.current.list({q:query,category,page}).then(r=>{if(!live)return;if(r.success){setItems(r.data.items);setHasMore(r.data.hasMore);}else setError(r.errorMessage||'사진을 불러오지 못했어요.');}).catch(()=>{if(live)setError('사진을 불러오지 못했어요. 다시 시도해 주세요.');}).finally(()=>{if(live){setLoading(false);setSpinner(false);}clearTimeout(slow);});},query?250:0);return()=>{live=false;clearTimeout(timer);clearTimeout(slow);};},[open,query,category,page,revision]);
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 function edit(item:PhotoAsset|'new'){setFile(null);setSavedMedia(item==='new'?null:item);setTitle(item==='new'?'':item.title);setAssetCategory(item==='new'?(category||'pose') as PhotoAssetCategory:item.category);setEditing(item);}
 async function save(){if(saving)return;if(!title.trim()||(!file&&!savedMedia)){setError('사진과 이름을 입력해 주세요.');return;}setSaving(true);try{let media=savedMedia;if(!media&&file){const uploaded=await model.upload(file);if(!uploaded.success)throw new Error(uploaded.errorMessage||'업로드하지 못했어요.');media=uploaded.data;setSavedMedia(media);}if(!media)return;const r=await model.save({id:media.id,title:title.trim(),category:assetCategory});if(!r.success)throw new Error(r.errorMessage||'저장하지 못했어요.');onChanged(media.id);setEditing(null);setFile(null);setPage(0);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'사진을 저장하지 못했어요.');}finally{setSaving(false);}}
 async function remove(){if(!savedMedia||saving)return;setSaving(true);try{const r=await model.remove(savedMedia.id);if(!r.success)throw new Error(r.errorMessage||'삭제하지 못했어요.');onChanged(savedMedia.id);setEditing(null);setPage(0);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'삭제하지 못했어요.');}finally{setSaving(false);}}
 return <><Dialog open={open} title="내 보관함" onClose={()=>{if(!saving)onClose();}} fullscreenOnMobile persistent><div className={s.body}>
  <div className={s.intro}><p>내 사진을 저장하고, 합성에 참고할 부분을 골라 보세요.</p><Action type="button" onClick={()=>edit('new')}>사진 추가</Action></div>
  <Field label="사진 검색" type="search" placeholder="사진 이름 검색" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>
  <SelectField label="분류" value={category} onChange={value=>{setCategory(value);setPage(0);}} options={[{value:'',label:'전체'},...photoAssetCategories]}/>
  <div aria-busy={loading}>{spinner&&<p role="status">사진을 불러오고 있어요…</p>}{!loading&&!items.length&&<div className={s.empty}>{query||category?'조건에 맞는 사진이 없어요.':'아직 보관한 사진이 없어요.'}</div>}
  <div className={s.grid}>{items.map(item=><article key={item.id} className={s.card}><button type="button" aria-label={`${item.title} 선택`} aria-pressed={selected.some(value=>value.id===item.id)} disabled={loading} onClick={()=>onSelect(item)}>
   {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}<img src={item.url} alt=""/><span className={s.check} aria-hidden="true">{selected.some(value=>value.id===item.id)?'✓':'+'}</span><strong>{item.title}</strong><span className={s.category}>{photoAssetLabel(item.category)}</span></button><button type="button" className={s.edit} aria-label={`${item.title} 정보 수정`} onClick={()=>edit(item)}>•••</button></article>)}</div></div>
  {(page>0||hasMore)&&<div className={s.pages}><Action type="button" variant="secondary" disabled={!page||loading} onClick={()=>setPage(v=>v-1)}>이전</Action><span>{page+1}</span><Action type="button" variant="secondary" disabled={!hasMore||loading} onClick={()=>setPage(v=>v+1)}>다음</Action></div>}
  <Action type="button" onClick={onClose}>{selected.length?`${selected.length}개 선택 완료`:'닫기'}</Action>
 </div></Dialog>
 <Dialog open={open&&!!editing} title={editing==='new'?'사진 보관하기':'사진 정보'} onClose={()=>{if(!saving){setEditing(null);setFile(null);}}} persistent><div className={s.body}>
  {(preview||savedMedia?.url)&&<img className={s.preview} src={preview||savedMedia?.url} alt="보관할 사진"/>}
  {editing==='new'&&!savedMedia&&<label className={s.file}>사진 선택<input type="file" accept={imageUploadAccept} disabled={saving} onChange={e=>{const next=e.target.files?.[0];if(next){setFile(next);if(!title)setTitle(next.name.replace(/\.[^.]+$/,'').slice(0,60));}}}/></label>}
  <Field label="사진 이름" value={title} maxLength={60} disabled={saving} onChange={e=>setTitle(e.target.value)}/>
  <SelectField label="참고할 부분" value={assetCategory} onChange={v=>setAssetCategory(v as PhotoAssetCategory)} options={photoAssetCategories} disabled={saving}/>
  <p className={s.note}>사진은 공용 프리셋에 공개되지 않아요. 선택한 부분만 합성에 참고해요.</p>
  <Action type="button" onClick={()=>void save()} disabled={saving||!title.trim()||(!file&&!savedMedia)}>{saving?'저장 중…':'보관함에 저장'}</Action>
  {editing!=='new'&&<button type="button" className={s.remove} disabled={saving} onClick={()=>void remove()}>보관함에서 삭제</button>}
 </div></Dialog>
 <Dialog open={open&&!!error} title="사진 보관함 안내" onClose={()=>setError('')} persistent><div className={s.body}><p role="alert">{error}</p><Action type="button" onClick={()=>{setError('');setRevision(v=>v+1);}}>확인</Action></div></Dialog></>;
}
