import type {AiPhotoKind} from '@/types/crefans-studio-management';

export function AiPhotoCategoryIcon({kind}:{kind:AiPhotoKind}){
 const shapes={outfit:<path d="m8 3-5 3 3 5 2-1v11h8V10l2 1 3-5-5-3c0 4-8 4-8 0Z"/>,makeup:<><path d="M8 14h8v7H8zm1 0V8l5-5v11"/><path d="M9 8h5"/></>,expression:<><circle cx="12" cy="12" r="9"/><path d="M8 14c2 3 6 3 8 0M8 9h.01M16 9h.01"/></>,pose:<><circle cx="11" cy="5" r="2.5"/><path d="m3 9 7 3 6-3 5-6M10 12v5l-4 5m4-5 6 5"/></>,background:<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 6-5 4 3 4-5 4 5"/></>};
 return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[kind]}</svg>;
}
