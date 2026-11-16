import type {ShopPaymentWindow} from '@/types/crefans-shop';
/** 2026-11-16 AI 이용권 구독형: posts the server-built KG이니시스 card registration form in the same window. */
export function submitPaymentWindow(window:ShopPaymentWindow,doc:Document=document){
 if(new URL(window.action).protocol!=='https:')throw new Error('Invalid payment window');
 const form=doc.createElement('form');form.method='POST';form.action=window.action;form.hidden=true;
 for(const [name,value] of Object.entries(window.fields)){const input=doc.createElement('input');input.type='hidden';input.name=name;input.value=value;form.appendChild(input);}
 doc.body.appendChild(form);form.submit();return form;
}
