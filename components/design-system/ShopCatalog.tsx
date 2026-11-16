'use client';
import {useState} from 'react';
import {ShopPage} from '@/components/crefans/studio/ShopPage';
import {SelectField} from '@/components/ui/SelectField';
import type {ShopProduct} from '@/types/crefans-shop';
import type {AdvertisingModel} from '@/types/crefans-advertising';
import type {BankTransfer} from '@/types/crefans-payments';
import {BankTransferFields,BankTransferInstructions,PaymentPreparing,RefundAccountFields} from '@/components/crefans/BankTransfer';
import {emptyBankTransferForm,emptyRefundAccount} from '@/lib/crefans/bank-transfer';
// Catalogue-only data; these prices never seed the live shop.
const sample:ShopProduct={id:'sample',name:'AI 사진 10회권',description:'원하는 순간에 한 장씩 만들어 보세요.',benefit:'AI 사진 10회 생성',amount:1000,validityLabel:'구매 후 30일',terms:'카탈로그 검증용 상품입니다. 실제 판매 가격이 아닙니다. 남은 횟수는 구매 단가로 비례 환불합니다.',termsVersion:'sample',onSale:true,version:1};
// Catalogue-only ad product so the shop shows both categories (2026-11-16 one-page shop). Not a live price.
const sampleAds:AdvertisingModel={products:[{id:'ad-sample',name:'주목할 크리에이터 7일',description:'탐색 화면 주목할 크리에이터 영역 노출',terms:'카탈로그 검증용 상품입니다.',placement:'featured_creator',amount:11000,durationDays:7,visible:true,onSale:true,sortOrder:0,version:1}],orders:[],loading:false,error:'',purchaseReady:false,refresh:async()=>{},purchase:async()=>({success:false,data:null,errorMessage:'카탈로그에서는 구매할 수 없어요.',errorCode:'CATALOG_ONLY'}),activate:async()=>({success:false,data:null,errorMessage:'카탈로그에서는 사용할 수 없어요.',errorCode:'CATALOG_ONLY'})};
export function ShopCatalog(){const [state,setState]=useState('normal');return <section id="shop-catalog"><h2>AI 이용권 상점</h2><SelectField label="상점 상태" value={state} onChange={setState} options={[{value:'normal',label:'정상'},{value:'empty',label:'빈 상품'},{value:'error',label:'조회 실패'},{value:'loading',label:'불러오는 중'},{value:'stopped',label:'판매 중지'},{value:'preparing',label:'결제 준비 중'}]}/><ShopPage basePath="/preview/studio" advertising={sampleAds} model={{products:state==='empty'?[]:[{...sample,onSale:state!=='stopped'}],orders:[],paymentMethods:{bankTransfer:state!=='preparing',card:false,deadlineHours:24,refundBusinessDays:3},loading:state==='loading',error:state==='error'?'상품을 불러오지 못했어요.':'',refresh:async()=>{},purchase:async()=>({success:false,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 결제하지 않습니다.'}),refund:async()=>({success:false,data:null,errorCode:'PREVIEW',errorMessage:'카탈로그에서는 환불하지 않습니다.'})}}/><BankTransferCatalog/></section>;}
// 2026-11-16 무통장입금 공용 표시: 주문 입력·입금 안내(상태별)·환불 계좌·결제 준비 중. Sample account is catalogue data only.
const sampleTransfer:BankTransfer={id:'bt-sample',kind:'bean',orderId:'sample',amount:11000,status:'awaiting',statusLabel:'입금 대기',depositorName:'홍길동',account:{bankName:'예시은행',accountNumber:'000-0000-0000-00',holder:'크레팬스(예시)'},expiresAt:'2026-11-17T06:00:00.000Z',confirmedAt:null,cashReceipt:{type:'income',issued:false}};
const transferLabels={awaiting:'입금 대기',confirmed:'입금 확인',expired:'입금 기한 만료',cancelled:'주문 취소'} as const;
function BankTransferCatalog(){
 const [state,setState]=useState<'form'|'receipt'|keyof typeof transferLabels|'refund'|'preparing'>('form'),[form,setForm]=useState(emptyBankTransferForm),[account,setAccount]=useState(emptyRefundAccount);
 return <section id="bank-transfer-catalog"><h3>무통장입금</h3><SelectField label="무통장입금 상태" value={state} onChange={value=>{setState(value as typeof state);setForm(value==='receipt'?{depositorName:'홍길동',cashReceipt:true,receiptType:'expense',receiptNumber:'12345'}:emptyBankTransferForm);}} options={[{value:'form',label:'주문 입력'},{value:'receipt',label:'현금영수증 번호 오류'},{value:'awaiting',label:'입금 대기'},{value:'confirmed',label:'입금 확인'},{value:'expired',label:'입금 기한 만료'},{value:'cancelled',label:'주문 취소'},{value:'refund',label:'환불 계좌 입력'},{value:'preparing',label:'결제 준비 중'}]}/>
  <div style={{marginTop:16,maxWidth:480}}>{state==='form'||state==='receipt'?<BankTransferFields value={form} onChange={setForm}/>:state==='refund'?<RefundAccountFields value={account} onChange={setAccount}/>:state==='preparing'?<PaymentPreparing/>:<BankTransferInstructions transfer={{...sampleTransfer,status:state,statusLabel:transferLabels[state],confirmedAt:state==='confirmed'?'2026-11-16T09:00:00.000Z':null}}/>}</div></section>;
}
