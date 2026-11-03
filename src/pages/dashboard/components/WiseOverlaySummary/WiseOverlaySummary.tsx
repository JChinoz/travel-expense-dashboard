import { Link } from 'react-router-dom';
import { dashboardNotes } from '@/common/data';
import { money } from '@/common/utils/format';
import './WiseOverlaySummary.css';

const EXCLUDED_WISE_TRANSACTIONS = dashboardNotes.excludedWiseTransactions;

interface WiseOverlaySummaryProps {
  recordedTotal: number;
  recordedCount: number;
  wiseImportedTotal: number;
  wiseImportedCount: number;
  total: number;
  /** Review-inbox transactions that currently count towards the totals. */
  pendingCount: number;
  pendingTotal: number;
}

export function WiseOverlaySummary({
  recordedTotal,
  recordedCount,
  wiseImportedTotal,
  wiseImportedCount,
  total,
  pendingCount,
  pendingTotal,
}: WiseOverlaySummaryProps) {
  return (
    <div className="wise-summary" role="note">
      <div>
        <small>Previously recorded expenses ({recordedCount} entries)</small>
        <strong>{money(recordedTotal)}</strong>
      </div>
      <span className="wise-summary__symbol">+</span>
      <div>
        <small>Included Wise card purchases ({wiseImportedCount} items)</small>
        <strong>{money(wiseImportedTotal)}</strong>
      </div>
      <span className="wise-summary__symbol">=</span>
      <div>
        <small>Total itemized spending</small>
        <strong>{money(total)}</strong>
      </div>
      <p>
        The {wiseImportedCount - pendingCount} Wise card transactions marked <b>Included</b> have been incorporated into
        both the itemized Expense Explorer and Expense Source Register. The remaining {EXCLUDED_WISE_TRANSACTIONS}{' '}
        transactions were excluded.
      </p>
      {pendingCount > 0 && (
        <p>
          <b>
            {pendingCount} Wise transaction(s) ({money(pendingTotal)}) from the review inbox are included in the dashboard
          </b>{' '}
          until you remove them. <Link to="/data-sources">Review them in Data Sources</Link>.
        </p>
      )}
    </div>
  );
}
