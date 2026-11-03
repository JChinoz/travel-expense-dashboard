import { useMemo, useState } from 'react';
import { wiseTransactions } from '@/common/data/wise';
import { formatDate } from '@/common/utils/format';
import { fuzzyMatch, fuzzyText } from '@/common/utils/fuzzy';
import './WiseSourceRegister.css';

const MAX_ROWS = 500;

const TYPE_FILTERS = [
  { value: '', label: 'All transactions' },
  { value: 'CARD-', label: 'Card transactions' },
  { value: 'BALANCE-', label: 'Currency conversions' },
  { value: 'FEE-', label: 'Fees' },
];

interface WiseSourceRegisterProps {
  /** Number of Data Source expenses verified against Wise. */
  linkedExpenseCount: number;
  onClose: () => void;
}

/** Full-screen register of every raw Wise statement transaction. */
export function WiseSourceRegister({ linkedExpenseCount, onClose }: WiseSourceRegisterProps) {
  const [query, setQuery] = useState('');
  const [currency, setCurrency] = useState('');
  const [type, setType] = useState('');

  const currencies = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of wiseTransactions) counts.set(t.currency, (counts.get(t.currency) ?? 0) + 1);
    return [...counts].sort((a, b) => a[0].localeCompare(b[0]));
  }, []);
  const statementCount = useMemo(() => new Set(wiseTransactions.map((t) => t.source)).size, []);
  const indexed = useMemo(
    () => wiseTransactions.map((t) => ({ t, text: JSON.stringify(t) + ' ' + formatDate(t.date) })),
    [],
  );

  const q = fuzzyText(query).trim();
  const rows = indexed
    .filter(({ t, text }) => (!currency || t.currency === currency) && (!type || t.id.startsWith(type)) && (!q || fuzzyMatch(q, text)))
    .map((x) => x.t);

  return (
    <section className="wise-register" role="dialog" aria-modal="true" aria-label="Wise Transaction Source Register">
      <div className="wise-register__wrap">
        <button onClick={onClose}>← Back to data sources</button>
        <h1>Wise Transaction Source Register</h1>
        <p>
          {wiseTransactions.length} transactions from {statementCount} statement files · {linkedExpenseCount} dashboard
          expenses verified against Wise
        </p>
        <input
          placeholder="Search merchant, transaction ID, description"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ minWidth: 320 }}
        />
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label="Filter by currency">
          <option value="">All currencies</option>
          {currencies.map(([code, n]) => (
            <option key={code} value={code}>
              {code} ({n})
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by transaction type">
          {TYPE_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <span>
          Showing {Math.min(rows.length, MAX_ROWS)} of {rows.length} filtered records (first {MAX_ROWS})
        </span>
        <div className="wise-register__scroller">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>Description</th>
                <th>Transaction ID</th>
                <th>Source file</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, MAX_ROWS).map((t) => (
                <tr key={t.id + t.date + t.amount}>
                  <td>{t.date}</td>
                  <td>{t.currency}</td>
                  <td>{t.amount}</td>
                  <td>{t.merchant}</td>
                  <td>{t.description}</td>
                  <td>{t.id}</td>
                  <td>{t.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
