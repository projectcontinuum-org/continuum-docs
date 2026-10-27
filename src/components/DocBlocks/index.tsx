/**
 * Building blocks for doc pages, registered globally in src/theme/MDXComponents.tsx
 * so any .md/.mdx page can use them without imports.
 */
import type {CSSProperties, ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useActiveDocContext} from '@docusaurus/plugin-content-docs/client';

import styles from './styles.module.css';

const PALETTE = {
  purple: ['#8b5cf6', '#6366f1'],
  pink: ['#ec4899', '#8b5cf6'],
  amber: ['#f59e0b', '#f97316'],
  green: ['#10b981', '#06b6d4'],
  cyan: ['#06b6d4', '#3b82f6'],
  blue: ['#3b82f6', '#6366f1'],
  red: ['#ef4444', '#f59e0b'],
  lime: ['#84cc16', '#10b981'],
} as const;

export type Color = keyof typeof PALETTE;

function accent(color: Color = 'purple'): CSSProperties {
  const [a, b] = PALETTE[color];
  return {'--accent': a, '--accent2': b} as CSSProperties;
}

/** Resolves a doc id to its URL in the docs version currently being viewed. */
function useDocPath(docId?: string): string | undefined {
  const {activeVersion} = useActiveDocContext(undefined);
  if (!docId) {
    return undefined;
  }
  const doc = activeVersion?.docs.find((d) => d.id === docId);
  if (!doc) {
    throw new Error(`DocBlocks: no doc with id "${docId}" in version "${activeVersion?.name}"`);
  }
  return doc.path;
}

/** Larger intro paragraph shown under the page title. */
export function Lead({children}: {children: ReactNode}) {
  return <div className={styles.lead}>{children}</div>;
}

/** Row of small coloured badges, e.g. versions or node counts. */
export function Badges({children}: {children: ReactNode}) {
  return <div className={styles.badges}>{children}</div>;
}

export function Badge({color = 'purple', children}: {color?: Color; children: ReactNode}) {
  return (
    <span className={styles.badge} style={accent(color)}>
      {children}
    </span>
  );
}

/** Responsive grid of cards. */
export function CardGrid({cols = 2, children}: {cols?: 2 | 3 | 4; children: ReactNode}) {
  return <div className={clsx(styles.cardGrid, styles[`cols${cols}`])}>{children}</div>;
}

type CardProps = {
  title: string;
  /** Emoji or short text shown in the gradient badge. */
  icon?: string;
  color?: Color;
  /** Doc id (for example `getting-started/local-setup`), resolved in the current docs version. */
  doc?: string;
  /** External URL. Use `doc` for links inside the docs. */
  href?: string;
  children?: ReactNode;
};

export function Card({title, icon, color = 'purple', doc, href, children}: CardProps) {
  const docPath = useDocPath(doc);
  const target = docPath ?? href;
  const body = (
    <>
      {icon && <span className={styles.cardIcon}>{icon}</span>}
      <span className={styles.cardTitle}>{title}</span>
      {children && <div className={styles.cardBody}>{children}</div>}
      {target && <span className={styles.cardMore}>{docPath ? 'Read more →' : 'Open ↗'}</span>}
    </>
  );
  return target ? (
    <Link to={target} className={clsx(styles.card, styles.cardLink)} style={accent(color)}>
      {body}
    </Link>
  ) : (
    <div className={styles.card} style={accent(color)}>
      {body}
    </div>
  );
}

/** Wrap a Markdown ordered list to render it as numbered, connected steps. */
export function Steps({children}: {children: ReactNode}) {
  return <div className={styles.steps}>{children}</div>;
}
