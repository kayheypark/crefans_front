import {businessInfo} from '@/lib/content/business';
import s from './business-info.module.css';

// 공정위 통신판매사업자 정보 조회(연동 가이드 https://www.ftc.go.kr/site/www/253_1.html): 사업자등록번호 10자리, 하이픈 없이.
// 2026-11-06 확인: 이 번호로 '통신판매 사업자정보 조회' 화면이 열리고, 정보는 공정위 보안문자 입력 뒤 표시된다.
const ftcBusinessUrl=(registrationNumber:string)=>`https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${registrationNumber.replace(/\D/g,'')}`;

/** Operator details for the PC sidebar and the mobile settings page footer. */
export function BusinessInfo({className}:{className?:string}){
  const {name,representative,registrationNumber,address,email,phone,mailOrderNumber}=businessInfo;
  return <address className={`${s.info} ${className||''}`} aria-label="사업자 정보">
    <strong>{name}</strong>
    <span>대표 {representative}</span>
    <span>사업자등록번호 <span className={s.keep}>{registrationNumber}</span></span>
    {mailOrderNumber&&<span>통신판매업 신고번호 <span className={s.keep}>{mailOrderNumber}</span> <a href={ftcBusinessUrl(registrationNumber)} target="_blank" rel="noopener noreferrer" className={s.keep}>사업자정보 확인</a></span>}
    <span>{address}</span>
    <span>고객지원 <a href={`mailto:${email}`}>{email}</a></span>
    <span>전화 <a className={s.keep} href={`tel:${phone.replaceAll('-','')}`}>{phone}</a></span>
    <small>© {new Date().getFullYear()} CREFANS</small>
  </address>;
}
