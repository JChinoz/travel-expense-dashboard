import type { ExpenseEntry, Trip } from "@/common/types/expense";
import { money } from "@/common/utils/format";
import type { ExpenseSortMode } from "./constants";

export type LedgerView = "group" | "table";
export type GroupPaging = "count" | "year";

export interface LedgerOptions {
  selectedTripId: number | null;
  journey: string;
  sortMode: ExpenseSortMode;
  view: LedgerView;
  groupPaging: GroupPaging;
  pageSize: number;
  /** Requested 1-based page; clamped to the available range. */
  page: number;
}

export interface LedgerGroup {
  tripId: number;
  items: ExpenseEntry[];
  sum: number;
}

export interface Ledger {
  selectedTrip: Trip | undefined;
  entries: ExpenseEntry[];
  entriesTotal: number;
  page: number;
  pageCount: number;
  /** Rows of the current page in table view. */
  rows: ExpenseEntry[];
  /** Trip groups of the current page in group view. */
  groups: LedgerGroup[];
  pageSummary: string;
  yearPages: boolean;
}

/** Dated entries first by date, undated ones after, ties by position within the trip. */
export function chronology(a: ExpenseEntry, b: ExpenseEntry): number {
  const ad = a.date ?? "";
  const bd = b.date ?? "";
  if (ad && bd) return ad.localeCompare(bd) || a.tripOrder - b.tripOrder;
  if (ad) return -1;
  if (bd) return 1;
  return a.tripOrder - b.tripOrder;
}

export function sortExpenses(
  items: ExpenseEntry[],
  mode: ExpenseSortMode,
): ExpenseEntry[] {
  const fallback = (a: ExpenseEntry, b: ExpenseEntry) =>
    chronology(a, b) || a.tripId - b.tripId || a.tripOrder - b.tripOrder;
  const amount = (e: ExpenseEntry) => Number(e.amount) || 0;
  const ordered = items.slice();
  if (mode === "price-desc")
    ordered.sort((a, b) => amount(b) - amount(a) || fallback(a, b));
  else if (mode === "price-asc")
    ordered.sort((a, b) => amount(a) - amount(b) || fallback(a, b));
  else if (mode === "date-desc") {
    ordered.sort((a, b) => {
      if (a.date && b.date)
        return b.date.localeCompare(a.date) || fallback(a, b);
      return a.date ? -1 : b.date ? 1 : fallback(a, b);
    });
  } else ordered.sort(fallback);
  return ordered;
}

const clamp = (page: number, pageCount: number) =>
  Math.min(Math.max(1, page), pageCount);

/** Group entries by trip, then order the groups according to the sort mode. */
function groupByTrip(entries: ExpenseEntry[], mode: ExpenseSortMode) {
  const grouped = new Map<number, ExpenseEntry[]>();
  for (const e of entries) {
    const list = grouped.get(e.tripId);
    if (list) list.push(e);
    else grouped.set(e.tripId, [e]);
  }
  const groups = [...grouped].map(([tripId, items], order) => {
    const dated = items
      .map((i) => i.date)
      .filter((d): d is string => !!d)
      .sort();
    return {
      tripId,
      items,
      order,
      sum: items.reduce((s, i) => s + (Number(i.amount) || 0), 0),
      firstDate: dated[0] ?? "9999-12-31",
      lastDate: dated[dated.length - 1] ?? "",
    };
  });
  if (mode === "price-desc")
    groups.sort((a, b) => b.sum - a.sum || a.order - b.order);
  else if (mode === "price-asc")
    groups.sort((a, b) => a.sum - b.sum || a.order - b.order);
  else if (mode === "date-desc")
    groups.sort(
      (a, b) => b.lastDate.localeCompare(a.lastDate) || a.order - b.order,
    );
  else
    groups.sort(
      (a, b) => a.firstDate.localeCompare(b.firstDate) || a.order - b.order,
    );
  return groups;
}

/** Filters, sorts and paginates the visible trips' expenses for the Expense Explorer. */
export function buildLedger(visible: Trip[], opts: LedgerOptions): Ledger {
  const { selectedTripId, journey, sortMode, view, groupPaging, pageSize } =
    opts;
  const selectedTrip = visible.find((t) => t.id === selectedTripId);
  const source = selectedTrip
    ? selectedTrip.items
    : visible.flatMap((t) => t.items);
  const entries = sortExpenses(
    source.filter((i) => journey === "all" || i.journeyType === journey),
    sortMode,
  );
  const base = {
    selectedTrip,
    entries,
    entriesTotal: entries.reduce((s, i) => s + (i.amount || 0), 0),
  };

  const summarize = (page: number, totalUnits: number, unit: string) => {
    const from = totalUnits ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, totalUnits);
    return `Showing ${from}–${to} of ${totalUnits} ${unit}${view === "group" ? ` · ${entries.length} expenses` : ""}`;
  };

  if (view === "table") {
    const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
    const page = clamp(opts.page, pageCount);
    return {
      ...base,
      page,
      pageCount,
      rows: entries.slice((page - 1) * pageSize, page * pageSize),
      groups: [],
      yearPages: false,
      pageSummary: summarize(page, entries.length, "expenses"),
    };
  }

  const groups = groupByTrip(entries, sortMode);
  const yearPages = groupPaging === "year";

  if (yearPages) {
    // Pages follow each trip's assigned year, so multi-year journeys stay on one page.
    const years = [...new Set(groups.map((g) => g.items[0].year))].sort(
      (a, b) => a - b,
    );
    if (sortMode === "date-desc") years.reverse();
    const pageCount = Math.max(1, years.length);
    const page = clamp(opts.page, pageCount);
    const slice = groups.filter((g) => g.items[0].year === years[page - 1]);
    const pageSummary = years.length
      ? `Year ${years[page - 1]} · ${slice.length} trips · ${slice.reduce((n, g) => n + g.items.length, 0)} expenses`
      : "No trips";
    return {
      ...base,
      page,
      pageCount,
      rows: [],
      groups: slice,
      yearPages,
      pageSummary,
    };
  }

  const pageCount = Math.max(1, Math.ceil(groups.length / pageSize));
  const page = clamp(opts.page, pageCount);
  return {
    ...base,
    page,
    pageCount,
    rows: [],
    groups: groups.slice((page - 1) * pageSize, page * pageSize),
    yearPages,
    pageSummary: summarize(page, groups.length, "trips"),
  };
}

export const ledgerSubtitle = (ledger: Ledger): string =>
  `${ledger.entries.length} itemized expenses · ${ledger.selectedTrip ? "Selected trip" : "All visible trips"} · ${money(ledger.entriesTotal)} recorded`;
