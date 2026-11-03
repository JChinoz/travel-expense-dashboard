export const CATEGORY_COLORS: Record<string, string> = {
  Flight: "#4669ef",
  Hotel: "#12a89d",
  Train: "#f5a544",
  Transport: "#9878df",
  Attraction: "#dc6876",
};

export const FALLBACK_CATEGORY_COLOR = "#8995ab";

export const categoryColor = (category: string): string =>
  CATEGORY_COLORS[category] ?? FALLBACK_CATEGORY_COLOR;

export type TripSort = "amount" | "chronological" | "name";

export const TRIP_SORT_OPTIONS: { value: TripSort; label: string }[] = [
  { value: "amount", label: "Highest spending" },
  { value: "chronological", label: "Chronological" },
  { value: "name", label: "Trip name" },
];

export type ExpenseSortMode =
  | "date-asc"
  | "date-desc"
  | "price-desc"
  | "price-asc";

export const EXPENSE_SORT_OPTIONS: { value: ExpenseSortMode; label: string }[] =
  [
    { value: "date-asc", label: "Date - Oldest first" },
    { value: "date-desc", label: "Date - Newest first" },
    { value: "price-desc", label: "Price - High to Low" },
    { value: "price-asc", label: "Price - Low to High" },
  ];

export const JOURNEY_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "Return trip", label: "Return trips" },
  { value: "Return / multi-city", label: "Multi-city return" },
  { value: "One-way / leg", label: "One-way legs" },
  { value: "Domestic connection", label: "Domestic connections" },
  { value: "International connection", label: "International connections" },
  { value: "Hotel stay", label: "Hotels" },
  { value: "Attraction", label: "Attractions" },
  { value: "Transport", label: "Transport" },
  { value: "Car rental", label: "Car rentals" },
];

export const PAGE_SIZES = [15, 25, 50, 100];
