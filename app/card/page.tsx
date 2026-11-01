import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import BusinessCard from '@/components/business-card/BusinessCard';

export const metadata:Metadata={title:'박경호 대표 | 크레팬스',description:'크레팬스 박경호 대표의 명함입니다.',robots:{index:false,follow:false}};
export default async function Page(props:{searchParams:Promise<{who?:string|string[]}>}){
 const searchParams=await props.searchParams;
 if(searchParams.who!=='khpark')notFound();
 return <BusinessCard/>;
}
