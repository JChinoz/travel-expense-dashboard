import { NavLink } from 'react-router-dom';
import './PageSwitcher.css';

const links = [
  { to: '/', label: '✈ Dashboard', end: true },
  { to: '/data-sources', label: '▤ Data sources', end: false },
];

/** Floating switcher between the two pages. */
export function PageSwitcher() {
  return (
    <nav className="page-switcher" aria-label="Pages">
      {links.map((l) => (
        <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'on' : undefined)}>
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
