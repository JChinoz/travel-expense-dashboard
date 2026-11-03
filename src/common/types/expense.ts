/** A piece of evidence backing an expense record (booking email, Wise statement line, etc.). */
export interface EvidenceSource {
  type: string;
  label: string;
  note: string;
}

export interface JourneyLeg {
  date: string;
  route: string;
}

/**
 * One row of the Data Source. The Data Sources page lists these rows and the
 * Dashboard Overview is derived from the very same rows.
 */
export interface ExpenseRecord {
  id: string;
  tripId: number;
  /** Position of the record within its trip, used as a chronological tie-breaker. */
  tripOrder: number;
  date: string | null;
  endDate?: string;
  bookingDate?: string;
  category: string;
  description: string;
  amount: number;
  /** The expense is documented but its price is not known; it contributes S$0 to totals. */
  amountUnknown?: boolean;
  journeyType: string;
  legs?: JourneyLeg[];
  /** Booking reference, or the Wise `CARD-…` transaction id for imported card purchases. */
  booking: string;
  /** Detailed verification status, e.g. "Outlook email verified". */
  status: string;
  /** The user reviewed and added this row (Wise import) themselves. */
  userConfirmed?: boolean;
  sources: EvidenceSource[];
  dateSource?: string;
  verificationSource?: string;
  paymentVerified?: boolean;
  bookingStatus?: string;
  originalCurrency?: string;
  originalAmount?: number;
  sgdConversionRate?: number;
  sgdConversionRateDate?: string;
  amountBasis?: string;
  fxRate?: number;
  fxDate?: string;
  fxSource?: string;
}

export interface TripMeta {
  id: number;
  year: number;
  name: string;
  /** Trip inside Singapore. */
  local: boolean;
  /** Lower-case ISO country codes used to draw the flags. */
  countries: string[];
  note?: string;
}

/** A record enriched with the trip it belongs to. */
export interface ExpenseEntry extends ExpenseRecord {
  tripName: string;
  year: number;
  countries: string[];
}

/** A trip with its records and totals, derived from the Data Source. */
export interface Trip extends TripMeta {
  items: ExpenseEntry[];
  total: number;
  /** Portion of `total` that came from imported Wise card purchases. */
  wiseImportedTotal: number;
  recordedTotal: number;
}

export interface WiseTransaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  fees: number;
  source: string;
}
