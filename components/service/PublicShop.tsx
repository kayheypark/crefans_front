'use client';
import {useState} from 'react';
import {ShopPage} from '@/components/crefans/studio/ShopPage';
import {SignInPrompt} from '@/components/crefans/SignInPrompt';
import {Dialog} from '@/components/ui/Primitives';
import {usePublicShopModel} from '@/features/service/usePublicShopModel';
// 2026-11-17 user decision: signed-out visitors browse the shop; choosing a product opens the sign-in prompt (back to this page after).
export function PublicShop(){
 const [ask,setAsk]=useState(false);
 return <><ShopPage model={usePublicShopModel()} basePath="/service/studio" onGuest={()=>setAsk(true)}/>
  <Dialog open={ask} onClose={()=>setAsk(false)} title="로그인하고 구매하기"><SignInPrompt basePath="/service" variant="dialog" hideTitle description="이용권은 로그인한 뒤 구매할 수 있어요." onNavigate={()=>setAsk(false)}/></Dialog></>;
}
