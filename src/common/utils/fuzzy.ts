export const fuzzyText = (s: unknown): string =>
  String(s ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase();

const tokenize = (s: string): string[] =>
  s.match(/[\p{L}\p{N}]+(?:[.-][\p{L}\p{N}]+)*/gu) ?? [];

/** True when `a` and `b` differ by at most one edit (substitution, swap, insertion or deletion). */
function closeWord(a: string, b: string): boolean {
  if (b === a || b.startsWith(a)) return true;
  if (a.length < 4 || Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const diff: number[] = [];
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
    if (diff.length === 1) return true;
    return (
      diff.length === 2 &&
      diff[1] === diff[0] + 1 &&
      a[diff[0]] === b[diff[1]] &&
      a[diff[1]] === b[diff[0]]
    );
  }
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < longer.length && j < shorter.length) {
    if (longer[i] === shorter[j]) {
      i++;
      j++;
    } else {
      if (++edits > 1) return false;
      i++;
    }
  }
  return true;
}

/** Typo-tolerant search: every query word must (nearly) match some word in the haystack. */
export function fuzzyMatch(query: string, haystack: string): boolean {
  const q = fuzzyText(query).trim();
  if (!q) return true;
  const text = fuzzyText(haystack);
  if (text.includes(q)) return true;
  const sought = tokenize(q);
  if (!sought.length) return false;
  const words = [...new Set(tokenize(text))];
  return sought.every((term) => words.some((word) => closeWord(term, word)));
}
