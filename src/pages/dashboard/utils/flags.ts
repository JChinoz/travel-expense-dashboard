const flagModules = import.meta.glob<string>('../assets/flags/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
});

const flagUrls: Record<string, string> = {};
for (const [path, url] of Object.entries(flagModules)) {
  const code = path.split('/').pop()?.replace('.svg', '');
  if (code) flagUrls[code] = url;
}

export const flagUrl = (code: string): string | undefined => flagUrls[code];

/** "jp" -> "🇯🇵". */
export const flagEmoji = (code: string): string =>
  String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

export const tripFlagEmoji = (countries: string[]): string =>
  countries.length ? countries.map(flagEmoji).join(' ') : '🌍';
