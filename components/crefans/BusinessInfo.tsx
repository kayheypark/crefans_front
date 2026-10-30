import {businessInfo} from '@/lib/content/business';
import s from './business-info.module.css';

/** Operator details for the PC sidebar and the mobile settings page footer. */
export function BusinessInfo({className}:{className?:string}){
  const {name,representative,registrationNumber,address,email,phone}=businessInfo;
  return <address className={`${s.info} ${className||''}`} aria-label="사업자 정보">
    <strong>{name}</strong>
    <span>대표 {representative}</span>
    <span>사업자등록번호 <span className={s.keep}>{registrationNumber}</span></span>
    <span>{address}</span>
    <span>고객지원 <a href={`mailto:${email}`}>{email}</a></span>
    <span>전화 <a className={s.keep} href={`tel:${phone.replaceAll('-','')}`}>{phone}</a></span>
    <small>© {new Date().getFullYear()} CREFANS</small>
  </address>;
}
