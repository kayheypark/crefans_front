'use client';
import {useReportBrowserError} from '@/features/service/useBrowserErrors';
export default function ServiceError({error,reset}:{error:Error;reset:()=>void}){
 useReportBrowserError(error);
 return <section role="alert" style={{padding:24}}><h2>화면을 불러오지 못했습니다.</h2><button onClick={reset}>다시 시도</button></section>;
}
