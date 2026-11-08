// 크리에이터 SNS 링크(스튜디오 프로필에서 등록). 공개 크리에이터 프로필과 내 프로필 소개 탭이 함께 쓴다.
import type {CreatorLinks} from '@/types/crefans';
import Icon from './Icon';
import s from './creator.module.css';

const socialKeys=['youtube','instagram','facebook'] as const,socialLabels={youtube:'유튜브',instagram:'인스타그램',facebook:'페이스북'} as const;

export function SocialLinks({links}:{links?:CreatorLinks}){
  const social=socialKeys.filter(key=>links?.[key]).map(key=>[key,links![key]!] as const);
  if(!social.length)return null;
  return <ul className={s.socialLinks} aria-label="SNS 링크">{social.map(([key,url])=><li key={key}><a href={url} target="_blank" rel="noopener noreferrer"><Icon name={key} width="16" height="16"/>{socialLabels[key]}</a></li>)}</ul>;
}
