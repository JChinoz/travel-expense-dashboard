/** Downloads `rows` as a UTF-8 CSV (with BOM, so Excel opens it correctly). */
export function downloadCsv(filename: string, rows: unknown[][]): void {
  const csv = rows
    .map((row) =>
      row.map((v) => '"' + String(v ?? "").replace(/"/g, '""') + '"').join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
