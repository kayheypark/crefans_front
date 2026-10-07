'use client';
import LandingPage from '@/components/crefans/LandingPage';
import {usePreview} from './service/PreviewProvider';
import {landingContent} from './landing-data';
export default function LandingPreview(){const model=usePreview();return <LandingPage model={model} content={landingContent}/>;}
