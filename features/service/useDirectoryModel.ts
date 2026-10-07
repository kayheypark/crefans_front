'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';
import type {Creator} from '@/types/crefans';
export function useDirectoryModel(enabled:boolean,onError:(message:string)=>void){
 const [filter,setFilter]=useState({query:'',category:'전체'}),[creators,setCreators]=useState<Creator[]>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(false),generation=useRef(0),pending=useRef(false);
 const search=useCallback((query:string,category:string)=>setFilter(previous=>previous.query===query&&previous.category===category?previous:{query,category}),[]);
 const path=useCallback((next?:string)=>`/creators?query=${encodeURIComponent(filter.query)}&category=${encodeURIComponent(filter.category)}${next?`&cursor=${encodeURIComponent(next)}`:''}`,[filter]);
 useEffect(()=>{if(!enabled)return;const token=++generation.current;setLoading(true);const timer=setTimeout(()=>{void api<{creators:Creator[];nextCursor:string|null}>(path()).then(result=>{if(token!==generation.current)return;if(result.success){setCreators(result.data.creators);setCursor(result.data.nextCursor);}else onError(result.errorMessage);setLoading(false);});},250);return()=>{clearTimeout(timer);generation.current++;};},[enabled,path,onError]);
 async function loadMore(){if(!cursor||pending.current)return;pending.current=true;setLoading(true);const token=generation.current;try{const result=await api<{creators:Creator[];nextCursor:string|null}>(path(cursor));if(token!==generation.current)return;if(result.success){setCreators(previous=>[...previous,...result.data.creators.filter(c=>!previous.some(old=>old.id===c.id))]);setCursor(result.data.nextCursor);}else onError(result.errorMessage);}finally{pending.current=false;if(token===generation.current)setLoading(false);}}
 return{creators,search,hasMore:!!cursor,loading,loadMore};
}
