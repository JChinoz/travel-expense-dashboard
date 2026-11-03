import type { ExpenseRecord, TripMeta } from '@/common/types/expense';
import type { DashboardNotes } from '@/common/types/notes';
// `@data` resolves to private-data/ when it exists, otherwise to the fictional demo/ dataset (see vite.config.ts).
import expenseRecordsJson from '@data/expenseRecords.json';
import merchantIconsJson from '@data/merchantIcons.json';
import notesJson from '@data/notes.json';
import tripsJson from '@data/trips.json';

/** The Data Source: every itemised expense with its verification evidence. */
export const expenseRecords = expenseRecordsJson as unknown as ExpenseRecord[];
export const tripMeta = tripsJson as TripMeta[];
/** Pictograms for known merchants, keyed by expense description. */
export const merchantIcons = merchantIconsJson as Record<string, string>;
/** Free-text commentary shown on the dashboard. */
export const dashboardNotes = notesJson as DashboardNotes;
