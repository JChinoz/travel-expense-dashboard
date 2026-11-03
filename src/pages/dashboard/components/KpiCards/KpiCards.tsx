import { money } from '@/common/utils/format';
import type { TripsSummary } from '../../utils/tripStats';
import './KpiCards.css';

interface KpiCardsProps {
  summary: TripsSummary;
  wiseImportedCount: number;
}

interface Kpi {
  icon: string;
  label: string;
  value: string;
  hint: string;
}

export function KpiCards({ summary, wiseImportedCount }: KpiCardsProps) {
  const kpis: Kpi[] = [
    {
      icon: '💳',
      label: 'Total expenses · itemized',
      value: money(summary.total),
      hint: `Includes ${wiseImportedCount} newly imported Wise card expenses`,
    },
    { icon: '🧳', label: 'Trips / groups', value: String(summary.count), hint: 'Chronological timeline available per trip' },
    { icon: '📊', label: 'Average per trip', value: money(summary.average), hint: 'Across visible groups' },
    {
      icon: '🏆',
      label: 'Most expensive trip',
      value: summary.largest ? money(summary.largest.total) : '—',
      hint: summary.largest ? summary.largest.name : 'No trips',
    },
  ];

  return (
    <section className="kpis">
      {kpis.map((k) => (
        <article key={k.label} className="card kpi">
          <span className="kpi__icon" aria-hidden="true">
            {k.icon}
          </span>
          <div className="kpi__label">{k.label}</div>
          <div className="kpi__value">{k.value}</div>
          <div className="kpi__hint">{k.hint}</div>
        </article>
      ))}
    </section>
  );
}
