import type { TripSort } from '../../utils/constants';
import { TRIP_SORT_OPTIONS } from '../../utils/constants';
import './FilterBar.css';

interface FilterBarProps {
  years: number[];
  year: string;
  sort: TripSort;
  search: string;
  onYearChange: (year: string) => void;
  onSortChange: (sort: TripSort) => void;
  onSearchChange: (search: string) => void;
}

export function FilterBar({ years, year, sort, search, onYearChange, onSortChange, onSearchChange }: FilterBarProps) {
  return (
    <section className="filters">
      <label>
        Year
        <select value={year} onChange={(e) => onYearChange(e.target.value)}>
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </label>
      <label>
        Sort
        <select value={sort} onChange={(e) => onSortChange(e.target.value as TripSort)}>
          {TRIP_SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Search
        <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search destination or expense..." />
      </label>
    </section>
  );
}
