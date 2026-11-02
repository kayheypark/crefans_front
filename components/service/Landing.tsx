'use client';
import LandingPage from '@/components/crefans/LandingPage';
import {landingAssetContent} from '@/lib/content/landing';
import {useService} from './ServiceProvider';

// Set false to display database-backed creator cards. Shared introduction assets stay visible.
const useAssets=process.env.NEXT_PUBLIC_LANDING_USE_ASSETS!=='false';
export default function Landing(){
 const {model}=useService();
 const content=useAssets?landingAssetContent:{...landingAssetContent,creatorDisclosure:undefined,creators:model.data.creators.filter(c=>c.promoted).slice(0,5),collage:model.data.creators.filter(c=>c.image).slice(0,4)};
 return <LandingPage model={model} content={content} creatorBasePath={useAssets?'/preview':model.basePath}/>;
}
