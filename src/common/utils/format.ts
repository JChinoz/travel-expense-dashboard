const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const money = (n: number): string =>
  "S$" +
  n.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function ordinalSuffix(day: number): string {
  if (day % 100 >= 11 && day % 100 <= 13) return "th";
  return (
    ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[day % 10] ?? "th"
  );
}

/** "2023-05-09" -> "9th May 2023". Non-ISO strings are returned unchanged. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Date not verified";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const day = Number(m[3]);
  return `${day}${ordinalSuffix(day)} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

export const round2 = (n: number): number => Math.round(n * 100) / 100;
