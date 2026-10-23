'use client';
import type {ReactNode} from 'react';
import type {ApiResult} from '@/types/crefans';
import {Action,Empty} from './ServiceUI';

/** Unwrap API responses at the container boundary, never inside a content card. */
export function ApiState<T>({response,loading=false,onRetry,children}:{response:ApiResult<T>|null;loading?:boolean;onRetry?:()=>void;children:(data:T)=>ReactNode}){
  if(loading)return <p role="status" aria-live="polite">불러오고 있어요.</p>;
  if(!response)return <Empty title="표시할 데이터가 없어요"/>;
  if(!response.success)return <section role="alert"><Empty title="내용을 불러오지 못했어요" description={response.errorMessage} action={onRetry&&<Action variant="secondary" onClick={onRetry}>다시 시도</Action>}/>{response.errorCode&&<small>오류 코드: {response.errorCode}</small>}</section>;
  return <>{children(response.data)}</>;
}
