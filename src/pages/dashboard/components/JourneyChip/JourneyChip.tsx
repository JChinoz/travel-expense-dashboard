import { journeySlug } from '../../utils/expenseDisplay';
import './JourneyChip.css';

export function JourneyChip({ journeyType }: { journeyType: string }) {
  return (
    <span className="journey-chip" data-journey={journeySlug(journeyType)}>
      {journeyType}
    </span>
  );
}
