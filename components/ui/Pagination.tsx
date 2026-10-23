'use client';
import s from './pagination.module.css';

export type PaginationProps={page:number;totalItems:number;pageSize:number;onPageChange:(page:number)=>void;label?:string};

function pageNumbers(page:number,total:number):(number|'ellipsis')[]{
  if(total<=7)return Array.from({length:total},(_,index)=>index+1);
  const start=page>=total-2?total-4:Math.max(2,page-1);
  const end=page<=3?5:Math.min(total-1,page+1);
  const items:(number|'ellipsis')[]=[1];
  if(start>2)items.push('ellipsis');
  for(let number=start;number<=end;number++)items.push(number);
  if(end<total-1)items.push('ellipsis');
  items.push(total);
  return items;
}

export function Pagination({page,totalItems,pageSize,onPageChange,label='페이지 이동'}:PaginationProps){
  const totalPages=Math.max(1,Math.ceil(totalItems/pageSize));
  const currentPage=Math.min(Math.max(1,page),totalPages);
  function changePage(next:number){if(next>=1&&next<=totalPages&&next!==currentPage)onPageChange(next);}
  return <nav className={s.pagination} aria-label={label}>
    <button type="button" className={s.direction} aria-label="이전 페이지" disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}>이전</button>
    {pageNumbers(currentPage,totalPages).map((number,index)=>number==='ellipsis'?<span key={`ellipsis-${index}`} className={s.ellipsis} aria-hidden="true">…</span>:<button type="button" key={number} aria-label={`${number}페이지`} aria-current={number===currentPage?'page':undefined} disabled={number===currentPage} onClick={()=>changePage(number)}>{number}</button>)}
    <button type="button" className={s.direction} aria-label="다음 페이지" disabled={currentPage===totalPages} onClick={()=>changePage(currentPage+1)}>다음</button>
  </nav>;
}
