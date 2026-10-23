import type { ReactNode } from "react";
import styles from "./design-system.module.css";

export function CatalogSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string;
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHeading}>
        <span className={styles.sectionNumber}>{number}</span>
        <div>
          <h2 id={`${id}-title`}>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export function Specimen({
  title,
  spec,
  children,
  wide = false,
}: {
  title: string;
  spec: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <article className={`${styles.specimen} ${wide ? styles.wide : ""}`}>
      <header>
        <h3>{title}</h3>
        <code>{spec}</code>
      </header>
      <div className={styles.preview}>{children}</div>
    </article>
  );
}
