import type { ExpenseEntry } from '@/common/types/expense';
import { formatDate, money } from '@/common/utils/format';
import { expenseIcon, splitExpenseName } from '../../utils/expenseDisplay';
import { FlagStrip } from '../FlagStrip';
import './ExpenseTable.css';

interface ExpenseTableProps {
  entries: ExpenseEntry[];
  /** Add a Trip column (used when expenses of several trips are listed together). */
  showTrip: boolean;
}

export function ExpenseTable({ entries, showTrip }: ExpenseTableProps) {
  return (
    <div className="table-scroll">
      <table className="compact-table">
        <thead>
          <tr>
            <th>Merchant / expense</th>
            <th>Date</th>
            {showTrip && <th>Trip</th>}
            <th style={{ textAlign: 'right' }}>Amount (SGD)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((i) => {
            const { name, location } = splitExpenseName(i.description);
            return (
              <tr key={i.id}>
                <td>
                  <div className="merchant-cell">
                    <span className="category-icon">{expenseIcon(i)}</span>
                    <div>
                      <div className="merchant-main">{name}</div>
                      <div className="merchant-sub">{location || i.category || 'Expense'}</div>
                    </div>
                  </div>
                </td>
                <td className="compact-date">{formatDate(i.date)}</td>
                {showTrip && (
                  <td className="compact-trip">
                    <div className="trip-name">
                      <FlagStrip countries={i.countries} size="sm" /> {i.tripName}
                    </div>
                    <small>{i.year}</small>
                  </td>
                )}
                <td className="num">{i.amountUnknown ? '—' : money(i.amount)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
