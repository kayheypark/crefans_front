'use client';
import {ShopPage} from '@/components/crefans/studio/ShopPage';
import {useShopModel} from '@/features/service/useShopModel';
export function ShopContainer(){return <ShopPage model={useShopModel()} basePath="/service/studio"/>;}
