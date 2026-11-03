import type { ExpenseRecord, TripMeta } from "@/common/types/expense";
import type {
  WiseAccountingStatus,
  WiseImportItem,
  WiseImportLine,
  WiseUpload,
} from "@/common/types/wiseImport";
import { round2 } from "@/common/utils/format";

export type SheetRow = unknown[];

export interface ParsedStatement {
  fileName: string;
  lines: WiseImportLine[];
  /** Rows that are not card transactions (conversions, transfers, …). */
  ignoredRows: number;
}

const pad = (n: number) => String(n).padStart(2, "0");
const norm = (v: unknown) =>
  String(v ?? "")
    .trim()
    .toLowerCase();

/** Reads an ISO date from a spreadsheet date cell, or a DD-MM-YYYY / YYYY-MM-DD / DD/MM/YYYY string. */
export function parseStatementDate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    // Excel dates carry no time zone; read them as UTC so the calendar day never shifts.
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}`;
  }
  const s = String(value ?? "").trim();
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/.exec(s);
  if (m) return `${m[3]}-${pad(Number(m[2]))}-${pad(Number(m[1]))}`;
  return null;
}

const toNumber = (v: unknown): number => {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

const COLUMN_NAMES = {
  id: ["transferwise id", "wise id", "id"],
  date: ["date", "date time", "created on"],
  amount: ["amount"],
  currency: ["currency"],
  description: ["description"],
  merchant: ["merchant"],
} as const;

type Column = keyof typeof COLUMN_NAMES;

/** Parses the first sheet of a Wise account statement into card ledger lines. */
export function parseStatementRows(
  rows: SheetRow[],
  fileName: string,
): ParsedStatement {
  const headerAt = rows
    .slice(0, 15)
    .findIndex((r) =>
      r.some((c) => COLUMN_NAMES.id.includes(norm(c) as never)),
    );
  if (headerAt < 0)
    throw new Error(
      `${fileName}: not a Wise statement (no "TransferWise ID" column found).`,
    );

  const header = rows[headerAt].map(norm);
  const col = {} as Record<Column, number>;
  for (const key of Object.keys(COLUMN_NAMES) as Column[]) {
    col[key] = header.findIndex((h) =>
      (COLUMN_NAMES[key] as readonly string[]).includes(h),
    );
  }
  const missing = (["id", "date", "amount"] as Column[]).filter(
    (k) => col[k] < 0,
  );
  if (missing.length)
    throw new Error(`${fileName}: missing column(s): ${missing.join(", ")}.`);

  const lines: WiseImportLine[] = [];
  let ignoredRows = 0;
  rows.slice(headerAt + 1).forEach((r, i) => {
    const id = String(r[col.id] ?? "").trim();
    if (!id) return;
    const isFee = id.startsWith("FEE-CARD-");
    if (!id.startsWith("CARD-") && !isFee) {
      ignoredRows++;
      return;
    }
    const date = parseStatementDate(r[col.date]);
    const amount = toNumber(r[col.amount]);
    if (!date || Number.isNaN(amount)) {
      ignoredRows++;
      return;
    }
    const merchant =
      col.merchant >= 0 ? String(r[col.merchant] ?? "").trim() : "";
    const description =
      col.description >= 0 ? String(r[col.description] ?? "").trim() : "";
    lines.push({
      id: isFee ? id.slice(4) : id,
      date,
      currency:
        col.currency >= 0
          ? String(r[col.currency] ?? "")
              .trim()
              .toUpperCase()
          : "SGD",
      amount,
      fee: isFee,
      description,
      merchant,
      fileName,
      row: headerAt + i + 2,
    });
  });
  return { fileName, lines, ignoredRows };
}

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length
    ? s.length % 2
      ? s[(s.length - 1) / 2]
      : (s[s.length / 2 - 1] + s[s.length / 2]) / 2
    : NaN;
};

/** Typical SGD-per-unit rate per currency, taken from existing "Wise card (X CCY)" rows. */
export function estimateSgdRates(
  records: ExpenseRecord[],
): Record<string, number> {
  const samples: Record<string, number[]> = {};
  for (const r of records) {
    const m = /Wise card \(([\d,.]+) ([A-Z]{3})\)/.exec(r.description);
    if (!m || r.amount <= 0) continue;
    const foreign = Number(m[1].replace(/,/g, ""));
    if (foreign > 0 && m[2] !== "SGD")
      (samples[m[2]] ??= []).push(r.amount / foreign);
  }
  const rates: Record<string, number> = {};
  for (const [ccy, xs] of Object.entries(samples)) rates[ccy] = median(xs);
  return rates;
}

/** Earliest/latest dated record per trip, used to place a purchase on a trip by date. */
export function tripWindows(records: ExpenseRecord[], trips: TripMeta[]) {
  const windows = new Map<number, { from: string; to: string }>();
  for (const r of records) {
    for (const d of [r.date, r.endDate]) {
      if (!d) continue;
      const w = windows.get(r.tripId);
      if (!w) windows.set(r.tripId, { from: d, to: d });
      else {
        if (d < w.from) w.from = d;
        if (d > w.to) w.to = d;
      }
    }
  }
  return trips.flatMap((t) => {
    const w = windows.get(t.id);
    return w ? [{ tripId: t.id, ...w }] : [];
  });
}

/** The narrowest trip window containing `date`, or null. */
export function matchTrip(
  date: string,
  windows: ReturnType<typeof tripWindows>,
): number | null {
  const span = (w: { from: string; to: string }) =>
    Date.parse(w.to) - Date.parse(w.from);
  const hits = windows
    .filter((w) => date >= w.from && date <= w.to)
    .sort((a, b) => span(a) - span(b));
  return hits.length ? hits[0].tripId : null;
}

const merchantFrom = (lines: WiseImportLine[]): string => {
  const named = lines.find((l) => l.merchant)?.merchant;
  if (named) return named;
  const m = /issued by (.*?)(?: \(fee:.*\))?$/.exec(lines[0].description);
  return m?.[1].trim() || "Wise card transaction";
};

const originalChargeFrom = (lines: WiseImportLine[]): string => {
  for (const l of lines) {
    const m = /Card transaction of ([\d,.]+ [A-Z]{3})/.exec(l.description);
    if (m) return m[1];
  }
  const main = lines.filter((l) => !l.fee);
  const spend = main.filter((l) => l.amount < 0);
  const picked = spend.length ? spend : main;
  const total = Math.abs(picked.reduce((s, l) => s + l.amount, 0));
  return `${total.toFixed(2)} ${picked[0]?.currency ?? "SGD"}`;
};

export interface ImportContext {
  rates: Record<string, number>;
  windows: ReturnType<typeof tripWindows>;
  /** Wise transaction ids already in the data source, inbox or removed list. */
  knownIds: Set<string>;
  startSeq: number;
  startBatch: number;
}

export interface ImportResult {
  items: WiseImportItem[];
  uploads: WiseUpload[];
  ignoredRows: number;
}

/** Turns parsed statements into review-inbox items, one per Wise card transaction id. */
export function buildImportItems(
  statements: ParsedStatement[],
  ctx: ImportContext,
): ImportResult {
  const byId = new Map<string, WiseImportLine[]>();
  for (const s of statements) {
    for (const l of s.lines) {
      const list = byId.get(l.id);
      if (list) list.push(l);
      else byId.set(l.id, [l]);
    }
  }

  const fresh = [...byId].filter(([id]) => !ctx.knownIds.has(id));
  const dated = fresh.map(([id, lines]) => ({
    id,
    lines,
    date: lines.map((l) => l.date).sort()[0],
  }));
  dated.sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );

  const items = dated.map(({ id, lines, date }, i): WiseImportItem => {
    const warnings: string[] = [];
    let net = 0;
    for (const l of lines) {
      if (l.currency === "SGD") net += l.amount;
      else if (ctx.rates[l.currency]) net += l.amount * ctx.rates[l.currency];
      else if (!warnings.some((w) => w.includes(l.currency))) {
        warnings.push(
          `No exchange rate known for ${l.currency}: enter the SGD amount yourself.`,
        );
      }
    }
    for (const ccy of new Set(lines.map((l) => l.currency))) {
      if (ccy !== "SGD" && ctx.rates[ccy]) {
        warnings.push(
          `${ccy} converted at an estimated ${ctx.rates[ccy].toFixed(4)} SGD/${ccy} (median of your existing rows).`,
        );
      }
    }
    const amountSGD = round2(-net);
    const wiseStatus: WiseAccountingStatus =
      amountSGD > 0.005
        ? "Included"
        : amountSGD < -0.005
          ? "Credit / refund"
          : "Zero-net / reversed";
    const description =
      lines.find((l) => !l.fee)?.description ?? lines[0].description;
    return {
      id,
      seq: ctx.startSeq + i,
      date,
      tripId: matchTrip(date, ctx.windows),
      merchant: merchantFrom(lines),
      description,
      originalCharge: originalChargeFrom(lines),
      amountSGD,
      wiseStatus,
      warnings,
      fileNames: [...new Set(lines.map((l) => l.fileName))],
      lines,
      statusDescription: "",
    };
  });

  const added = new Set(items.map((i) => i.id));
  const uploads = statements.map((s, n): WiseUpload => {
    const ids = [...new Set(s.lines.map((l) => l.id))];
    const currencies = s.lines.map((l) => l.currency);
    return {
      batch: ctx.startBatch + n,
      filename: s.fileName,
      currency: currencies.length ? mode(currencies) : "—",
      cardTransactions: ids.length,
      added: ids.filter((id) => added.has(id)).length,
      alreadyKnown: ids.filter((id) => ctx.knownIds.has(id)).length,
    };
  });

  return {
    items,
    uploads,
    ignoredRows: statements.reduce((n, s) => n + s.ignoredRows, 0),
  };
}

function mode(xs: string[]): string {
  const counts = new Map<string, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0][0];
}
