'use client';
import {AdvertisingPage} from '@/components/crefans/studio/AdvertisingPage';
import {useAdvertisingModel} from '@/features/service/useAdvertisingModel';
export function AdvertisingContainer(){return <AdvertisingPage basePath="/service/studio" model={useAdvertisingModel()}/>;}
