'use client';
import {useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import Icon from './Icon';
import {Action} from './ServiceUI';

/** The one follow toggle for explore cards, the creator profile, the following list and the design-system catalog. Unfollowing asks first. */
export function FollowButton({following,name,onToggle,disabled=false}:{following:boolean;name:string;onToggle:()=>void;disabled?:boolean}){
  const [confirming,setConfirming]=useState(false);
  return <>
    <Action variant={following?'primary':'secondary'} aria-pressed={following} disabled={disabled} onClick={()=>{if(following)setConfirming(true);else onToggle();}}><Icon name={following?'check':'plus'} width="16" height="16"/>{following?'팔로우 하는중':'팔로우'}</Action>
    <Dialog open={confirming} onClose={()=>setConfirming(false)} title="팔로우를 해제할까요?">
      <p>{name}님의 새 소식이 홈 피드에 더 이상 표시되지 않아요.</p>
      <DialogActions style={{marginTop:22}}><Action variant="secondary" onClick={()=>setConfirming(false)}>취소</Action><Action variant="danger" onClick={()=>{setConfirming(false);onToggle();}}>팔로우 해제</Action></DialogActions>
    </Dialog>
  </>;
}
