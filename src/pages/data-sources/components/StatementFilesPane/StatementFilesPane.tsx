import { useState } from 'react';
import type { WiseUpload } from '@/common/types/wiseImport';

interface StatementFilesPaneProps {
  hidden: boolean;
  uploads: WiseUpload[];
}

const norm = (v: unknown) =>
  String(v ?? '')
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export function StatementFilesPane({ hidden, uploads }: StatementFilesPaneProps) {
  const [search, setSearch] = useState('');
  const term = norm(search);
  const rows = uploads.filter((x) => !term || norm(`batch ${x.batch} ${x.currency} ${x.filename}`).includes(term));

  return (
    <div id="inboxFiles" className="inbox-pane" role="tabpanel" aria-labelledby="inboxFilesTab" hidden={hidden}>
      <div className="inbox-hint">
        {uploads.length ? (
          <>
            <b>{uploads.length} Wise statement file(s) uploaded.</b> Their card transactions are listed under{' '}
            <b>Wise card transactions</b>. Transactions already in the data source, the inbox or the removed list are
            skipped.
          </>
        ) : (
          <>
            <b>No Wise statements uploaded yet.</b> Use <b>Upload Wise statement</b> above to add one or more .xlsx
            files.
          </>
        )}
      </div>
      <div className="inbox-toolbar">
        <input
          type="search"
          placeholder="Search currency, statement filename or batch…"
          aria-label="Search Wise statement files"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="inbox-tablewrap">
        <table style={{ minWidth: 720 }}>
          <thead>
            <tr>
              <th>Batch</th>
              <th>Currency</th>
              <th>Wise statement filename</th>
              <th>Card transactions</th>
              <th>Added to review</th>
              <th>Already known</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.batch}>
                <td>Batch {x.batch}</td>
                <td>
                  <b>{x.currency}</b>
                </td>
                <td>{x.filename}</td>
                <td>{x.cardTransactions}</td>
                <td>{x.added}</td>
                <td>{x.alreadyKnown}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="inbox-count">
        Showing {rows.length} of {uploads.length} uploaded Wise statements
      </div>
    </div>
  );
}
