import {SelectField} from '@/components/ui/SelectField';
import {categoryImageSrc} from './CategoryChip';
import type {ServiceData} from '@/types/crefans';

export function PostCategoryField({data,value,onChange,disabled}:{data?:Partial<Pick<ServiceData,'categories'|'categoryIcons'>>;value:string;onChange:(value:string)=>void;disabled:boolean}){
  const choices=(data?.categories??[]).filter(name=>name!=='전체');
  const options=choices.map(name=>({value:name,label:name,image:categoryImageSrc(name,data?.categoryIcons?.[name]??undefined)}));
  return <SelectField label="카테고리" value={value} options={options} onChange={onChange} disabled={disabled||!choices.length} placeholder={value||'카테고리 선택'}/>;
}
