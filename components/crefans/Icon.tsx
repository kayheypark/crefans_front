import type {SVGProps} from 'react';
export type LandingIconName='bell'|'heart'|'search'|'card'|'users'|'user'|'lock'|'shield'|'ban'|'mail'|'bookmark'|'settings'|'menu'|'arrow'|'arrowUp'|'arrowLeft'|'refresh'|'chevron'|'plus'|'check'|'youtube'|'instagram'|'facebook'|'expand'|'shrink'|'close'|'copy'|'share';
export default function LandingIcon({name,...props}:SVGProps<SVGSVGElement>&{name:LandingIconName}){
  const paths = {
    copy:<><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    share:<><path d="M12 15V3m-4 4 4-4 4 4M6 10H4v11h16V10h-2"/></>,
    close:<path d="m5 5 14 14M5 19 19 5"/>,
    expand:<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>,
    shrink:<path d="M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5"/>,
    bell:<><path d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 0 0-9 0v4.5L6 17Z"/><path d="M10 20h4"/></>,heart:<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    search:<><circle cx="10.7" cy="10.7" r="7.3"/><path d="m16 16 5 5"/></>,
    card:<><rect x="2.5" y="4.5" width="19" height="15" rx="2"/><path d="M3 9h18M6.5 15h4"/></>,
    users:<><circle cx="9" cy="6" r="3"/><path d="M3 20v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m1 3a5 5 0 0 1 3 4v3"/></>,
    lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></>,
    arrowUp:<path d="M12 20V4m-6 6 6-6 6 6"/>,
    arrowLeft:<path d="M20 12H4m6-6-6 6 6 6"/>,
    refresh:<path d="M20 7v5h-5M20 12a8 8 0 1 0-2.34 5.66"/>,
    arrow:<path d="M4 12h16m-6-6 6 6-6 6"/>,chevron:<path d="m9 4 7 8-7 8"/>,plus:<path d="M12 5v14M5 12h14"/>,check:<path d="m5 12 4 4L19 6"/>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    shield:<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/>,
    ban:<><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></>,
    mail:<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    bookmark:<path d="M6 3h12v18l-6-4-6 4V3Z"/>,
    menu:<path d="M4 7h16M4 12h16M4 17h16"/>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></>,
    youtube:<><rect x="2.5" y="5.5" width="19" height="13" rx="4"/><path d="m10 9 5 3-5 3z"/></>,
    instagram:<><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.6"/><path d="M17 7h.01"/></>,
    facebook:<path d="M14.5 8.5H17V5h-2.5A3.5 3.5 0 0 0 11 8.5V11H8.5v3.2H11V21h3.5v-6.8h2.4l.6-3.2h-3V9.3a.8.8 0 0 1 .8-.8Z"/>,
  };
  return <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
