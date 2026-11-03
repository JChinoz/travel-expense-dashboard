import { useMemo, useRef, useState } from "react";
import { useExpenseData } from "@/common/hooks/useExpenseData";
import { isWiseImport } from "@/common/utils/records";
import { countsOnDashboard } from "@/common/utils/wiseImport";
import { DataQualityNote } from "./components/DataQualityNote";
import { PendingBookings } from "./components/PendingBookings";
import { VerificationNotes } from "./components/VerificationNotes";
import { DashboardHero } from "./components/DashboardHero";
import { ExpenseExplorer } from "./components/ExpenseExplorer";
import { FilterBar } from "./components/FilterBar";
import { KpiCards } from "./components/KpiCards";
import { OverviewCharts } from "./components/OverviewCharts";
import { TravelTimeline } from "./components/TravelTimeline";
import { WiseOverlaySummary } from "./components/WiseOverlaySummary";
import type { TripSort } from "./utils/constants";
import { filterTrips, summarizeTrips } from "./utils/tripStats";
import "./DashboardPage.css";

/** Dashboard Overview. Every number on it is derived from the Data Source rows (see `useExpenseData`). */
export default function DashboardPage() {
  const { dashboardRecords, trips, imports } = useExpenseData();

  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<TripSort>("amount");
  const [search, setSearch] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [timelineTrip, setTimelineTrip] = useState("all");
  const [ledgerPage, setLedgerPage] = useState(1);
  const explorerRef = useRef<HTMLElement>(null);

  const years = useMemo(
    () => [...new Set(trips.map((t) => t.year))].sort((a, b) => a - b),
    [trips],
  );
  const visibleTrips = useMemo(
    () => filterTrips(trips, { year, search, sort }),
    [trips, year, search, sort],
  );
  const summary = useMemo(() => summarizeTrips(visibleTrips), [visibleTrips]);
  const wiseImportedCount = useMemo(
    () => dashboardRecords.filter(isWiseImport).length,
    [dashboardRecords],
  );
  const pendingWise = useMemo(
    () => imports.pending.filter(countsOnDashboard),
    [imports.pending],
  );
  const pendingBookings = useMemo(
    () =>
      trips
        .flatMap((t) => t.items)
        .filter((i) => i.bookingStatus === "Pending"),
    [trips],
  );

  // Any change to the trip filters returns the explorer to its unselected, first-page state.
  const onFilterChange =
    <T,>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value);
      setSelectedTripId(null);
      setLedgerPage(1);
    };

  const selectTrip = (id: number) => {
    setSelectedTripId(id);
    setLedgerPage(1);
    setTimelineTrip(String(id));
    explorerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="dashboard">
      <DashboardHero firstYear={years[0]} lastYear={years[years.length - 1]} />
      <FilterBar
        years={years}
        year={year}
        sort={sort}
        search={search}
        onYearChange={onFilterChange(setYear)}
        onSortChange={onFilterChange(setSort)}
        onSearchChange={onFilterChange(setSearch)}
      />
      <WiseOverlaySummary
        recordedTotal={summary.recordedTotal}
        recordedCount={dashboardRecords.length - wiseImportedCount}
        wiseImportedTotal={summary.wiseImportedTotal}
        wiseImportedCount={wiseImportedCount}
        total={summary.total}
        pendingCount={pendingWise.length}
        pendingTotal={pendingWise.reduce((s, x) => s + x.amountSGD, 0)}
      />
      <KpiCards summary={summary} wiseImportedCount={wiseImportedCount} />
      <OverviewCharts
        trips={visibleTrips}
        years={years}
        summary={summary}
        onSelectTrip={selectTrip}
      />
      <TravelTimeline
        allTrips={trips}
        visibleTrips={visibleTrips}
        chosenTrip={timelineTrip}
        onChooseTrip={setTimelineTrip}
        onReset={() => {
          setTimelineTrip("all");
          setSelectedTripId(null);
        }}
      />
      <ExpenseExplorer
        ref={explorerRef}
        visibleTrips={visibleTrips}
        selectedTripId={selectedTripId}
        page={ledgerPage}
        onPageChange={setLedgerPage}
        onShowAll={() => {
          setSelectedTripId(null);
          setLedgerPage(1);
        }}
      />
      <PendingBookings pending={pendingBookings} />
      <VerificationNotes />
      <DataQualityNote />
    </main>
  );
}
