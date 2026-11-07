import s from './ui.module.css';

/** Console empty-state page asset (copied from crefans_admin EmptyState). Decorative: hidden from assistive tech. */
export const EMPTY_ILLUSTRATION_SRC='/brand/empty/empty-page-v1.svg';
export function EmptyIllustration(){
  return <img className={s.emptyIllustration} src={EMPTY_ILLUSTRATION_SRC} width={36} height={44} alt="" aria-hidden="true" draggable={false}/>;
}
