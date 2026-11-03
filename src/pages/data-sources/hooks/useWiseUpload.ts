import { useState } from "react";
import { useExpenseData } from "@/common/hooks/useExpenseData";
import { isWiseImport } from "@/common/utils/records";
import { readWiseStatements } from "../utils/readWiseStatements";
import {
  buildImportItems,
  estimateSgdRates,
  tripWindows,
} from "../utils/wiseStatement";

export interface UploadMessage {
  kind: "success" | "error";
  text: string;
}

/** Reads Wise statements and puts the new card transactions into the review inbox. */
export function useWiseUpload() {
  const { records, tripMeta, imports, dispatchImport } = useExpenseData();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<UploadMessage | null>(null);

  const upload = async (files: File[]): Promise<boolean> => {
    if (!files.length) return false;
    setBusy(true);
    setMessage(null);
    try {
      const statements = await readWiseStatements(files);
      const all = [
        ...imports.pending,
        ...imports.confirmed,
        ...imports.discarded,
      ];
      const knownIds = new Set([
        ...records.filter(isWiseImport).map((r) => r.booking),
        ...all.map((i) => i.id),
      ]);
      const result = buildImportItems(statements, {
        rates: estimateSgdRates(records),
        windows: tripWindows(records, tripMeta),
        knownIds,
        startSeq: all.reduce((m, i) => Math.max(m, i.seq), 0) + 1,
        startBatch: imports.uploads.length + 1,
      });
      dispatchImport({
        type: "add",
        items: result.items,
        uploads: result.uploads,
      });

      const cards = result.uploads.reduce((n, u) => n + u.cardTransactions, 0);
      const known = result.uploads.reduce((n, u) => n + u.alreadyKnown, 0);
      setMessage({
        kind: "success",
        text:
          `${files.length} file(s) read: ${cards} card transaction(s) found, ${result.items.length} added to the review inbox, ` +
          `${known} already known, ${result.ignoredRows} non-card row(s) ignored.`,
      });
      return result.items.length > 0;
    } catch (e) {
      setMessage({
        kind: "error",
        text:
          e instanceof Error ? e.message : "The file could not be processed.",
      });
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { upload, busy, message };
}
