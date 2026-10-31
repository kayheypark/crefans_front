'use client';
import {useEffect,useState} from 'react';
import {BetaClosedDialog} from '@/components/crefans/BetaClosedDialog';
import {closedBetaHost,mainServiceOrigin} from '@/lib/content/business';

/** Live service only: on the closed beta host every service page offers the main service or the sample (preview) explore page. */
export function BetaClosedNotice(){
  const [open,setOpen]=useState(false);
  useEffect(()=>{setOpen(location.hostname===closedBetaHost);},[]);
  return <BetaClosedDialog open={open} onMain={()=>location.assign(mainServiceOrigin+location.pathname+location.search)} onTry={()=>location.assign('/preview/explore')}/>;
}
