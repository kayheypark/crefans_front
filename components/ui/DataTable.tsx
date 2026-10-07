'use client';
import type {ReactNode} from 'react';
import s from './data-table.module.css';

export type TableSort={key:string;direction:'asc'|'desc'}|null;
export type TableColumn<T>={key:string;label:string;render:(row:T)=>ReactNode;sortValue?:(row:T)=>string|number|null};
export type DataTableProps<T>={
  rows:T[];
  columns:TableColumn<T>[];
  rowKey:(row:T)=>string;
  sort:TableSort;
  onSortChange:(sort:TableSort)=>void;
  caption:string;
  loading?:boolean;
  emptyMessage?:string;
  page?:number;
  pageSize?:number;
};

export function DataTable<T>({rows,columns,rowKey,sort,onSortChange,caption,loading=false,emptyMessage='표시할 데이터가 없어요.',page,pageSize}:DataTableProps<T>){
  const ordered=rows.map((row,index)=>({row,index}));
  const sortValue=columns.find(column=>column.key===sort?.key)?.sortValue;
  if(sort&&sortValue){
    ordered.sort((a,b)=>{
      const left=sortValue(a.row),right=sortValue(b.row);
      if(left===null||right===null)return left===right?a.index-b.index:left===null?1:-1;
      const comparison=typeof left==='number'&&typeof right==='number'?left-right:String(left).localeCompare(String(right),'ko',{numeric:true,sensitivity:'base'});
      return comparison===0?a.index-b.index:comparison*(sort.direction==='asc'?1:-1);
    });
  }
  const currentPage=page!==undefined&&pageSize!==undefined?Math.min(Math.max(1,page),Math.max(1,Math.ceil(rows.length/pageSize))):1;
  const visible=page!==undefined&&pageSize!==undefined?ordered.slice((currentPage-1)*pageSize,currentPage*pageSize):ordered;
  function changeSort(key:string){
    if(loading)return;
    onSortChange(!sort||sort.key!==key?{key,direction:'asc'}:sort.direction==='asc'?{key,direction:'desc'}:null);
  }
  return <div className={s.scroll} role="region" aria-label={`${caption} 표`} tabIndex={0}>
    <table className={s.table} aria-busy={loading||undefined}>
      <caption>{caption}</caption>
      <thead><tr>{columns.map(column=>{
        const direction=sort?.key===column.key?sort.direction:null;
        return <th key={column.key} scope="col" aria-sort={column.sortValue?(direction==='asc'?'ascending':direction==='desc'?'descending':'none'):undefined}>
          {column.sortValue?<button type="button" disabled={loading} onClick={()=>changeSort(column.key)} aria-label={`${column.label}: ${direction==='asc'?'내림차순 정렬':direction==='desc'?'기본 순서로 보기':'오름차순 정렬'}`}>{column.label}<span aria-hidden="true">{direction==='asc'?'↑':direction==='desc'?'↓':'↕'}</span></button>:column.label}
        </th>;
      })}</tr></thead>
      <tbody>{loading?<tr><td colSpan={Math.max(columns.length,1)} className={s.message}><span role="status">불러오는 중이에요.</span></td></tr>:visible.length?visible.map(({row})=><tr key={rowKey(row)}>{columns.map(column=><td key={column.key}>{column.render(row)}</td>)}</tr>):<tr><td colSpan={Math.max(columns.length,1)} className={s.message}>{emptyMessage}</td></tr>}</tbody>
    </table>
  </div>;
}
