import {MediaTypeIcon} from '@/components/ui/MediaTypeIcon';
import s from './social.module.css';

/** Shared photo/video counts for post galleries and profile thumbnails. */
export function MediaSummary({media,className=''}:{media:{type:'image'|'video'}[];className?:string}){
  const images=media.filter(item=>item.type==='image').length,videos=media.filter(item=>item.type==='video').length;
  return <span className={`${s.mediaSummary} ${className}`} aria-label={`사진 ${images}장, 동영상 ${videos}개`}>{images>0&&<span><MediaTypeIcon type="image" size={13}/>{images}</span>}{videos>0&&<span><MediaTypeIcon type="video" size={13}/>{videos}</span>}</span>;
}
