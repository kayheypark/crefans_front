'use client';
import {useBeans} from '@/components/crefans/BeanContext';
import {EventDetailPage} from '@/components/crefans/EventPages';
import {usePromotionClaim} from '@/features/events/usePromotionClaim';
import type {ServiceEvent} from '@/types/crefans-events';

/** Both routes inject their own BeanContext; the preview never calls the service API. */
export function PromotionEventDetail({event,basePath}:{event:ServiceEvent|undefined;basePath:string}){
 const beans=useBeans();
 const claim=usePromotionClaim(beans?.signedIn===true,beans?.getPromotionClaim,beans?.claimPromotion);
 return <EventDetailPage event={event} basePath={basePath} claim={claim}/>;
}
