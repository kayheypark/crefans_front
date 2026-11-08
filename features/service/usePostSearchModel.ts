'use client';
// Explore post search (2026-11-08): `/posts/search` with the same visibility as the feed. Authors are merged into the
// shared creators list (like the feed) so post cards, follow state and plan labels keep working.
import {useCallback,useEffect,useRef,useState} from 'react';
import {platformRequest as api} from '@/lib/api/platform';
import type {Creator,Post} from '@/types/crefans';

type Page={posts:Post[];creators:Creator[];nextCursor:string|null};
export function usePostSearchModel(enabled:boolean,onCreators:(creators:Creator[])=>void,onError:(message:string)=>void){
 const [query,setQuery]=useState(''),[posts,setPosts]=useState<Post[]>([]),[cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(false),[searched,setSearched]=useState('');
 const generation=useRef(0),pending=useRef(false);
 const search=useCallback((next:string)=>setQuery(previous=>previous===next?previous:next),[]);
 useEffect(()=>{
  const token=++generation.current;if(!enabled||!query){setPosts([]);setCursor(null);setSearched('');setLoading(false);return;}
  setLoading(true);
  const timer=setTimeout(()=>{void api<Page>(`/posts/search?query=${encodeURIComponent(query)}`).then(result=>{if(token!==generation.current)return;
   if(result.success){onCreators(result.data.creators);setPosts(result.data.posts);setCursor(result.data.nextCursor);setSearched(query);}else onError(result.errorMessage);setLoading(false);});},250);
  return()=>clearTimeout(timer);
 },[enabled,query,onCreators,onError]);
 async function loadMore(){if(!cursor||pending.current)return;pending.current=true;setLoading(true);const token=generation.current;
  try{const result=await api<Page>(`/posts/search?query=${encodeURIComponent(query)}&cursor=${encodeURIComponent(cursor)}`);if(token!==generation.current)return;
   if(result.success){onCreators(result.data.creators);setPosts(previous=>[...previous,...result.data.posts.filter(p=>!previous.some(old=>old.id===p.id))]);setCursor(result.data.nextCursor);}else onError(result.errorMessage);}
  finally{pending.current=false;if(token===generation.current)setLoading(false);}}
 return{query:searched,posts,search,hasMore:!!cursor,loading,loadMore};
}
