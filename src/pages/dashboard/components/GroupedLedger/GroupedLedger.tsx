import { money } from '@/common/utils/format';
import type { LedgerGroup } from '../../utils/ledger';
import { ExpenseTable } from '../ExpenseTable';
import { FlagStrip } from '../FlagStrip';
import './GroupedLedger.css';

export function GroupedLedger({ groups }: { groups: LedgerGroup[] }) {
  return (
    <div className="grouped-ledger">
      {groups.map(({ tripId, items, sum }) => {
        const first = items[0];
        return (
          <details key={tripId} className="trip-group">
            <summary>
              <span className="group-icon">
                <FlagStrip countries={first.countries} size="lg" />
              </span>
              <span>
                <div className="group-name">{first.tripName}</div>
                <div className="group-meta">
                  {first.year} · {items.length} expenses
                </div>
              </span>
              <span className="group-total">{money(sum)}</span>
              <span className="chevron">›</span>
            </summary>
            <div className="group-rows">
              <ExpenseTable entries={items} showTrip={false} />
            </div>
          </details>
        );
      })}
    </div>
  );
}
