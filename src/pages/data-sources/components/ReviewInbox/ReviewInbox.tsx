import { useRef, useState } from 'react';
import { useExpenseData } from '@/common/hooks/useExpenseData';
import { money } from '@/common/utils/format';
import { isWiseImport } from '@/common/utils/records';
import { recentlyUpdatedRecordIds } from '../../data/recentUpdates';
import { useReviewDecisions } from '../../hooks/useReviewDecisions';
import { useWiseUpload } from '../../hooks/useWiseUpload';
import { RecentUpdatesPane } from '../RecentUpdatesPane';
import { StatementFilesPane } from '../StatementFilesPane';
import { WiseImportPane } from '../WiseImportPane';
import './ReviewInbox.css';

type InboxTab = 'new' | 'recent' | 'files';

/** Queue for reviewing newly uploaded Wise transactions before they join the data source. */
export function ReviewInbox() {
  const { entries, imports } = useExpenseData();
  const { upload, busy, message } = useWiseUpload();
  const [tab, setTab] = useState<InboxTab>(imports.pending.length ? 'new' : 'recent');
  const fileInput = useRef<HTMLInputElement>(null);
  const recentDecisions = useReviewDecisions('travelReviewInboxIndependentV2');

  const byId = new Map(entries.map((e) => [e.id, e]));
  const recent = recentlyUpdatedRecordIds.flatMap((id) => byId.get(id) ?? []);
  const importedCount = entries.filter(isWiseImport).length;
  const pendingTotal = imports.pending.reduce((s, x) => s + x.amountSGD, 0);

  const tabs: { id: InboxTab; domId: string; label: string }[] = [
    { id: 'new', domId: 'inboxNewTab', label: `Wise card transactions (${imports.pending.length})` },
    { id: 'recent', domId: 'inboxRecentTab', label: 'Recent source updates' },
    { id: 'files', domId: 'inboxFilesTab', label: `New Wise uploads (${imports.uploads.length})` },
  ];

  return (
    <section id="reviewInbox" className="review-inbox" aria-label="Recent additions and independent review inbox">
      <div className="inbox-top">
        <div className="inbox-head">
          <div>
            <h2>Recent additions &amp; review inbox</h2>
            <p>
              Upload a Wise statement to review its card transactions here. Until you include or remove them, they count on
              the Dashboard (once assigned to a trip) but are not part of the data source table below. {importedCount}{' '}
              Wise card expenses are currently in the data source.
            </p>
          </div>
          <div className="inbox-upload">
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx"
              multiple
              hidden
              onChange={async (e) => {
                const files = [...(e.target.files ?? [])];
                e.target.value = '';
                if (await upload(files)) setTab('new');
              }}
            />
            <button type="button" className="inbox-upload__button" disabled={busy} onClick={() => fileInput.current?.click()}>
              {busy ? 'Reading…' : 'Upload Wise statement (.xlsx)'}
            </button>
          </div>
        </div>
        {message && (
          <div className={`inbox-message inbox-message--${message.kind}`} role="status">
            {message.text}
          </div>
        )}
        <div className="inbox-metrics">
          <Metric value={imports.uploads.length} label="Statements uploaded" />
          <Metric value={imports.pending.length} label="Wise transactions awaiting review" />
          <Metric value={recent.length} label="Recent additions awaiting review" />
          <Metric value={recentDecisions.reviewedCount(recent.map((r) => 'audit-' + r.id))} label="Independently reviewed here" />
          <Metric value={money(pendingTotal)} label="Pending Wise expense additions" />
        </div>
      </div>
      <div className="inbox-tabs" role="tablist" aria-label="Review inbox contents">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            id={t.domId}
            role="tab"
            aria-selected={tab === t.id}
            className={`inbox-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <WiseImportPane hidden={tab !== 'new'} />
      <RecentUpdatesPane hidden={tab !== 'recent'} records={recent} decisions={recentDecisions} />
      <StatementFilesPane hidden={tab !== 'files'} uploads={imports.uploads} />
    </section>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="inbox-metric">
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  );
}
