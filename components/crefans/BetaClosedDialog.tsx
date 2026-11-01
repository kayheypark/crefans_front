'use client';
import type {CSSProperties} from 'react';
import {Dialog} from '@/components/ui/Primitives';
import {designVariables} from '@/lib/design/tokens';
import {DialogActions} from '@/components/ui/DialogActions';
import {Action} from './ServiceUI';
import s from './account.module.css';

/** Shown on the closed beta host (2026-10-31). Closing the dialog is the same as moving to the main service.
 *  It carries the design variables itself because the live notice is mounted outside the service shell. */
export function BetaClosedDialog({open,onMain,onTry}:{open:boolean;onMain:()=>void;onTry:()=>void}){
  return <div style={designVariables as CSSProperties}><Dialog open={open} onClose={onMain} title="비공개 베타 서비스가 종료되었습니다">
    <div className={s.dialogBody}>
      <p>참여해 주셔서 감사합니다. 크레팬스 본 서비스에서 이어서 이용해 주세요.</p>
      <DialogActions><Action type="button" variant="secondary" onClick={onTry}>체험하기</Action><Action type="button" onClick={onMain}>본 서비스로 이동하기</Action></DialogActions>
    </div>
  </Dialog></div>;
}
