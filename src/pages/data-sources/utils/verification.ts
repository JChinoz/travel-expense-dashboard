import type { ExpenseRecord } from "@/common/types/expense";

export type VerificationGroup = "wise" | "booking" | "author" | "review";

const WISE_STATUSES = new Set([
  "Wise merchant/date/amount corroborated",
  "Wise merchant/date verified (user-attested FX)",
  "Wise merchant/date verified (amount differs)",
  "Wise merchant/date verified (itinerary linked)",
  "Wise transaction matched",
]);

const BOOKING_STATUSES = new Set([
  "Booking number matched",
  "Outlook email verified",
  "Outlook email + PDF verified",
  "Outlook PDF verified",
  "Outlook PDF verified (amount discrepancy)",
]);

const AUTHOR_STATUSES = new Set([
  "Author-verified (Agoda booking)",
  "Author-verified (Agoda booking, estimated FX)",
]);

/** Collapses the detailed status into one of four short verification groups. */
export function verificationGroup(
  record: Pick<ExpenseRecord, "status" | "userConfirmed">,
): VerificationGroup {
  if (record.userConfirmed) return "author";
  if (WISE_STATUSES.has(record.status)) return "wise";
  if (BOOKING_STATUSES.has(record.status)) return "booking";
  if (AUTHOR_STATUSES.has(record.status)) return "author";
  return "review";
}

export const VERIFICATION_LABELS: Record<VerificationGroup, string> = {
  wise: "Wise verified",
  booking: "Booking / email verified",
  author: "Author verified",
  review: "Needs review",
};

export const VERIFICATION_GROUPS: VerificationGroup[] = [
  "wise",
  "booking",
  "author",
  "review",
];

export function countByGroup(
  records: ExpenseRecord[],
): Record<VerificationGroup, number> {
  const counts: Record<VerificationGroup, number> = {
    wise: 0,
    booking: 0,
    author: 0,
    review: 0,
  };
  for (const r of records) counts[verificationGroup(r)]++;
  return counts;
}
