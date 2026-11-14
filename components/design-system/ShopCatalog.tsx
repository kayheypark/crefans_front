'use client';
import {useState} from 'react';
import {ShopPage} from '@/components/crefans/studio/ShopPage';
import {SelectField} from '@/components/ui/SelectField';
import type {ShopProduct} from '@/types/crefans-shop';
// Catalogue-only data; these prices never seed the live shop.
const sample:ShopProduct={id:'sample',name:'AI 사진 10회권',description:'원하는 순간에 한 장씩 만들어 보세요.',benefit:'AI 사진 10회 생성',amount:1000,validityLabel:'구매 후 30일',terms:'카탈로그 검증용 상품입니다. 실제 판매 가격이 아닙니다. 남은 횟수는 구매 단가로 비례 환불합니다.',termsVersion:'sample',onSale:true,version:1};
export function ShopCatalog(){const [state,setState]=useState('normal');return <section id="shop-catalog"><h2>AI 횟수권 상점</h2><SelectField label="상점 상태" value={state} onChange={setState} options={[{value:'normal',label:'정상'},{value:'empty',label:'빈 상품'},{value:'error',label:'조회 실패'},{value:'loading',label:'불러오는 중'},{value:'stopped',label:'판매 중지'}]}/><ShopPage basePath="/preview/studio" model={{products:state==='empty'?[]:[{...sample,onSale:state!=='stopped'}],orders:[],loading:state==='loading',error:state==='error'?'상품을 불러오지 못했어요.':'',refresh:async()=>{},purchase:async()=>({success:false,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 결제하지 않습니다.'}),refund:async()=>({success:false,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 환불하지 않습니다.'})}}/></section>;}
