import type {HTMLAttributes} from 'react';
import s from './dialog-actions.module.css';

export function DialogActions({children,className='',...props}:HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`${s.actions} ${className}`}>{children}</div>;
}
