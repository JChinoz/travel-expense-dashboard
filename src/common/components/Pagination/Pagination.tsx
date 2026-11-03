import type { ReactNode } from 'react';
import './Pagination.css';

interface PaginationProps {
  summary: ReactNode;
  /** 1-based current page. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Show "Page x / y" between the buttons. */
  showPageIndicator?: boolean;
}

export function Pagination({ summary, page, pageCount, onPageChange, showPageIndicator = true }: PaginationProps) {
  return (
    <div className="pagination">
      <span className="pagination__summary">{summary}</span>
      <div className="pagination__actions">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ← Previous
        </button>
        {showPageIndicator && (
          <span>
            Page {page} / {pageCount}
          </span>
        )}
        <button type="button" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
