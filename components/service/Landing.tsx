'use client';
import {useState} from 'react';
import LandingPage from '@/components/crefans/LandingPage';
import {landingAssetContent} from '@/lib/content/landing';
import {useService} from './ServiceProvider';

// Set false to display database-backed creator cards. Shared introduction assets stay visible.
const useAssets=process.env.NEXT_PUBLIC_LANDING_USE_ASSETS!=='false';
export default function Landing(){
 const {model}=useService(),[following,setFollowing]=useState<string[]>([]);
 const content=useAssets?landingAssetContent:{...landingAssetContent,creators:model.data.creators.filter(c=>c.promoted).slice(0,5),collage:model.data.creators.filter(c=>c.image).slice(0,4)};
 const landingModel=useAssets?{...model,following,toggleFollow:(id:string)=>setFollowing(previous=>previous.includes(id)?previous.filter(value=>value!==id):[...previous,id])}:model;
 return <LandingPage model={landingModel} content={content} creatorBasePath={useAssets?'/preview':model.basePath}/>;
}
