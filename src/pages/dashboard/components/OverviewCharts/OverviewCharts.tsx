import { useRef } from 'react';
import type { Trip } from '@/common/types/expense';
import { useMatchHeight } from '../../hooks/useMatchHeight';
import { categoryTotals, yearTotals, type TripsSummary } from '../../utils/tripStats';
import { CategoryBreakdown } from '../CategoryBreakdown';
import { TripExpensesChart } from '../TripExpensesChart';
import { YearlySpendingChart } from '../YearlySpendingChart';
import './OverviewCharts.css';

interface OverviewChartsProps {
  trips: Trip[];
  years: number[];
  summary: TripsSummary;
  onSelectTrip: (id: number) => void;
}

/** The trip bar chart next to the yearly and category charts. */
export function OverviewCharts({ trips, years, summary, onSelectTrip }: OverviewChartsProps) {
  const chartRef = useRef<HTMLElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  useMatchHeight(sideRef, chartRef);

  return (
    <section className="layout">
      <TripExpensesChart ref={chartRef} trips={trips} onSelectTrip={onSelectTrip} />
      <div className="side" ref={sideRef}>
        <YearlySpendingChart data={yearTotals(trips, years)} />
        <CategoryBreakdown categories={categoryTotals(trips)} total={summary.total} />
      </div>
    </section>
  );
}
