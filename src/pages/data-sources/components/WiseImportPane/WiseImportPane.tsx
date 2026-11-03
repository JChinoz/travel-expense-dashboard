import { useState } from 'react';
import { useExpenseData } from '@/common/hooks/useExpenseData';
import { money } from '@/common/utils/format';
import { dashboardNote } from '@/common/utils/wiseImport';
import type { WiseImportItem } from '@/common/types/wiseImport';

const norm = (s: unknown) => String(s ?? '').normalize('NFKC').toLocaleLowerCase().trim();
const signedMoney = (n: number) => (n < 0 ? '−' + money(Math.abs(n)) : money(n));

type View = 'pending' | 'removed';

export function WiseImportPane({ hidden }: { hidden: boolean }) {
  const { imports, tripMeta } = useExpenseData();
  const [view, setView] = useState<View>('pending');
  const [search, setSearch] = useState('');
  const [tripFilter, setTripFilter] = useState('');
  const [status, setStatus] = useState('');

  const source = view === 'pending' ? imports.pending : imports.discarded;
  const q = norm(search);
  const rows = source
    .filter((x) => {
      if (tripFilter === 'none' ? x.tripId !== null : tripFilter && String(x.tripId) !== tripFilter) return false;
      if (status && x.wiseStatus !== status) return false;
      if (!q) return true;
      return norm([x.date, x.merchant, x.originalCharge, x.id, x.wiseStatus, x.amountSGD, x.description, x.fileNames.join(' ')].join(' ')).includes(q);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.seq - b.seq);

  const tripLabel = (id: number) => {
    const t = tripMeta.find((m) => m.id === id);
    return t ? `${t.year} · ${t.name}` : String(id);
  };
  const counted = imports.pending.filter((x) => dashboardNote(x).startsWith('Counted'));

  return (
    <div id="inboxNew" className="inbox-pane wise-new-pane" role="tabpanel" aria-labelledby="inboxNewTab" hidden={hidden}>
      <div className="inbox-hint">
        {imports.pending.length || imports.discarded.length ? (
          <>
            <b>
              {imports.pending.length} Wise card transaction(s) awaiting review.
            </b>{' '}
            {counted.length} of them ({money(counted.reduce((s, x) => s + x.amountSGD, 0))}) already count on the Dashboard.
            Write a status description and click <b>Include in data source</b> to confirm a row, or <b>Remove</b> if it is
            irrelevant, which also takes it off the Dashboard.
          </>
        ) : (
          <>
            <b>No pending Wise card transactions.</b> Upload a Wise statement (.xlsx) to review its card transactions here
            before they are added to the data source.
          </>
        )}
      </div>
      <div className="inbox-toolbar">
        <input
          type="search"
          placeholder="Search merchant, CARD- Wise ID, trip, date or statement…"
          aria-label="Search Wise additions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Show awaiting or removed transactions" value={view} onChange={(e) => setView(e.target.value as View)}>
          <option value="pending">Awaiting review ({imports.pending.length})</option>
          <option value="removed">Removed ({imports.discarded.length})</option>
        </select>
        <select aria-label="Filter by trip" value={tripFilter} onChange={(e) => setTripFilter(e.target.value)}>
          <option value="">All trips</option>
          <option value="none">Unassigned</option>
          {tripMeta.map((t) => (
            <option key={t.id} value={t.id}>
              {t.year} · {t.name}
            </option>
          ))}
        </select>
        <select aria-label="Filter by accounting status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All accounting statuses</option>
          <option value="Included">Included</option>
          <option value="Credit / refund">Credit / refund</option>
          <option value="Zero-net / reversed">Zero-net / reversed</option>
        </select>
      </div>
      <div className="inbox-tablewrap">
        <table>
          <thead>
            <tr>
              <th>Transaction date</th>
              <th>Trip</th>
              <th>Wise merchant / expense</th>
              <th>Wise source</th>
              <th>SGD amount</th>
              <th>Status description</th>
              <th>Accounting treatment</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <ImportRow key={x.id} item={x} removed={view === 'removed'} tripLabel={tripLabel} />
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} style={{ padding: 20 }}>
                  {view === 'pending' ? 'No Wise card transactions awaiting review.' : 'No removed transactions.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="inbox-count">
        Showing {rows.length} of {source.length} · Pending contribution{' '}
        {signedMoney(rows.reduce((s, x) => s + x.amountSGD, 0))}
      </div>
      <p className="wise-inbox-help">
        SGD values from SGD Wise wallets are direct statement debits including separate card fees. Other currencies use an
        estimated rate taken from your existing rows; adjust the SGD amount if you know the exact figure. Rows without a trip
        are not counted on the Dashboard until you assign one.
      </p>
    </div>
  );
}

interface ImportRowProps {
  item: WiseImportItem;
  removed: boolean;
  tripLabel: (id: number) => string;
}

function ImportRow({ item: x, removed, tripLabel }: ImportRowProps) {
  const { tripMeta, dispatchImport } = useExpenseData();
  const css = x.wiseStatus === 'Credit / refund' ? 'negative' : x.wiseStatus === 'Zero-net / reversed' ? 'excluded' : '';
  const provenance = x.lines
    .map((l) => `${l.date} · ${l.fileName} · Excel row ${l.row} · ${l.currency} ${l.amount}${l.fee ? ' (Wise card fee)' : ''}`)
    .join('\n');

  return (
    <tr>
      <td style={{ whiteSpace: 'nowrap' }}>{x.date}</td>
      <td>
        <select
          className="wise-trip"
          aria-label={`Trip for ${x.merchant}`}
          value={x.tripId ?? ''}
          disabled={removed}
          onChange={(e) =>
            dispatchImport({ type: 'update', id: x.id, patch: { tripId: e.target.value === '' ? null : Number(e.target.value) } })
          }
        >
          <option value="">— Unassigned —</option>
          {tripMeta.map((t) => (
            <option key={t.id} value={t.id}>
              {tripLabel(t.id)}
            </option>
          ))}
        </select>
      </td>
      <td>
        <div className="wise-merchant">{x.merchant}</div>
        <div className="wise-charge">{x.originalCharge}</div>
        <div className="muted">{x.id}</div>
        <details>
          <summary>Original Wise transaction</summary>
          <div>{x.description}</div>
        </details>
      </td>
      <td>
        <div className="wise-source">{x.fileNames.join(', ')}</div>
        <details>
          <summary>Source lines &amp; FX</summary>
          <div>{`${provenance}${x.warnings.length ? '\n\n' + x.warnings.join('\n') : ''}`}</div>
        </details>
      </td>
      <td>
        <input
          key={`${x.id}-${x.amountSGD}`}
          className="wise-amount-input"
          type="number"
          step="0.01"
          aria-label={`SGD amount for ${x.merchant}`}
          defaultValue={x.amountSGD}
          disabled={removed}
          onBlur={(e) => {
            const n = Number(e.target.value);
            if (e.target.value !== '' && Number.isFinite(n) && n !== x.amountSGD) {
              dispatchImport({ type: 'update', id: x.id, patch: { amountSGD: Math.round(n * 100) / 100 } });
            }
          }}
        />
        {x.warnings.length > 0 && <span className="wise-review-flag">Check FX in source details</span>}
      </td>
      <td>
        <input
          className="wise-notes"
          placeholder="e.g. Wise merchant/date verified"
          aria-label={`Status description for ${x.merchant}`}
          value={x.statusDescription}
          disabled={removed}
          onChange={(e) => dispatchImport({ type: 'update', id: x.id, patch: { statusDescription: e.target.value } })}
        />
      </td>
      <td>
        <span className={`wise-pill ${css}`.trim()}>{x.wiseStatus}</span>
        <span className="wise-review-flag">{removed ? 'Removed from the Dashboard' : dashboardNote(x)}</span>
      </td>
      <td>
        <div className="wise-actions">
          {removed ? (
            <button type="button" onClick={() => dispatchImport({ type: 'restore', id: x.id })}>
              Restore to review
            </button>
          ) : (
            <>
              <button
                type="button"
                className="wise-include"
                disabled={x.tripId === null}
                title={x.tripId === null ? 'Assign a trip first' : undefined}
                onClick={() => dispatchImport({ type: 'confirm', id: x.id })}
              >
                Include in data source
              </button>
              <button type="button" className="wise-remove" onClick={() => dispatchImport({ type: 'discard', id: x.id })}>
                Remove
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
