'use client';
import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react';
import {Toast} from './Toast';
const SnackbarContext=createContext<((message:string)=>void)|null>(null);
/** One application-level message survives data refreshes without changing the page layout. */
export function SnackbarProvider({children,routeKey}:{children:ReactNode;routeKey:string}){
 const [notice,setNotice]=useState({message:'',id:0});
 const show=useCallback((message:string)=>setNotice(current=>({message,id:current.id+1})),[]);
 useEffect(()=>show(''),[routeKey,show]);
 return <SnackbarContext.Provider value={show}>{children}<Toast key={notice.id} message={notice.message} onClose={()=>setNotice(current=>current.id===notice.id?{...current,message:''}:current)}/></SnackbarContext.Provider>;
}
/** Standalone catalog/tests keep local feedback; application pages publish to the shared host. */
export function useSnackbarMessage():readonly[string,(message:string)=>void]{
 const show=useContext(SnackbarContext),[message,setMessage]=useState('');
 return [show?'':message,show||setMessage];
}
