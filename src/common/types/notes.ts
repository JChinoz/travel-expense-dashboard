export interface DashboardNotes {
  /** Wise card transactions left out of the last import; not derivable from the rows. */
  excludedWiseTransactions: number;
  pendingBookingsSubtitle: string;
  verificationIntro: string;
  verificationItems: { label: string; text: string }[];
}
