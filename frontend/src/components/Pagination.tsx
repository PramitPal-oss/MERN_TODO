import type { Meta } from "../types/api";
export function Pagination({ meta, onPage }: { meta: Meta | null; onPage: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null;
  return <nav className="pagination" aria-label="Pagination"><button className="button ghost" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</button><span>Page {meta.page} of {meta.totalPages}</span><button className="button ghost" disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>Next</button></nav>;
}
