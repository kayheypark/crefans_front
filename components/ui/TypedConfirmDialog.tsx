'use client';
import {useRef,useState,type ReactNode} from 'react';
import {Button,Dialog,Field} from '@/components/ui/Primitives';
import {DialogActions} from './DialogActions';
import s from './typed-confirm-dialog.module.css';

type Props={title:string;phrase:string;actionLabel:string;busyLabel?:string;busy?:boolean;error?:string;onCancel:()=>void;onConfirm:(typed:string)=>void|Promise<void>;children?:ReactNode};

// Match the console's exact-phrase confirmation. Mount only while open; changing
// the target phrase resets the input. The API must validate the received phrase too.
export function TypedConfirmDialog(props:Props){return <Confirmation key={props.phrase} {...props}/>;}
function Confirmation({title,phrase,actionLabel,busyLabel='처리 중…',busy=false,error,onCancel,onConfirm,children}:Props){
 const [typed,setTyped]=useState(''),[pending,setPending]=useState(false),inFlight=useRef(false);
 const blocked=busy||pending,matched=phrase.length>0&&typed===phrase;
 function cancel(){if(!blocked&&!inFlight.current)onCancel();}
 async function confirm(){
  if(!matched||blocked||inFlight.current)return;
  inFlight.current=true;setPending(true);
  try{await onConfirm(typed);}finally{inFlight.current=false;setPending(false);}
 }
 return <Dialog open title={title} onClose={cancel}><div className={s.body}>
  {children}
  <p className={s.prompt}>계속하려면 아래 문구를 그대로 입력하세요.<strong>{phrase}</strong></p>
  <Field label="확인 문구" value={typed} onChange={event=>setTyped(event.target.value)} disabled={blocked} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} hint="띄어쓰기까지 정확히 같아야 버튼이 켜집니다."/>
  {error&&<p className={s.error} role="alert">{error}</p>}
  <DialogActions><Button type="button" tone="secondary" disabled={blocked} onClick={cancel}>취소</Button><Button type="button" tone="danger" disabled={blocked||!matched} onClick={confirm}>{blocked?busyLabel:actionLabel}</Button></DialogActions>
 </div></Dialog>;
}
