'use client';
import {useState} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Action} from './ServiceUI';
/** 2026-11-16 user decision (카드 진입점 전부): card payment and card registration buttons stay enabled and open this notice instead of the PG or server. Set to false when card payments reopen. */
export const CARD_MAINTENANCE=true;
export function CardMaintenanceDialog({open,onClose}:{open:boolean;onClose:()=>void}){
 return <Dialog open={open} onClose={onClose} title="점검 중입니다"><p>카드 결제 점검 중입니다. 잠시 후 다시 이용해 주세요.</p><DialogActions><Action onClick={onClose}>확인</Action></DialogActions></Dialog>;
}
export function useCardMaintenance(){const [open,setOpen]=useState(false);return{show:()=>setOpen(true),dialog:<CardMaintenanceDialog open={open} onClose={()=>setOpen(false)}/>};}
