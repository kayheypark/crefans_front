'use client';
import {useState} from 'react';
import type {AdProduct,AdPurchase,AdvertisingModel} from '@/types/crefans-advertising';
import {Action,Empty,PageTitle} from '../ServiceUI';
import Icon from '../Icon';
import {BackButton} from '../BackButton';
import {Dialog,Chip} from '@/components/ui/Primitives';
import {DialogActions} from '@/components/ui/DialogActions';
import {Toast} from '@/components/ui/Toast';
import {useSnackbarMessage} from '@/components/ui/SnackbarProvider';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';
import {useDelayedLoading} from '@/components/ui/useDelayedLoading';
import s from './advertising.module.css';
const adDate=(value:string)=>new Date(value).toLocaleString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
const won=(n:number)=>n.toLocaleString('ko-KR')+'원';
function productTitle(product:Pick<AdProduct,'name'|'durationDays'>){
 const doubled=/기간\s*2배/.test(product.name)&&product.durationDays>0&&product.durationDays%2===0;
 return doubled?`주목할 크리에이터(${product.durationDays/2}일+${product.durationDays/2}일)`:product.name;
}
function isDiscounted(product:AdProduct){
 const comparison=product.comparisonAmount??0;
 return Number.isSafeInteger(comparison)&&comparison>product.amount&&Boolean(product.comparisonBasis?.trim());
}
function ProductPrice({product}:{product:AdProduct}){
 const comparison=product.comparisonAmount??0;
 const discounted=isDiscounted(product);
 return <div className={s.price}>{discounted&&<div className={s.comparisonPrice}><s aria-label={`동일 기간 비교가격 ${won(comparison)}`}>{won(comparison)}</s><span className={s.discountRate}>{Math.floor((comparison-product.amount)*100/comparison)}%</span></div>}<div className={s.salePrice}><strong>{won(product.amount)}</strong></div><small>VAT 포함</small></div>;
}
export function AdvertisingPage({model,basePath}:{model:AdvertisingModel;basePath:string}){
 const [tab,setTab]=useState<'products'|'orders'>('products'),[selected,setSelected]=useState<AdProduct|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useSnackbarMessage();
 // Loading rule: products/orders and the error stay until the response; a spinner only after 1s (over the list, or where it goes).
 const slow=useDelayedLoading(model.loading);
 const [useOrder,setUseOrder]=useState<AdPurchase|null>(null),[using,setUsing]=useState(false),[useError,setUseError]=useState('');
 async function activate(){if(!useOrder||using)return;setUsing(true);setUseError('');try{const result=await model.activate(useOrder);if(result.success){setUseOrder(null);setNotice('광고 사용을 시작했습니다.');}else setUseError(result.errorMessage);}catch{setUseError('사용 결과를 확인하지 못했습니다. 다시 확인해주세요.');}finally{setUsing(false);}}
 const specialProducts=model.products.filter(isDiscounted);
 const sections=[...(specialProducts.length?[{id:'special',title:'특가',products:specialProducts}]:[]),{id:'all',title:'전체보기',products:model.products}];
 async function purchase(){if(!selected||busy)return;setBusy(true);setError('');try{const result=await model.purchase(selected);if(!result.success)setError(result.errorMessage);else{setSelected(null);setTab('orders');setNotice('광고상품 구매를 완료했습니다.');}}catch{setError('구매 결과를 확인하지 못했습니다. 다시 확인해주세요.');}finally{setBusy(false);}}
 return <section className={s.page}><PageTitle back={<BackButton href={basePath} label="대시보드로 돌아가기"/>}>광고상품</PageTitle><p className={s.intro}>주목할 크리에이터 영역에서 내 프로필을 소개해 보세요.</p><div className={s.tabs} role="group" aria-label="광고상품 화면"><Chip selected={tab==='products'} onClick={()=>setTab('products')}>광고상품</Chip><Chip selected={tab==='orders'} onClick={()=>setTab('orders')}>구매 내역</Chip></div>{model.guidance&&<p className={s.guidance}>{model.guidance}</p>}
 {model.error?<div role="alert"><p>{model.error}</p><Action variant="secondary" disabled={model.loading} onClick={()=>void model.refresh()}>다시 불러오기</Action>{slow&&<LoadingSpinner inline/>}</div>:model.loading&&!(tab==='products'?model.products.length:model.orders.length)?(slow&&<LoadingSpinner/>):tab==='products'?<>{model.products.length?<div className={s.sections}>{slow&&<LoadingSpinner overlay/>}{sections.map(section=><section key={section.id} aria-label={section.title}><div className={s.sectionHeading}><h2>{section.id==='special'&&<img src="/brand/featured-creators-v1.png" width={22} height={22} alt=""/>}{section.title}</h2></div><div className={s.grid}>{section.products.map(product=><article key={product.id} className={s.card}><div className={s.productRow}><img className={s.productIcon} src="/brand/featured-creators-v1.png" width={36} height={36} alt=""/><div className={s.productInfo}><h3>{isDiscounted(product)&&<span className={s.specialPrice}>특가</span>}{productTitle(product)}</h3><span className={s.duration}>총 {product.durationDays}일 노출</span>{!product.onSale&&<span className={s.duration}>판매 중지</span>}</div><ProductPrice product={product}/><button type="button" className={s.productOpen} aria-label={product.onSale?`${productTitle(product)} 상품 안내`:'판매 중지'} disabled={!product.onSale} onClick={()=>{setSelected(product);setError('');}}><Icon name="chevron" width={18} height={18} aria-hidden="true"/></button></div></article>)}</div></section>)}</div>:<Empty title="판매 중인 광고상품이 없습니다." description="새로운 상품이 준비되면 이곳에서 확인할 수 있어요."/>}</>:model.orders.length?<div className={s.orders}>{slow&&<LoadingSpinner overlay/>}<p className={s.orderGuide}>구매한 광고는 ‘사용’을 누르면 시작됩니다.</p>{model.orders.map(order=><article key={order.id} className={s.orderCard}><div className={s.orderTop}><div><span className={s.orderStatus} data-state={order.status==='paid'?order.useStatus:order.status}>{order.status==='processing'?'결제 확인 중':order.status==='failed'?'결제 실패':order.useStatus==='active'?'사용 중':order.useStatus==='completed'?'사용 완료':'사용 전'}</span><h3>{productTitle(order)}</h3><small>구매일 {adDate(order.createdAt)}</small></div><strong>{won(order.amount)}</strong></div><div className={s.orderBottom}><div><span>이용기간 {order.durationDays}일</span>{order.startsAt&&order.endsAt?<small>{adDate(order.startsAt)} ~ {adDate(order.endsAt)}</small>:order.status==='paid'?<small>사용을 시작한 시점부터 적용됩니다.</small>:null}{order.blockedUntil&&order.useStatus==='ready'&&<small>현재 광고가 끝나는 {adDate(order.blockedUntil)} 이후 사용할 수 있어요.</small>}</div>{order.status==='paid'&&order.useStatus==='ready'&&<Action disabled={!!order.blockedUntil||using} onClick={()=>{setUseOrder(order);setUseError('');}}>사용</Action>}</div></article>)}</div>:<Empty title="광고상품 구매 내역이 없습니다."/>}
 <Dialog open={!!useOrder} title="광고를 사용하시겠어요?" onClose={()=>{if(!using)setUseOrder(null);}}>{useOrder&&<div className={s.detail}><h3>{productTitle(useOrder)}</h3><p>지금 시작하면 {useOrder.durationDays}일 동안 주목할 크리에이터에 노출됩니다. 이용기간은 사용 시작이 확정된 시점부터 계산됩니다.</p><p>다른 광고상품은 현재 광고가 끝난 뒤 사용할 수 있어요.</p>{useError&&<p role="alert" className={s.error}>{useError}</p>}<DialogActions><Action variant="secondary" disabled={using} onClick={()=>setUseOrder(null)}>취소</Action><Action disabled={using} onClick={()=>void activate()}>{using?'시작 중…':'사용 시작'}</Action></DialogActions></div>}</Dialog>
 <Dialog open={!!selected} title="광고상품 구매 안내" onClose={()=>{if(!busy)setSelected(null);}}>{selected&&<div className={s.detail}><h3>{productTitle(selected)}</h3><p>{selected.description}</p><dl><div><dt>노출 위치</dt><dd>탐색 · 주목할 크리에이터</dd></div><div><dt>노출기간</dt><dd>{selected.durationDays}일</dd></div><div><dt>결제금액</dt><dd><ProductPrice product={selected}/></dd></div></dl>{selected.comparisonAmount!=null&&selected.comparisonBasis&&<p className={s.comparisonBasis}>{selected.comparisonBasis}</p>}<p>구매 후 구매 내역에서 ‘사용’을 누르면 광고가 시작됩니다.</p><h3>구매·취소 안내</h3><p className={s.terms}>{selected.terms}</p>{!model.purchaseReady&&<p>현재 구매 기능을 준비 중입니다. 상품 안내를 먼저 확인해 주세요.</p>}{error&&<p role="alert" className={s.error}>{error}</p>}<DialogActions><Action variant="secondary" disabled={busy} onClick={()=>setSelected(null)}>닫기</Action><Action disabled={busy||!model.purchaseReady||!selected.onSale} onClick={()=>void purchase()}>{busy?'처리 중…':'구매하기'}</Action></DialogActions></div>}</Dialog><Toast message={notice} onClose={()=>setNotice('')}/></section>;
}
