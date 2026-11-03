import { flagUrl } from '../../utils/flags';
import './FlagStrip.css';

type FlagSize = 'sm' | 'md' | 'lg';

interface FlagStripProps {
  countries: string[];
  size?: FlagSize;
}

export function FlagStrip({ countries, size = 'md' }: FlagStripProps) {
  if (!countries.length) return <span aria-hidden="true">🌍</span>;
  return (
    <span className={`flag-strip flag-strip--${size}`}>
      {countries.map((code) => (
        <img key={code} className="country-flag" src={flagUrl(code)} alt={`${code.toUpperCase()} flag`} loading="lazy" />
      ))}
    </span>
  );
}
