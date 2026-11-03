import './SourceStats.css';

interface SourceStatsProps {
  total: number;
  verified: number;
  pending: number;
}

export function SourceStats({ total, verified, pending }: SourceStatsProps) {
  const stats = [
    { value: total, label: 'Itemized expense records' },
    { value: verified, label: 'Verified expenses' },
    { value: pending, label: 'Pending verification' },
  ];
  return (
    <div className="source-stats">
      {stats.map((s) => (
        <div key={s.label} className="source-stat">
          <strong>{s.value}</strong>
          <span>{s.label}</span>
        </div>
      ))}
    </div>
  );
}
