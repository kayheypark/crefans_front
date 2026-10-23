'use client';
import {useState} from 'react';
import {ImageUpload} from '@/components/ui/ImageUpload';
import {Toggle} from '@/components/ui/Toggle';
import {MembershipPlanCard} from '@/components/crefans/MembershipPlanCard';
import {useLocalImages} from '@/components/preview/studio/useLocalImages';
import {imageUploadAccept} from '@/lib/design/image-upload';
import {plans} from '@/components/preview/service/fixtures';
import s from './custom.module.css';

export function ImageUploadCatalog(){
  const [image,setImage]=useState(''),[error,setError]=useState(''),[disabled,setDisabled]=useState(false),[active,setActive]=useState(true),[uploading,setUploading]=useState(false);
  const files=useLocalImages();
  const change=(next:string)=>{files.discard(image);setImage(next);setError('');};
  const upload=async(file:File)=>{setUploading(true);try{const result=await files.upload(file);if(result.success)change(result.data.image);else setError(result.errorMessage);}finally{setUploading(false);}};
  return <section className={s.section}><div className={s.sectionHeading}><h2>이미지 업로드와 멤버십 활성화</h2><p>파일 선택·변경·삭제와 실제 팬 멤버십 카드를 같은 데이터로 확인합니다. 선택한 파일은 브라우저 안에서만 사용됩니다.</p></div><div className={s.row}><label className={s.check}><input type="checkbox" checked={disabled} onChange={event=>setDisabled(event.target.checked)}/>비활성 상태</label></div><div className={s.controlGrid} style={{marginTop:20}}><div><ImageUpload label="멤버십 이미지" image={image} onFileSelect={upload} onRemove={()=>change('')} accept={imageUploadAccept} disabled={disabled} uploading={uploading} error={error} hint="JPG·PNG·WebP, 5MB 이하"/><div style={{marginTop:20}}><Toggle label="멤버십 활성화" description="켜면 공개와 신규 가입이 함께 허용됩니다." checked={active} onChange={setActive} disabled={disabled}/></div></div><div>{active?<MembershipPlanCard plan={{...plans[0],image:image||undefined}} disabled={disabled} onSelect={()=>{}}/>:<p className={s.muted}>비활성화한 멤버십은 팬의 공개 목록에서 숨겨집니다.</p>}</div></div></section>;
}
