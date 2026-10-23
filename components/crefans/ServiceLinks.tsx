import Link from 'next/link';

const links=[{path:'landing',label:'서비스 소개'},{path:'support',label:'고객센터'},{path:'notices',label:'공지사항'},{path:'studio',label:'크리에이터 스튜디오 ↗'}];

/** Shared destinations for the sidebar and the empty home feed footer. */
export function ServiceLinks({basePath}:{basePath:string}){
  return <>{links.map(({path,label})=><Link key={path} href={`${basePath}/${path}`}>{label}</Link>)}</>;
}
