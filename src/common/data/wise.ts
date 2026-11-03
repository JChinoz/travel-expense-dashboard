import type { WiseTransaction } from '@/common/types/expense';
import wiseTransactionsJson from '@data/wiseTransactions.json';

/** Raw Wise statement transactions; imported only by the (lazy-loaded) Wise source register. */
export const wiseTransactions = wiseTransactionsJson as WiseTransaction[];
