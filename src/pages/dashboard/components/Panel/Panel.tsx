import type { ReactNode, Ref } from 'react';
import './Panel.css';

interface PanelProps {
  title: string;
  subtitle?: ReactNode;
  /** Rendered to the right of the title (e.g. a reset button). */
  actions?: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
}

export function Panel({ title, subtitle, actions, className = '', ref, children }: PanelProps) {
  const heading = (
    <div>
      <h2>{title}</h2>
      {subtitle && <p className="sub">{subtitle}</p>}
    </div>
  );
  return (
    <article ref={ref} className={`card panel ${className}`.trim()}>
      {actions ? (
        <div className="panel__head">
          {heading}
          {actions}
        </div>
      ) : (
        heading
      )}
      {children}
    </article>
  );
}
