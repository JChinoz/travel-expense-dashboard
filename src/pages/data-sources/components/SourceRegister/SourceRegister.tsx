import { useMemo, useState } from 'react';
import { Pagination } from '@/common/components/Pagination';
import type { ExpenseEntry } from '@/common/types/expense';
import { formatDate, money } from '@/common/utils/format';
import { fuzzyMatch, fuzzyText } from '@/common/utils/fuzzy';
import {
  VERIFICATION_GROUPS,
  VERIFICATION_LABELS,
  countByGroup,
  verificationGroup,
  type VerificationGroup,
} from '../../utils/verification';
import './SourceRegister.css';

const PAGE_SIZE = 30;

interface SourceRegisterProps {
  entries: ExpenseEntry[];
  /** Moves a row the user added from a Wise upload back to the review inbox. */
  onReturnToReview: (wiseId: string) => void;
}

const PILL_CLASS: Record<VerificationGroup, string> = {
  wise: 'wise-verified',
  booking: 'booking-verified',
  author: 'author-verified',
  review: 'warn',
};

/** Text matched by the register search; mirrors the columns shown in the table. */
const searchText = (r: ExpenseEntry): string =>
  [
    r.tripName,
    r.year,
    r.date,
    r.category,
    r.description,
    r.amount,
    `S$${Number(r.amount).toFixed(2)}`,
    formatDate(r.date),
    r.status,
    r.booking,
    r.sources.map((s) => `${s.type} ${s.label} ${s.note}`).join(' '),
  ].join(' ');

export function SourceRegister({ entries, onReturnToReview }: SourceRegisterProps) {
  const [search, setSearch] = useState('');
  const [trip, setTrip] = useState('');
  const [group, setGroup] = useState('');
  const [showDescription, setShowDescription] = useState(true);
  const [page, setPage] = useState(1);

  const indexed = useMemo(() => entries.map((entry) => ({ entry, text: searchText(entry) })), [entries]);
  const counts = useMemo(() => countByGroup(entries), [entries]);
  const tripNames = useMemo(() => [...new Set(entries.map((e) => e.tripName))].sort(), [entries]);

  const filtered = useMemo(() => {
    const q = fuzzyText(search).trim();
    return indexed
      .filter(
        ({ entry, text }) =>
          (!trip || entry.tripName === trip) &&
          (!group || verificationGroup(entry) === group) &&
          (!q || fuzzyMatch(q, text)),
      )
      .map((x) => x.entry);
  }, [indexed, search, trip, group]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const summary = filtered.length
    ? `Showing ${(current - 1) * PAGE_SIZE + 1}–${Math.min(current * PAGE_SIZE, filtered.length)} of ${filtered.length}`
    : 'No matching records';

  // Changing a filter restarts from the first page.
  const filterChange =
    (setter: (value: string) => void) =>
    (value: string) => {
      setter(value);
      setPage(1);
    };

  return (
    <section className={`source-register${showDescription ? '' : ' hide-status-description'}`}>
      <div className="register-controls">
        <input
          placeholder="Search expense, merchant, amount, booking, trip or source…"
          value={search}
          onChange={(e) => filterChange(setSearch)(e.target.value)}
        />
        <select aria-label="Filter by trip" value={trip} onChange={(e) => filterChange(setTrip)(e.target.value)}>
          <option value="">All trips</option>
          {tripNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="register-controls__group"
          aria-label="Filter by verification group"
          value={group}
          onChange={(e) => filterChange(setGroup)(e.target.value)}
        >
          <option value="">All verification statuses ({entries.length})</option>
          {VERIFICATION_GROUPS.map((g) => (
            <option key={g} value={g}>
              {VERIFICATION_LABELS[g]} ({counts[g]})
            </option>
          ))}
        </select>
        <label className="register-controls__toggle">
          <input type="checkbox" checked={showDescription} onChange={(e) => setShowDescription(e.target.checked)} />
          Show status description
        </label>
      </div>
      <div className="register-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Trip / category</th>
              <th>Expense</th>
              <th style={{ textAlign: 'right' }}>SGD</th>
              <th>Data source / evidence</th>
              <th>Status</th>
              <th className="status-description-col">Status Description</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((x) => {
              const g = verificationGroup(x);
              return (
                <tr key={x.id}>
                  <td>{x.date || '—'}</td>
                  <td>
                    <b>{x.tripName}</b>
                    <span className="sub">{x.category}</span>
                  </td>
                  <td>{x.description}</td>
                  <td className="amount">{money(x.amount)}</td>
                  <td>
                    {x.sources.map((s, n) => (
                      <span key={n} className="source">
                        <b>{s.type}</b>
                        {s.label}
                        <span className="sub">{s.note}</span>
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`pill ${PILL_CLASS[g]}`}>{VERIFICATION_LABELS[g]}</span>
                  </td>
                  <td className="status-description-col">{x.status || '—'}</td>
                  <td>
                    {x.userConfirmed && (
                      <button type="button" className="register-action" onClick={() => onReturnToReview(x.booking)}>
                        Return to review
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination summary={summary} page={current} pageCount={pageCount} onPageChange={setPage} showPageIndicator={false} />
    </section>
  );
}
