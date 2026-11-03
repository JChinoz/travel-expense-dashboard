import { lazy, Suspense, useMemo, useState } from "react";
import { useExpenseData } from "@/common/hooks/useExpenseData";
import { ReviewInbox } from "./components/ReviewInbox";
import { SourceRegister } from "./components/SourceRegister";
import { SourceStats } from "./components/SourceStats";
import { countByGroup } from "./utils/verification";
import "./DataSourcesPage.css";

// The raw Wise statement data is large, so it is only fetched when the register is opened.
const WiseSourceRegister = lazy(() =>
  import("./components/WiseSourceRegister").then((m) => ({
    default: m.WiseSourceRegister,
  })),
);

/** Data Sources: the itemised expense rows (with evidence) that the Dashboard Overview is computed from. */
export default function DataSourcesPage() {
  const { entries, dispatchImport } = useExpenseData();
  const [wiseOpen, setWiseOpen] = useState(false);

  const counts = useMemo(() => countByGroup(entries), [entries]);

  return (
    <main className="data-sources">
      <div className="data-sources__head">
        <div>
          <h1>Expense source register</h1>
          <p>
            Itemized evidence for every recorded expense · Search, filter and
            inspect source references independently of the main dashboard.
          </p>
        </div>
        <button onClick={() => setWiseOpen(true)}>Wise source register</button>
      </div>
      <SourceStats
        total={entries.length}
        verified={entries.length - counts.review}
        pending={counts.review}
      />
      <ReviewInbox />
      <SourceRegister
        entries={entries}
        onReturnToReview={(id) => dispatchImport({ type: "return", id })}
      />
      {wiseOpen && (
        <Suspense fallback={null}>
          <WiseSourceRegister
            linkedExpenseCount={counts.wise}
            onClose={() => setWiseOpen(false)}
          />
        </Suspense>
      )}
    </main>
  );
}
