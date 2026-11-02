'use client';
import {EventDetailPage} from '@/components/crefans/EventPages';
import {useFoundingBadge} from '@/features/events/useFoundingBadge';
import type {FoundingBadgeActions,ServiceEvent} from '@/types/crefans-events';

export function FoundingBadgeEventDetail({event,basePath,signedIn,actions}:{event:ServiceEvent|undefined;basePath:string;signedIn:boolean;actions?:FoundingBadgeActions}){
 const badge=useFoundingBadge(signedIn,actions);
 return <EventDetailPage event={event} basePath={basePath} badge={badge}/>;
}
