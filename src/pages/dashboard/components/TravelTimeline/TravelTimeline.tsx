import { EmptyState } from '@/common/components/EmptyState';
import type { Trip } from '@/common/types/expense';
import { money } from '@/common/utils/format';
import { tripStartDate } from '@/common/utils/records';
import { buildTimelineGroups } from '../../utils/expenseDisplay';
import { tripFlagEmoji } from '../../utils/flags';
import { FlagStrip } from '../FlagStrip';
import { Panel } from '../Panel';
import { TimelineEntry } from '../TimelineEntry';
import './TravelTimeline.css';

interface TravelTimelineProps {
  /** Every trip, used for the trip picker. */
  allTrips: Trip[];
  /** Trips that pass the dashboard filters. */
  visibleTrips: Trip[];
  chosenTrip: string;
  onChooseTrip: (tripId: string) => void;
  /** Back to the overall timeline and the unselected explorer. */
  onReset: () => void;
}

export function TravelTimeline({ allTrips, visibleTrips, chosenTrip, onChooseTrip, onReset }: TravelTimelineProps) {
  const groups = buildTimelineGroups(visibleTrips, chosenTrip);
  const options = allTrips
    .slice()
    .sort((a, b) => tripStartDate(a).localeCompare(tripStartDate(b)) || a.id - b.id);

  return (
    <Panel
      className="timeline-panel"
      title="Travel timelines"
      subtitle="Chronological itinerary per trip or across all trips"
      actions={<button onClick={onReset}>Overall timeline</button>}
    >
      <div className="timeline-tools">
        <label>
          Trip
          <select value={chosenTrip} onChange={(e) => onChooseTrip(e.target.value)}>
            <option value="all">All trips · chronological</option>
            {options.map((t) => (
              <option key={t.id} value={t.id}>
                {t.year} · {tripFlagEmoji(t.countries)} {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="timeline">
        {groups.length ? (
          groups.map(({ trip, entries }) => (
            <section key={trip.id} className="tl-group">
              <div className="tl-group-title">
                <span>
                  <FlagStrip countries={trip.countries} /> {trip.year} · {trip.name}
                </span>
                <span>{money(trip.total)}</span>
              </div>
              {entries.map((entry, n) => (
                <TimelineEntry key={entry.id} entry={entry} sequence={n + 1} />
              ))}
            </section>
          ))
        ) : (
          <EmptyState>No bookings available for this timeline.</EmptyState>
        )}
      </div>
    </Panel>
  );
}
