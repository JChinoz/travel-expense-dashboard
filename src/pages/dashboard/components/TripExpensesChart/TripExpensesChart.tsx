import type { Ref } from 'react';
import type { Trip } from '@/common/types/expense';
import { money } from '@/common/utils/format';
import { CATEGORY_COLORS } from '../../utils/constants';
import { tripCategorySegments } from '../../utils/tripStats';
import { FlagStrip } from '../FlagStrip';
import { Panel } from '../Panel';
import './TripExpensesChart.css';

interface TripExpensesChartProps {
  trips: Trip[];
  onSelectTrip: (id: number) => void;
  ref?: Ref<HTMLElement>;
}

export function TripExpensesChart({ trips, onSelectTrip, ref }: TripExpensesChartProps) {
  const max = Math.max(1, ...trips.map((t) => t.total));

  return (
    <Panel
      ref={ref}
      className="trip-chart"
      title="Expenses by trip"
      subtitle="Stacked by category · click a trip to open its timeline"
    >
      <div className="trip-bars">
        {trips.length ? (
          trips.map((t) => (
            <div
              key={t.id}
              className="tripbar"
              role="button"
              tabIndex={0}
              aria-label={`View ${t.name} expenses`}
              onClick={() => onSelectTrip(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTrip(t.id);
                }
              }}
            >
              <div className="barlabel" title={t.name}>
                <FlagStrip countries={t.countries} /> {t.name}
                <small>
                  {t.year}
                  {t.local ? ' · Local' : ''}
                </small>
              </div>
              <div className="track" style={{ width: `${Math.max(1, (t.total / max) * 100)}%` }}>
                {tripCategorySegments(t).map((s) => (
                  <span
                    key={s.category}
                    className="seg"
                    title={`${s.category}: ${money(s.amount)}`}
                    style={{ background: s.color, width: `${(s.amount / t.total) * 100}%` }}
                  />
                ))}
              </div>
              <div className="baramount">{money(t.total)}</div>
            </div>
          ))
        ) : (
          <div className="empty">No matching trips</div>
        )}
      </div>
      <div className="legend">
        {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
          <span key={category}>
            <i className="dot" style={{ background: color }} />
            {category}
          </span>
        ))}
      </div>
    </Panel>
  );
}
