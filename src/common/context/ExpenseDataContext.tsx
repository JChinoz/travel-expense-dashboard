import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { expenseRecords, tripMeta } from "@/common/data";
import type {
  ExpenseEntry,
  ExpenseRecord,
  Trip,
  TripMeta,
} from "@/common/types/expense";
import type { ImportAction, ImportState } from "@/common/types/wiseImport";
import { attachTrips, buildTrips } from "@/common/utils/records";
import {
  countsOnDashboard,
  importReducer,
  itemToRecord,
  loadImportState,
  saveImportState,
} from "@/common/utils/wiseImport";

export interface ExpenseData {
  /** Data Source table rows: the base dataset plus Wise rows the user confirmed. */
  records: ExpenseRecord[];
  /** `records` joined with their trips, in source order. */
  entries: ExpenseEntry[];
  /** `records` plus the review-inbox rows that currently count on the dashboard. */
  dashboardRecords: ExpenseRecord[];
  tripMeta: TripMeta[];
  /** Trips derived from `dashboardRecords`; this is what the Dashboard Overview binds to. */
  trips: Trip[];
  /** Wise uploads: pending review, confirmed, removed. */
  imports: ImportState;
  dispatchImport: (action: ImportAction) => void;
}

export const ExpenseDataContext = createContext<ExpenseData | null>(null);

export function ExpenseDataProvider({ children }: { children: ReactNode }) {
  const [imports, dispatchImport] = useReducer(
    importReducer,
    undefined,
    loadImportState,
  );

  useEffect(() => {
    saveImportState(imports);
  }, [imports]);

  const value = useMemo<ExpenseData>(() => {
    const records = [
      ...expenseRecords,
      ...imports.confirmed.map((i) => itemToRecord(i, true)),
    ];
    const pendingRecords = imports.pending
      .filter(countsOnDashboard)
      .map((i) => itemToRecord(i, false));
    const dashboardRecords = [...records, ...pendingRecords];
    return {
      records,
      entries: attachTrips(records, tripMeta),
      dashboardRecords,
      tripMeta,
      trips: buildTrips(tripMeta, dashboardRecords),
      imports,
      dispatchImport,
    };
  }, [imports]);

  return (
    <ExpenseDataContext.Provider value={value}>
      {children}
    </ExpenseDataContext.Provider>
  );
}
