import Link from 'next/link';
import s from './brand.module.css';

/** Replace the brand asset here or supply a logo without changing page layouts. */
export function Brand({href,logoSrc,name='crefans',className='',inverse=false}:{href:string;logoSrc?:string;name?:string;className?:string;inverse?:boolean}){
  const asset=logoSrc||(inverse?'/brand/crefans-logo-inverse.svg':'/brand/crefans-logo.svg');
  return <Link href={href} className={`${s.brand} ${className}`} data-brand aria-label={`${name} 홈`}><img className={s.logo} src={asset} alt={name} width={844} height={150}/></Link>;
}
