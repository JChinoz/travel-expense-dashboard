import { dashboardNotes } from "@/common/data";
import type { ExpenseEntry } from "@/common/types/expense";
import { money } from "@/common/utils/format";
import { Panel } from "../Panel";
import "./PendingBookings.css";

/** Bookings found in email that are not yet part of the totals. */
export function PendingBookings({ pending }: { pending: ExpenseEntry[] }) {
  return (
    <Panel
      className="notes-panel"
      title="Discovered bookings awaiting reconciliation"
      subtitle={dashboardNotes.pendingBookingsSubtitle}
    >
      <div className="table-scroll">
        <table className="pending-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Trip</th>
              <th>Booking</th>
              <th>Quoted amount</th>
              <th>Why excluded</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((i) => (
              <tr key={i.id}>
                <td>{i.year}</td>
                <td>{i.tripName}</td>
                <td>{i.description}</td>
                <td>{money(i.amount)}</td>
                <td>{i.verificationSource ?? i.dateSource ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!pending.length && (
          <p className="sub pending-empty">
            No outstanding bookings in this table.
          </p>
        )}
      </div>
    </Panel>
  );
}
