"use client";
import {useEffect,useRef,useState} from 'react';
import {Dialog,Field} from '@/components/ui/Primitives';
import {SelectField} from '@/components/ui/SelectField';
import {Action} from '../ServiceUI';
import type {PhotoAsset,PhotoAssetCategory,PhotoLibraryModel} from '@/types/crefans-photo-library';
import type {StudioMedia} from '@/types/crefans-studio-management';
import {photoAssetCategories,photoAssetLabel} from '@/lib/crefans/photo-library';
import {imageUploadAccept} from '@/lib/design/image-upload';
import Icon from '../Icon';
import s from './photo-library.module.css';

type Section={category:PhotoAssetCategory;items:PhotoAsset[];total:number|null;hasMore:boolean};
// Older API builds return no total; then the count shows what is loaded, with + when more pages exist.
const countText=(total:number|null,loaded:number,more:boolean)=>total??`${loaded}${more?'+':''}`;
export function AiPhotoLibrary({open,model,selected,onSelect,onChanged,onClose}:{open:boolean;model:PhotoLibraryModel;selected:PhotoAsset[];onSelect:(item:PhotoAsset)=>void;onChanged:(id:string)=>void;onClose:()=>void}){
 const latest=useRef(model);latest.current=model;
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[page,setPage]=useState(0),[revision,setRevision]=useState(0),[items,setItems]=useState<PhotoAsset[]>([]),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(false),[spinner,setSpinner]=useState(false),[error,setError]=useState('');
 const [sections,setSections]=useState<Section[]>([]),[total,setTotal]=useState<number|null>(null),[searchOpen,setSearchOpen]=useState(false);
 const listMode=!!category||!!query.trim();
 const [editing,setEditing]=useState<PhotoAsset|'new'|null>(null),[file,setFile]=useState<File|null>(null),[savedMedia,setSavedMedia]=useState<StudioMedia|null>(null),[title,setTitle]=useState(''),[assetCategory,setAssetCategory]=useState<PhotoAssetCategory>('pose'),[preview,setPreview]=useState(''),[saving,setSaving]=useState(false);
 // 2026-11-15 user choice B: without a search or category the library shows one row per category (first page each); a category or search shows the paged grid.
 useEffect(()=>{if(!open)return;let live=true;setLoading(true);const slow=setTimeout(()=>{if(live)setSpinner(true);},1000);const fail=(message?:string|null)=>{if(live)setError(message||'사진을 불러오지 못했어요. 다시 시도해 주세요.');};
  const timer=setTimeout(()=>{const run=listMode?latest.current.list({q:query.trim(),category,page}).then(r=>{if(!live)return;if(r.success){setItems(r.data.items);setHasMore(r.data.hasMore);setTotal(r.data.total??null);}else fail(r.errorMessage);})
   :Promise.all(photoAssetCategories.map(item=>latest.current.list({q:'',category:item.value,page:0}))).then(results=>{if(!live)return;const next:Section[]=[];for(let index=0;index<results.length;index++){const r=results[index];if(!r.success){fail(r.errorMessage);return;}if(r.data.items.length)next.push({category:photoAssetCategories[index].value,items:r.data.items,total:r.data.total??null,hasMore:r.data.hasMore});}setSections(next);});
   void run.catch(()=>fail()).finally(()=>{if(live){setLoading(false);setSpinner(false);}clearTimeout(slow);});},query?250:0);
  return()=>{live=false;clearTimeout(timer);clearTimeout(slow);};},[open,query,category,page,revision,listMode]);
 useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 function edit(item:PhotoAsset|'new',preset?:PhotoAssetCategory){setFile(null);setSavedMedia(item==='new'?null:item);setTitle(item==='new'?'':item.title);setAssetCategory(item==='new'?preset||(category||'pose') as PhotoAssetCategory:item.category);setEditing(item);}
 async function save(){if(saving)return;if(!title.trim()||(!file&&!savedMedia)){setError('사진과 이름을 입력해 주세요.');return;}setSaving(true);try{let media=savedMedia;if(!media&&file){const uploaded=await model.upload(file);if(!uploaded.success)throw new Error(uploaded.errorMessage||'업로드하지 못했어요.');media=uploaded.data;setSavedMedia(media);}if(!media)return;const r=await model.save({id:media.id,title:title.trim(),category:assetCategory});if(!r.success)throw new Error(r.errorMessage||'저장하지 못했어요.');onChanged(media.id);setEditing(null);setFile(null);setPage(0);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'사진을 저장하지 못했어요.');}finally{setSaving(false);}}
 async function remove(){if(!savedMedia||saving)return;setSaving(true);try{const r=await model.remove(savedMedia.id);if(!r.success)throw new Error(r.errorMessage||'삭제하지 못했어요.');onChanged(savedMedia.id);setEditing(null);setPage(0);setRevision(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'삭제하지 못했어요.');}finally{setSaving(false);}}
 const tile=(item:PhotoAsset)=>{const on=selected.some(value=>value.id===item.id);return <li key={item.id} className={s.tile}><button type="button" className={s.pick} aria-label={`${item.title} 선택`} aria-pressed={on} disabled={loading} onClick={()=>onSelect(item)}>
  {/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}<img src={item.url} alt=""/><span className={s.check} aria-hidden="true">{on?'✓':''}</span></button><button type="button" className={s.edit} aria-label={`${item.title} 정보 수정`} onClick={()=>edit(item)}>•••</button></li>;};
 return <><Dialog open={open} title="내 보관함" onClose={()=>{if(!saving)onClose();}} fullscreenOnMobile persistent><div className={s.body}>
  <div className={s.toolbar}>{listMode&&<div className={s.listHead}>{category&&<button type="button" className={s.back} aria-label="분류별 보기로 돌아가기" onClick={()=>{setCategory('');setPage(0);}}><Icon name="chevron" width={18} height={18}/></button>}<h3>{category?photoAssetLabel(category as PhotoAssetCategory):'검색 결과'} <span>{countText(total,page*24+items.length,hasMore)}</span></h3></div>}
   <button type="button" className={s.iconButton} aria-label="사진 검색" aria-expanded={searchOpen||!!query} onClick={()=>setSearchOpen(value=>!value)}><Icon name="search" width={18} height={18}/></button><button type="button" className={s.iconButton} data-primary="true" aria-label="사진 추가" onClick={()=>edit('new')}><Icon name="plus" width={18} height={18}/></button></div>
  {(searchOpen||!!query)&&<Field label="사진 검색" type="search" placeholder="사진 이름 검색" value={query} onChange={e=>{setQuery(e.target.value);setPage(0);}}/>}
  <div className={s.content} aria-busy={loading}>{spinner&&<p role="status">사진을 불러오고 있어요…</p>}
  {!listMode&&<>{sections.map(section=>{const label=photoAssetLabel(section.category);return <section key={section.category} className={s.section} aria-label={`${label} 사진`}><div className={s.sectionHead}><h3>{label} <span>{countText(section.total,section.items.length,section.hasMore)}</span></h3><button type="button" className={s.all} onClick={()=>{setCategory(section.category);setPage(0);}}>전체보기<Icon name="chevron" width={14} height={14}/></button></div>
    <ul className={s.row}>{section.items.map(tile)}<li className={s.tile}><button type="button" className={s.addTile} aria-label={`${label} 사진 추가`} onClick={()=>edit('new',section.category)}>＋<span>추가</span></button></li></ul></section>;})}
   {!loading&&!sections.length&&<div className={s.empty}><p>아직 보관한 사진이 없어요.</p><Action type="button" onClick={()=>edit('new')}>사진 추가</Action></div>}</>}
  {listMode&&<>{!loading&&!items.length&&<div className={s.empty}><p>{query?'조건에 맞는 사진이 없어요.':'아직 보관한 사진이 없어요.'}</p></div>}<ul className={s.grid}>{items.map(tile)}</ul>
   {(page>0||hasMore)&&<div className={s.pages}><Action type="button" variant="secondary" disabled={!page||loading} onClick={()=>setPage(v=>v-1)}>이전</Action><span>{page+1}</span><Action type="button" variant="secondary" disabled={!hasMore||loading} onClick={()=>setPage(v=>v+1)}>다음</Action></div>}</>}
  </div>
  <div className={s.footer}>{selected.length>0&&<ul className={s.tray} aria-label="고른 사진">{selected.map(item=><li key={item.id}>{/* eslint-disable-next-line @next/next/no-img-element -- authenticated private media */}<img src={item.url} alt=""/><button type="button" aria-label={`${item.title} 선택 해제`} onClick={()=>onSelect(item)}>×</button></li>)}</ul>}
   <Action type="button" onClick={onClose}>{selected.length?'선택 완료':'닫기'}</Action></div>
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
