interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

const styles = `
  .pagination { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
  .pagination-info { font-size: 13px; color: #64748b; }
  .pagination-btns { display: flex; gap: 4px; }
  .pagination-btn {
    min-width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
    border: 1px solid #e2e8f0; background: #fff; border-radius: 8px; font-size: 13px;
    font-weight: 600; color: #475569; cursor: pointer; transition: all 0.15s;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .pagination-btn:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
  .pagination-btn.active { background: #6366f1; color: #fff; border-color: #6366f1; }
  .pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;

export default function Pagination({ page, totalPages, total, hasNext, hasPrev, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="pagination">
        <div className="pagination-info">
          Toplam {total} kayıt
        </div>
        <div className="pagination-btns">
          <button className="pagination-btn" disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>
            ←
          </button>
          {pages.map((p, i) =>
            p === '...' ? (
              <span key={`e${i}`} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
            ) : (
              <button
                key={p}
                className={`pagination-btn${p === page ? ' active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
          )}
          <button className="pagination-btn" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>
            →
          </button>
        </div>
      </div>
    </>
  );
}
