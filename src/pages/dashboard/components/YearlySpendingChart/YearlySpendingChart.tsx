import { Panel } from '../Panel';
import './YearlySpendingChart.css';

interface YearlySpendingChartProps {
  data: { year: number; total: number }[];
}

export function YearlySpendingChart({ data }: YearlySpendingChartProps) {
  const max = Math.max(1, ...data.map((d) => d.total));
  return (
    <Panel title="Yearly spending" subtitle="Totals by trip year · cross-year trips stay together">
      <div className="yearchart">
        {data.map((d) => (
          <div key={d.year} className="yearcol">
            <div className="amt">{d.total >= 1000 ? (d.total / 1000).toFixed(1) + 'k' : Math.round(d.total)}</div>
            <div
              className="yearbar"
              style={{ height: (d.total / max) * 140 }}
              title={`${d.year}: S$${d.total.toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <div className="yr">{d.year}</div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
