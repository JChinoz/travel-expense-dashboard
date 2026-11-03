import { useCallback, useEffect, useState } from "react";

export type ReviewChoice = "unreviewed" | "confirmed" | "followup";

export interface ReviewState {
  choice: ReviewChoice;
  note: string;
}

export const REVIEW_CHOICES: { value: ReviewChoice; label: string }[] = [
  { value: "unreviewed", label: "Not reviewed" },
  { value: "confirmed", label: "I confirm" },
  { value: "followup", label: "Needs follow-up" },
];

const UNREVIEWED: ReviewState = { choice: "unreviewed", note: "" };

function load(storageKey: string): Record<string, ReviewState> {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

/** Independent review decisions, kept in localStorage under `storageKey`. */
export function useReviewDecisions(storageKey: string) {
  const [decisions, setDecisions] = useState(() => load(storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(decisions));
    } catch {
      // Storage can be unavailable (private mode); decisions then live only for this session.
    }
  }, [storageKey, decisions]);

  const get = useCallback(
    (id: string): ReviewState => decisions[id] ?? UNREVIEWED,
    [decisions],
  );

  const update = useCallback((id: string, patch: Partial<ReviewState>) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? UNREVIEWED), ...patch },
    }));
  }, []);

  const reviewedCount = useCallback(
    (ids: string[]) =>
      ids.filter(
        (id) => (decisions[id]?.choice ?? "unreviewed") !== "unreviewed",
      ).length,
    [decisions],
  );

  return { get, update, reviewedCount };
}

export type ReviewDecisions = ReturnType<typeof useReviewDecisions>;
