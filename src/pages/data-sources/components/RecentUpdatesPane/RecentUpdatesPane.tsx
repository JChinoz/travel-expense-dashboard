import { useState } from 'react';
import type { ExpenseEntry } from '@/common/types/expense';
import { downloadCsv } from '../../utils/csv';
import { REVIEW_CHOICES, type ReviewChoice, type ReviewDecisions } from '../../hooks/useReviewDecisions';

interface RecentUpdatesPaneProps {
  hidden: boolean;
  records: ExpenseEntry[];
  decisions: ReviewDecisions;
}

const norm = (v: unknown) =>
  String(v ?? '')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function RecentUpdatesPane({ hidden, records, decisions }: RecentUpdatesPaneProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const key = (r: ExpenseEntry) => 'audit-' + r.id;

  const term = norm(search);
  const rows = records.filter((r) => {
    const state = decisions.get(key(r));
    const corpus = norm(
      [r.date, r.tripName, r.description, r.amount, r.category, r.status, r.booking, r.sources.map((s) => `${s.type} ${s.label} ${s.note}`).join(' ')].join(' '),
    );
    return (!filter || state.choice === filter) && (!term || corpus.includes(term));
  });

  const exportCsv = () => {
    const header = ['Expense date', 'Trip', 'Expense / merchant', 'SGD', 'Official status', 'Independent review', 'Reviewer note', 'Source evidence'];
    downloadCsv('recent_expense_source_independent_review.csv', [
      header,
      ...records.map((r) => {
        const st = decisions.get(key(r));
        return [
          r.date,
          r.tripName,
          r.description,
          Number(r.amount).toFixed(2),
          r.status,
          st.choice,
          st.note,
          r.sources.map((s) => `${s.type}: ${s.label} (${s.note})`).join(' | '),
        ];
      }),
    ]);
  };

  return (
    <div id="inboxRecent" className="inbox-pane" role="tabpanel" aria-labelledby="inboxRecentTab" hidden={hidden}>
      <div className="inbox-hint">
        <b>No recent additions awaiting review.</b> Past reconciliations are now represented by their official entries in
        the Expense Source Register above. New additions will appear here in future sessions.
      </div>
      <div className="inbox-toolbar">
        <input
          type="search"
          aria-label="Search recent evidence updates"
          placeholder="Search merchant, expense, date, amount, status or evidence…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter independent review decision" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All review decisions</option>
          <option value="unreviewed">Not reviewed</option>
          <option value="confirmed">Independently confirmed</option>
          <option value="followup">Needs follow-up</option>
        </select>
        <button type="button" className="inbox-export" onClick={exportCsv}>
          Export review CSV
        </button>
      </div>
      <div className="inbox-tablewrap">
        <table>
          <thead>
            <tr>
              <th>Expense date</th>
              <th>Expense / merchant</th>
              <th>SGD</th>
              <th>Recorded evidence</th>
              <th>Official status</th>
              <th>Your review</th>
              <th>Private review note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const state = decisions.get(key(r));
              return (
                <tr key={r.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{r.date}</td>
                  <td>
                    <div className="primary">{r.description}</div>
                    <div className="muted">
                      {r.tripName} · {r.category}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 750 }}>{Number(r.amount).toFixed(2)}</td>
                  <td>
                    <div className="inbox-evidence">
                      {r.sources[0]?.label ?? '—'}
                      {r.sources.length > 0 && (
                        <details>
                          <summary>
                            View {r.sources.length} source note{r.sources.length !== 1 ? 's' : ''}
                          </summary>
                          {r.sources.map((s, n) => (
                            <div key={n} className="evidence-line">
                              {`${s.type}: ${s.label} — ${s.note}`}
                            </div>
                          ))}
                        </details>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="inbox-tag">{r.status}</span>
                  </td>
                  <td>
                    <select
                      className="inbox-review-select"
                      aria-label={`Independent verification for ${r.description}`}
                      value={state.choice}
                      onChange={(e) => decisions.update(key(r), { choice: e.target.value as ReviewChoice })}
                    >
                      {REVIEW_CHOICES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="inbox-review-note"
                      type="text"
                      aria-label={`Review note for ${r.description}`}
                      placeholder="Your reference or note"
                      value={state.note}
                      onChange={(e) => decisions.update(key(r), { note: e.target.value })}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="inbox-count">
        Showing {rows.length} of {records.length} previous source updates ·{' '}
        {decisions.reviewedCount(records.map(key))} independently reviewed
      </div>
      <div className="inbox-footer">
        Review choices are kept in your browser when storage is available. Export the CSV to keep a durable copy. The
        review inbox is empty and ready for future reconciliation.
      </div>
    </div>
  );
}
