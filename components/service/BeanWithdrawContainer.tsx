'use client';
import {BeanWithdrawPage} from '@/components/crefans/BeanWithdrawPage';
import {useStudioFinanceModel} from '@/features/service/useStudioFinanceModel';
export function BeanWithdrawContainer({signedIn,basePath}:{signedIn:boolean;basePath:string}){const {finance,error,loading,refresh}=useStudioFinanceModel(signedIn);
 if(loading)return <p role="status">불러오는 중…</p>;
 if(!finance)return <div role="alert"><p>{error||'화면을 불러오지 못했습니다.'}</p><button onClick={()=>void refresh()}>다시 불러오기</button></div>;
 return <BeanWithdrawPage finance={finance} basePath={basePath}/>;}
