import {
  EXPENSE_SORT_OPTIONS,
  JOURNEY_FILTER_OPTIONS,
  PAGE_SIZES,
  type ExpenseSortMode,
} from '../../utils/constants';
import type { GroupPaging, LedgerView } from '../../utils/ledger';
import './LedgerToolbar.css';

interface LedgerToolbarProps {
  view: LedgerView;
  journey: string;
  sortMode: ExpenseSortMode;
  groupPaging: GroupPaging;
  pageSize: number;
  onViewChange: (view: LedgerView) => void;
  onJourneyChange: (journey: string) => void;
  onSortModeChange: (mode: ExpenseSortMode) => void;
  onGroupPagingChange: (paging: GroupPaging) => void;
  onPageSizeChange: (size: number) => void;
}

export function LedgerToolbar(props: LedgerToolbarProps) {
  const { view, journey, sortMode, groupPaging, pageSize } = props;
  const grouped = view === 'group';
  const yearPages = grouped && groupPaging === 'year';

  return (
    <div className="ledger-toolbar">
      <div className="tools-left">
        <div className="view-toggle" aria-label="Expense view">
          <button type="button" className={grouped ? 'active' : ''} onClick={() => props.onViewChange('group')}>
            ▤ Group by trip
          </button>
          <button type="button" className={grouped ? '' : 'active'} onClick={() => props.onViewChange('table')}>
            ☷ Itemized table
          </button>
        </div>
      </div>
      <div className="tools-right">
        <label className="journey-inline">
          Journey type
          <select value={journey} onChange={(e) => props.onJourneyChange(e.target.value)}>
            {JOURNEY_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="expenseSort">Sorting by</label>
        <select
          id="expenseSort"
          value={sortMode}
          aria-label={grouped ? 'Sort trips and expenses' : 'Sort itemized expenses'}
          onChange={(e) => props.onSortModeChange(e.target.value as ExpenseSortMode)}
        >
          {EXPENSE_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {grouped && (
          <>
            <label htmlFor="groupPaging">Group pages by</label>
            <select
              id="groupPaging"
              value={groupPaging}
              aria-label="Choose grouped trip pagination"
              onChange={(e) => props.onGroupPagingChange(e.target.value as GroupPaging)}
            >
              <option value="count">Trips</option>
              <option value="year">Year</option>
            </select>
          </>
        )}
        {!yearPages && (
          <>
            <label htmlFor="pageSize">{grouped ? 'Trips per page' : 'Rows per page'}</label>
            <select id="pageSize" value={pageSize} onChange={(e) => props.onPageSizeChange(Number(e.target.value))}>
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
