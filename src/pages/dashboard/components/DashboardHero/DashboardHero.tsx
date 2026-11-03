import './DashboardHero.css';

export function DashboardHero({ firstYear, lastYear }: { firstYear: number; lastYear: number }) {
  return (
    <header className="hero">
      <div>
        <div className="hero__eyebrow">Personal travel · expense intelligence</div>
        <h1>Travel Expense Dashboard</h1>
        <p>Explore spending by trip, year, and expense category · {firstYear} onwards</p>
      </div>
      <span className="hero__pill">
        SGD · {firstYear}–{lastYear}
      </span>
    </header>
  );
}
