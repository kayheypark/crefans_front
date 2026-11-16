'use client';
import {ShopPage} from '@/components/crefans/studio/ShopPage';
import {useShopModel} from '@/features/service/useShopModel';
import {useAdvertisingModel} from '@/features/service/useAdvertisingModel';
// 2026-11-16 user decision: AI passes and ad products share one shop page.
export function ShopContainer({initialCategory='ai'}:{initialCategory?:'ai'|'ads'}){return <ShopPage model={useShopModel()} advertising={useAdvertisingModel()} initialCategory={initialCategory} basePath="/service/studio"/>;}
