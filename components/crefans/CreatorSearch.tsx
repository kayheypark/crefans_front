'use client';
import Link from 'next/link';
import Icon from './Icon';
import s from './creator-search.module.css';

type Props=({href:string}|{value:string;onChange:(value:string)=>void;disabled?:boolean;readOnly?:boolean})&{label?:string;placeholder?:string;maxLength?:number};
const placeholder='크리에이터, 태그, 키워드로 검색해보세요';

export function CreatorSearch(props:Props){
 const label=props.label||'크리에이터 검색',hint=props.placeholder||placeholder;
 const icon=<Icon name="search" width={20} height={20}/>;
 if('href' in props)return <Link className={s.search} href={props.href} aria-label={label}>{icon}<span>{hint}</span></Link>;
 return <label className={s.search} data-disabled={props.disabled||undefined}>{icon}<input type="search" maxLength={props.maxLength} aria-label={label} placeholder={hint} value={props.value} onChange={event=>props.onChange(event.target.value)} disabled={props.disabled} readOnly={props.readOnly}/></label>;
}
