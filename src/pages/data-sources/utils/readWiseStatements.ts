import type { ParsedStatement } from "./wiseStatement";
import { parseStatementRows, type SheetRow } from "./wiseStatement";

/** Reads each `.xlsx` Wise statement (first sheet) in the browser. */
export async function readWiseStatements(
  files: File[],
): Promise<ParsedStatement[]> {
  // Loaded on demand: the parser is only needed when the user uploads a statement.
  const { readSheet } = await import("read-excel-file/web-worker");
  const parsed: ParsedStatement[] = [];
  for (const file of files) {
    let rows: SheetRow[];
    try {
      rows = (await readSheet(file)) as SheetRow[];
    } catch {
      throw new Error(`${file.name}: could not be read as an .xlsx file.`);
    }
    parsed.push(parseStatementRows(rows, file.name));
  }
  return parsed;
}
