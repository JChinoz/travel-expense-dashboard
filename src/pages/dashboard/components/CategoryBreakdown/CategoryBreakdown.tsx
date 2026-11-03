import { money } from '@/common/utils/format';
import type { CategorySegment } from '../../utils/tripStats';
import { Panel } from '../Panel';
import './CategoryBreakdown.css';

interface CategoryBreakdownProps {
  categories: CategorySegment[];
  total: number;
}

export function CategoryBreakdown({ categories, total }: CategoryBreakdownProps) {
  return (
    <Panel title="Expense breakdown" subtitle="Spending by category">
      {categories.length ? (
        categories.map((c) => (
          <div key={c.category} className="catrow">
            <span>{c.category}</span>
            <div className="catrow__track">
              <span className="catrow__fill" style={{ width: `${total ? (c.amount / total) * 100 : 0}%`, background: c.color }} />
            </div>
            <strong>{money(c.amount)}</strong>
          </div>
        ))
      ) : (
        <div className="empty">No expenses</div>
      )}
    </Panel>
  );
}
