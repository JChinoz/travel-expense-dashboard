import { useState, type Ref } from 'react';
import { EmptyState } from '@/common/components/EmptyState';
import { Pagination } from '@/common/components/Pagination';
import type { Trip } from '@/common/types/expense';
import type { ExpenseSortMode } from '../../utils/constants';
import { buildLedger, ledgerSubtitle, type GroupPaging, type LedgerView } from '../../utils/ledger';
import { ExpenseTable } from '../ExpenseTable';
import { GroupedLedger } from '../GroupedLedger';
import { LedgerToolbar } from '../LedgerToolbar';
import { Panel } from '../Panel';
import './ExpenseExplorer.css';

interface ExpenseExplorerProps {
  /** Trips that pass the dashboard filters. */
  visibleTrips: Trip[];
  selectedTripId: number | null;
  page: number;
  onPageChange: (page: number) => void;
  onShowAll: () => void;
  ref?: Ref<HTMLElement>;
}

export function ExpenseExplorer({ visibleTrips, selectedTripId, page, onPageChange, onShowAll, ref }: ExpenseExplorerProps) {
  const [view, setView] = useState<LedgerView>('group');
  const [journey, setJourney] = useState('all');
  const [sortMode, setSortMode] = useState<ExpenseSortMode>('date-asc');
  const [groupPaging, setGroupPaging] = useState<GroupPaging>('count');
  const [pageSize, setPageSize] = useState(25);

  const ledger = buildLedger(visibleTrips, { selectedTripId, journey, sortMode, view, groupPaging, pageSize, page });
  const { selectedTrip } = ledger;

  // Changing any ledger setting restarts from the first page.
  const change =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      onPageChange(1);
    };

  return (
    <Panel
      ref={ref}
      className="details"
      title={selectedTrip ? `${selectedTrip.name} · ${selectedTrip.year}` : 'Expense explorer'}
      subtitle={ledgerSubtitle(ledger)}
      actions={<button onClick={onShowAll}>All expenses</button>}
    >
      <LedgerToolbar
        view={view}
        journey={journey}
        sortMode={sortMode}
        groupPaging={groupPaging}
        pageSize={pageSize}
        onViewChange={change(setView)}
        onJourneyChange={change(setJourney)}
        onSortModeChange={change(setSortMode)}
        onGroupPagingChange={change(setGroupPaging)}
        onPageSizeChange={change(setPageSize)}
      />
      <div className="ledger-body">
        {view === 'table' ? (
          ledger.rows.length ? (
            <ExpenseTable entries={ledger.rows} showTrip={!selectedTrip} />
          ) : (
            <EmptyState>No matching expenses</EmptyState>
          )
        ) : ledger.groups.length ? (
          <GroupedLedger groups={ledger.groups} />
        ) : (
          <EmptyState>No matching expenses</EmptyState>
        )}
      </div>
      <Pagination summary={ledger.pageSummary} page={ledger.page} pageCount={ledger.pageCount} onPageChange={onPageChange} />
    </Panel>
  );
}
