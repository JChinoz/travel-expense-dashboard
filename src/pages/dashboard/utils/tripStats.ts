import type { Trip } from "@/common/types/expense";
import { money } from "@/common/utils/format";
import { fuzzyMatch, fuzzyText } from "@/common/utils/fuzzy";
import { tripStartDate } from "@/common/utils/records";
import { categoryColor, type TripSort } from "./constants";

export interface TripFilters {
  year: string;
  search: string;
  sort: TripSort;
}

const searchCorpus = (t: Trip): string =>
  t.name +
  " " +
  t.items
    .map((x) =>
      [
        x.description,
        x.category,
        x.amount,
        money(x.amount),
        x.date,
        x.bookingDate ?? "",
        x.booking,
      ].join(" "),
    )
    .join(" ");

/** Trips that pass the year / search filters, in the chosen order. */
export function filterTrips(
  trips: Trip[],
  { year, search, sort }: TripFilters,
): Trip[] {
  const q = fuzzyText(search).trim();
  const list = trips.filter(
    (t) =>
      (year === "all" || String(t.year) === year) &&
      (!q || fuzzyMatch(q, searchCorpus(t))),
  );
  return list.sort((a, b) => {
    if (sort === "amount") return b.total - a.total;
    if (sort === "name") return a.name.localeCompare(b.name);
    return tripStartDate(a).localeCompare(tripStartDate(b)) || a.id - b.id;
  });
}

export interface TripsSummary {
  total: number;
  recordedTotal: number;
  wiseImportedTotal: number;
  count: number;
  average: number;
  largest: Trip | undefined;
}

export function summarizeTrips(trips: Trip[]): TripsSummary {
  const total = trips.reduce((s, t) => s + t.total, 0);
  return {
    total,
    recordedTotal: trips.reduce((s, t) => s + t.recordedTotal, 0),
    wiseImportedTotal: trips.reduce((s, t) => s + t.wiseImportedTotal, 0),
    count: trips.length,
    average: trips.length ? total / trips.length : 0,
    largest: [...trips].sort((a, b) => b.total - a.total)[0],
  };
}

export interface CategorySegment {
  category: string;
  amount: number;
  color: string;
}

/** Category totals for one trip, in first-seen order (stack order of the bar). */
export function tripCategorySegments(trip: Trip): CategorySegment[] {
  const totals = new Map<string, number>();
  for (const i of trip.items)
    totals.set(i.category, (totals.get(i.category) ?? 0) + i.amount);
  return [...totals].map(([category, amount]) => ({
    category,
    amount,
    color: categoryColor(category),
  }));
}

/** Category totals across trips, largest first. */
export function categoryTotals(trips: Trip[]): CategorySegment[] {
  const totals = new Map<string, number>();
  for (const t of trips)
    for (const i of t.items)
      totals.set(i.category, (totals.get(i.category) ?? 0) + i.amount);
  return [...totals]
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColor(category),
    }));
}

export function yearTotals(
  trips: Trip[],
  years: number[],
): { year: number; total: number }[] {
  return years.map((year) => ({
    year,
    total: trips
      .filter((t) => t.year === year)
      .reduce((s, t) => s + t.total, 0),
  }));
}
