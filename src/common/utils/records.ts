import type {
  ExpenseEntry,
  ExpenseRecord,
  Trip,
  TripMeta,
} from "@/common/types/expense";
import { round2 } from "./format";

/** Wise card purchases imported from statements carry their `CARD-<id>` as booking reference. */
export const isWiseImport = (r: Pick<ExpenseRecord, "booking">): boolean =>
  /^CARD-\d+$/.test(r.booking);

const sumAmounts = (items: ExpenseRecord[]): number =>
  items.reduce((s, i) => s + (Number(i.amount) || 0), 0);

const toEntry = (r: ExpenseRecord, meta: TripMeta): ExpenseEntry => ({
  ...r,
  tripName: meta.name,
  year: meta.year,
  countries: meta.countries,
});

/** Data Source rows, in source order, each joined with its trip. */
export function attachTrips(
  records: ExpenseRecord[],
  tripMeta: TripMeta[],
): ExpenseEntry[] {
  const byId = new Map(tripMeta.map((m) => [m.id, m]));
  return records.flatMap((r) => {
    const meta = byId.get(r.tripId);
    return meta ? [toEntry(r, meta)] : [];
  });
}

/**
 * Derives the dashboard's trips from the Data Source. Every figure on the
 * Dashboard Overview is computed here, so editing a record updates both pages.
 */
export function buildTrips(
  tripMeta: TripMeta[],
  records: ExpenseRecord[],
): Trip[] {
  const byTrip = new Map<number, ExpenseRecord[]>();
  for (const r of records) {
    const list = byTrip.get(r.tripId);
    if (list) list.push(r);
    else byTrip.set(r.tripId, [r]);
  }
  return tripMeta.map((meta) => {
    const items = (byTrip.get(meta.id) ?? [])
      .slice()
      .sort((a, b) => a.tripOrder - b.tripOrder)
      .map((r) => toEntry(r, meta));
    const total = round2(sumAmounts(items));
    const wiseImportedTotal = round2(sumAmounts(items.filter(isWiseImport)));
    return {
      ...meta,
      items,
      total,
      wiseImportedTotal,
      recordedTotal: round2(total - wiseImportedTotal),
    };
  });
}

/** Earliest dated record of a trip, falling back to the end of its year. */
export const tripStartDate = (t: Trip): string =>
  t.items
    .map((i) => i.date)
    .filter((d): d is string => !!d)
    .sort()[0] ?? `${t.year}-12-31`;
