'use client';
import type {ReactNode} from 'react';
import type {ApiResult} from '@/types/crefans';
import {Action,Empty} from './ServiceUI';
import {DelayedSpinner} from '@/components/ui/DelayedSpinner';

/** Unwrap API responses at the container boundary, never inside a content card. */
export function ApiState<T>({response,loading=false,onRetry,children}:{response:ApiResult<T>|null;loading?:boolean;onRetry?:()=>void;children:(data:T)=>ReactNode}){
  // Loading rule: until a response arrives nothing shows for 1s, then the shared spinner; never an empty message before the response.
  if(loading||!response)return <DelayedSpinner/>;
  if(!response.success)return <section role="alert"><Empty title="내용을 불러오지 못했어요" description={response.errorMessage} action={onRetry&&<Action variant="secondary" onClick={onRetry}>다시 시도</Action>}/>{response.errorCode&&<small>오류 코드: {response.errorCode}</small>}</section>;
  return <>{children(response.data)}</>;
}
