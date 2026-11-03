/** One ledger line of a Wise card transaction as read from a statement. */
export interface WiseImportLine {
  /** Card transaction id the line belongs to (fee lines point at their card). */
  id: string;
  date: string;
  currency: string;
  amount: number;
  /** A separate "Wise Charges for: CARD-…" line. */
  fee: boolean;
  description: string;
  merchant: string;
  fileName: string;
  /** 1-based spreadsheet row. */
  row: number;
}

export type WiseAccountingStatus =
  | "Included"
  | "Credit / refund"
  | "Zero-net / reversed";

/** A Wise card transaction uploaded from a statement and waiting for review. */
export interface WiseImportItem {
  /** Wise transaction id, e.g. `CARD-711154931`. */
  id: string;
  /** Import order; keeps items stable when sorted. */
  seq: number;
  date: string;
  /** Trip the purchase belongs to; `null` until the user assigns one. */
  tripId: number | null;
  merchant: string;
  description: string;
  originalCharge: string;
  /** Expense in SGD (negative for a refund). */
  amountSGD: number;
  wiseStatus: WiseAccountingStatus;
  /** Why the SGD amount may be off, e.g. an estimated exchange rate. */
  warnings: string[];
  fileNames: string[];
  lines: WiseImportLine[];
  /** Status description the user writes before adding the row to the data source. */
  statusDescription: string;
}

export interface WiseUpload {
  batch: number;
  filename: string;
  currency: string;
  cardTransactions: number;
  added: number;
  alreadyKnown: number;
}

export interface ImportState {
  /** Awaiting review; counted on the dashboard while the trip is assigned. */
  pending: WiseImportItem[];
  /** Added to the data source by the user. */
  confirmed: WiseImportItem[];
  /** Removed as irrelevant; kept so they can be restored and are not re-imported. */
  discarded: WiseImportItem[];
  uploads: WiseUpload[];
}

export type ImportAction =
  | { type: "add"; items: WiseImportItem[]; uploads: WiseUpload[] }
  | {
      type: "update";
      id: string;
      patch: Partial<
        Pick<WiseImportItem, "tripId" | "amountSGD" | "statusDescription">
      >;
    }
  | { type: "confirm"; id: string }
  | { type: "discard"; id: string }
  | { type: "restore"; id: string }
  | { type: "return"; id: string };
