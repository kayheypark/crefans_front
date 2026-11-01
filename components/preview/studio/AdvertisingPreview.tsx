'use client';
import {useState} from 'react';
import type {AdProduct,AdPurchase} from '@/types/crefans-advertising';
import {AdvertisingPage} from '@/components/crefans/studio/AdvertisingPage';
const products:AdProduct[]=[7,30,90].map((days,index)=>({id:'ad-demo-'+days,name:`주목할 크리에이터 ${days}일`,description:'탐색 페이지의 주목할 크리에이터 영역에서 프로필을 소개합니다.',terms:'목업 구매 체험입니다. 실제 결제와 광고 노출은 발생하지 않습니다. 금액과 이용 조건은 실제 상품과 다를 수 있습니다.',placement:'featured_creator',amount:[11000,33000,88000][index],durationDays:days,visible:true,onSale:index!==2,sortOrder:index,version:1}));
export type AdvertisingPreviewState='normal'|'empty'|'loading'|'error'|'disabled';
export function AdvertisingPreview({state='normal'}:{state?:AdvertisingPreviewState}){const [orders,setOrders]=useState<AdPurchase[]>([]);return <AdvertisingPage basePath="/preview/studio" model={{products:state==='empty'?[]:products,orders,loading:state==='loading',error:state==='error'?'광고상품을 불러오지 못했습니다.':'',purchaseReady:state!=='disabled',guidance:'예시 상품과 가격입니다. 구매 흐름만 체험하며 실제 결제하지 않습니다.',refresh:async()=>{},purchase:async product=>{const order:AdPurchase={id:crypto.randomUUID(),name:product.name,amount:product.amount,durationDays:product.durationDays,status:'paid',createdAt:new Date().toISOString()};setOrders(previous=>[order,...previous]);return{success:true,data:order,errorCode:null,errorMessage:null};}}}/>;}
