/** Tiny glyphs shared by the studio uploader and fan post cards to tell photos from videos at a glance. */
export function MediaTypeIcon({type,size=14}:{type:'image'|'video';size?:number}){
  return type==='video'
    ?<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M5 4.5v15l14-7.5-14-7.5Z"/></svg>
    :<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m21 16-5-5-8 8"/></svg>;
}
