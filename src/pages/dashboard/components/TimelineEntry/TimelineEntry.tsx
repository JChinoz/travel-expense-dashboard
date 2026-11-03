import type { ExpenseEntry } from '@/common/types/expense';
import { formatDate, money } from '@/common/utils/format';
import { timelineIcon } from '../../utils/expenseDisplay';
import { JourneyChip } from '../JourneyChip';
import './TimelineEntry.css';

interface TimelineEntryProps {
  entry: ExpenseEntry;
  /** 1-based position within the trip, shown for undated entries. */
  sequence: number;
}

export function TimelineEntry({ entry: i, sequence }: TimelineEntryProps) {
  return (
    <div className="tl-entry">
      <div className="tl-date">
        {i.date ? (
          formatDate(i.date)
        ) : (
          <>
            <span className="date-unverified">Travel date not verified</span>
            {i.bookingDate && <div className="tl-booked">Booked {formatDate(i.bookingDate)}</div>}
          </>
        )}
        <div>{i.date ? '' : `Sequence ${sequence}`}</div>
      </div>
      <div className="tl-node" />
      <div className="tl-content">
        <strong>
          <span className="tl-icon" aria-hidden="true">
            {timelineIcon(i)}
          </span>
          {i.description}
        </strong>
        {i.legs && i.legs.length > 1 && (
          <div className="tl-legs">{i.legs.map((l) => `${formatDate(l.date)} · ${l.route}`).join(' → ')}</div>
        )}
        <div className="tl-meta">
          <JourneyChip journeyType={i.journeyType} /> · {i.category} ·{' '}
          {i.amountUnknown ? <span className="date-unverified">Price not verified</span> : money(i.amount)}
        </div>
      </div>
    </div>
  );
}
