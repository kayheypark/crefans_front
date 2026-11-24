import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import s from './photo-library.module.css';

export function LibraryVideoStatus({label}:{label:string}){
 return <div className={s.frameStatus} role="status">
  <span className={s.statusPill}><span aria-hidden="true"><LoadingSpinner inline/></span>{label}</span>
 </div>;
}
