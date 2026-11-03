import { describe, expect, it } from 'vitest';
import { expenseRecords, tripMeta } from '@/common/data';
import { buildTrips, isWiseImport } from './records';

describe('Dashboard derived from the Data Source', () => {
  const trips = buildTrips(tripMeta, expenseRecords);
  const sum = (xs: { amount: number }[]) => xs.reduce((s, x) => s + x.amount, 0);

  it('places every Data Source record in exactly one trip', () => {
    expect(trips.reduce((n, t) => n + t.items.length, 0)).toBe(expenseRecords.length);
  });

  it('totals the dashboard from the record amounts', () => {
    expect(trips.reduce((s, t) => s + t.total, 0)).toBeCloseTo(sum(expenseRecords), 2);
    expect(trips.reduce((s, t) => s + t.wiseImportedTotal, 0)).toBeCloseTo(sum(expenseRecords.filter(isWiseImport)), 2);
  });

  it('updates the trip total when a record changes', () => {
    const edited = expenseRecords.map((r, i) => (i === 0 ? { ...r, amount: r.amount + 100 } : r));
    const before = trips.find((t) => t.id === expenseRecords[0].tripId)!;
    const after = buildTrips(tripMeta, edited).find((t) => t.id === before.id)!;
    expect(after.total).toBeCloseTo(before.total + 100, 2);
  });
});
