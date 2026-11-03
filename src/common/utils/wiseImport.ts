import type { ExpenseRecord } from "@/common/types/expense";
import type {
  ImportAction,
  ImportState,
  WiseImportItem,
} from "@/common/types/wiseImport";
import { formatDate, money, round2 } from "./format";

export const IMPORT_STORAGE_KEY = "travel.wiseImports.v1";

export const emptyImportState: ImportState = {
  pending: [],
  confirmed: [],
  discarded: [],
  uploads: [],
};

export const DEFAULT_CONFIRMED_STATUS = "Confirmed by user (Wise import)";

export function loadImportState(): ImportState {
  try {
    const saved = JSON.parse(
      localStorage.getItem(IMPORT_STORAGE_KEY) ?? "null",
    );
    if (
      saved &&
      Array.isArray(saved.pending) &&
      Array.isArray(saved.confirmed)
    ) {
      return { ...emptyImportState, ...saved };
    }
  } catch {
    // Unreadable or unavailable storage: start empty.
  }
  return emptyImportState;
}

export function saveImportState(state: ImportState): void {
  try {
    localStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode); the session still works.
  }
}

const without = (list: WiseImportItem[], id: string) =>
  list.filter((i) => i.id !== id);
const find = (state: ImportState, id: string) =>
  [...state.pending, ...state.confirmed, ...state.discarded].find(
    (i) => i.id === id,
  );

export function importReducer(
  state: ImportState,
  action: ImportAction,
): ImportState {
  switch (action.type) {
    case "add":
      return {
        ...state,
        pending: [...state.pending, ...action.items],
        uploads: [...state.uploads, ...action.uploads],
      };
    case "update": {
      const apply = (list: WiseImportItem[]) =>
        list.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i));
      return {
        ...state,
        pending: apply(state.pending),
        confirmed: apply(state.confirmed),
        discarded: apply(state.discarded),
      };
    }
    case "confirm": {
      const item = state.pending.find((i) => i.id === action.id);
      if (!item || item.tripId === null) return state;
      return {
        ...state,
        pending: without(state.pending, item.id),
        confirmed: [...state.confirmed, item],
      };
    }
    case "discard": {
      const item = find(state, action.id);
      if (!item) return state;
      return {
        ...state,
        pending: without(state.pending, item.id),
        confirmed: without(state.confirmed, item.id),
        discarded: [...without(state.discarded, item.id), item],
      };
    }
    case "restore": {
      const item = state.discarded.find((i) => i.id === action.id);
      if (!item) return state;
      return {
        ...state,
        discarded: without(state.discarded, item.id),
        pending: [...state.pending, item],
      };
    }
    case "return": {
      const item = state.confirmed.find((i) => i.id === action.id);
      if (!item) return state;
      return {
        ...state,
        confirmed: without(state.confirmed, item.id),
        pending: [...state.pending, item],
      };
    }
  }
}

/** Pending items count on the dashboard once they have a trip and are a real purchase. */
export const countsOnDashboard = (item: WiseImportItem): boolean =>
  item.tripId !== null &&
  item.wiseStatus === "Included" &&
  item.amountSGD !== 0;

/** Why a pending item is (not) counted on the dashboard. */
export function dashboardNote(item: WiseImportItem): string {
  if (item.tripId === null) return "Not counted: assign a trip";
  if (item.wiseStatus === "Credit / refund")
    return "Not counted: refund (include to apply it)";
  if (item.wiseStatus === "Zero-net / reversed")
    return "Not counted: nets to zero";
  return "Counted on the dashboard";
}

/** Converts an imported item into a Data Source row. */
export function itemToRecord(
  item: WiseImportItem,
  confirmed: boolean,
): ExpenseRecord {
  const rows = item.lines
    .map(
      (l) =>
        `Excel row ${l.row}: ${l.currency} ${l.amount}${l.fee ? " (card fee)" : ""}`,
    )
    .join("; ");
  return {
    id: `wise-${item.id}`,
    tripId: item.tripId ?? -1,
    tripOrder: 100000 + item.seq,
    date: item.date,
    category: "Other",
    description: `${item.merchant} · Wise card (${item.originalCharge})`,
    amount: round2(item.amountSGD),
    journeyType: "On-trip expense",
    booking: item.id,
    status: confirmed
      ? item.statusDescription.trim() || DEFAULT_CONFIRMED_STATUS
      : "Awaiting review",
    userConfirmed: confirmed || undefined,
    sources: [
      {
        type: "Wise statement",
        label: item.fileNames.join(", "),
        note:
          `Wise CARD-transaction ID ${item.id}; original ${item.originalCharge} on ${formatDate(item.date)}. ${rows}. ` +
          `SGD contribution ${money(item.amountSGD)}.` +
          (item.warnings.length ? ` ${item.warnings.join(" ")}` : "") +
          (confirmed ? " Confirmed by user." : " Awaiting user review."),
      },
    ],
  };
}
