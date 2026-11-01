import type {ReactNode} from 'react';
import s from './policy-notes.module.css';

/** Soft box with a short title and dot-led policy lines, shared by studio payout screens. */
export function PolicyNotes({title,notes,children}:{title:string;notes:readonly string[];children?:ReactNode}){
  return <section className={s.policy} aria-label={title}><h2 className={s.title}>{title}</h2><ul>{notes.map(note=><li key={note}>{note}</li>)}</ul>{children}</section>;
}
