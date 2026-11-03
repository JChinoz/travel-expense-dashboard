import { merchantIcons } from "@/common/data";
import type { ExpenseEntry, Trip } from "@/common/types/expense";
import { tripStartDate } from "@/common/utils/records";
import { chronology } from "./ledger";

/** Pictogram for a row of the Expense Explorer. */
export function expenseIcon(
  i: Pick<ExpenseEntry, "category" | "journeyType">,
): string {
  const c = (i.category || "").toLowerCase();
  const j = (i.journeyType || "").toLowerCase();
  if (c.includes("flight") || j.includes("flight")) return "✈️";
  if (c.includes("hotel") || j.includes("hotel")) return "🏨";
  if (c.includes("food") || c.includes("dining")) return "🍽️";
  if (c.includes("train") || j.includes("train")) return "🚆";
  if (c.includes("transport") || j.includes("transport")) return "🚕";
  if (c.includes("attraction") || j.includes("attraction")) return "🎟️";
  if (c.includes("car")) return "🚗";
  return "🛍️";
}

/** Pictogram for a timeline entry: known merchants first, then keyword heuristics. */
export function timelineIcon(i: ExpenseEntry): string {
  const known = merchantIcons[i.description];
  if (known) return known;
  const c = (i.category || "").toLowerCase();
  const j = (i.journeyType || "").toLowerCase();
  const d = (i.description || "").toLowerCase();
  if (j.includes("car rental") || /car rental|hertz|sixt|rental car/.test(d))
    return "🚗";
  if (
    c.includes("hotel") ||
    j.includes("hotel") ||
    /hotel|resort|accommodation/.test(d)
  )
    return "🏨";
  if (
    c.includes("flight") ||
    j.includes("flight") ||
    /airline|airport flight/.test(d)
  )
    return "✈️";
  if (c.includes("train") || /rail|train|korail/.test(d)) return "🚆";
  if (
    c.includes("attraction") ||
    j.includes("attraction") ||
    /ticket|admission|tour|garden|theme park/.test(d)
  )
    return "🎟️";
  if (
    c.includes("transport") ||
    j.includes("transport") ||
    /taxi|bus|ferry|transfer/.test(d)
  )
    return "🚕";
  if (/restaurant|cafe|dining|food/.test(d)) return "🍽️";
  return "💳";
}

/** Splits "Merchant · LOCATION" into its two parts and shortens very long names. */
export function splitExpenseName(description: string): {
  name: string;
  location: string;
} {
  const parts = String(description || "")
    .trim()
    .split(/\s+·\s+/);
  let name = parts[0] || "Expense";
  if (name.length > 110) name = name.slice(0, 107) + "…";
  return { name, location: parts.length > 1 ? parts.slice(1).join(" · ") : "" };
}

export interface TimelineGroup {
  trip: Trip;
  entries: ExpenseEntry[];
}

/** One chronological group per trip, ordered by the trip's first date. */
export function buildTimelineGroups(
  visible: Trip[],
  chosen: string,
): TimelineGroup[] {
  const trips =
    chosen === "all" ? visible : visible.filter((t) => String(t.id) === chosen);
  return trips
    .map((trip) => ({ trip, entries: trip.items.slice().sort(chronology) }))
    .filter((g) => g.entries.length)
    .sort(
      (a, b) =>
        tripStartDate(a.trip).localeCompare(tripStartDate(b.trip)) ||
        a.trip.id - b.trip.id,
    );
}

/** CSS-modifier slug for a journey type, e.g. "Return / multi-city" -> "return-multi-city". */
export const journeySlug = (journeyType: string): string =>
  journeyType
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
