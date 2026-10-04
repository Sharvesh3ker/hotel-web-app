import React from "react";
import { useNavigate } from "react-router-dom";

export default function Pagination({ page, pages, onChange, basePath = "/page" }) {
  const navigate = useNavigate();
  const totalPages = Math.max(pages || 1, 1);

  const handlePageClick = (p) => {
    if (p < 1 || p > totalPages) return;
    if (onChange) onChange(p);
    navigate(`${basePath}/${p}`);
  };

  return (
    <div className="pagination-wrap">
      <div className="pagination-title breeze-condensed">BROWSE CATALOG PAGES</div>
      <div className="pagination">
        <button
          className="btn-page-nav breeze-bold btn-contained-xs"
          disabled={page === 1}
          onClick={() => handlePageClick(page - 1)}
          aria-label="Previous Page"
        >
          ← Prev
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
          <button
            key={n}
            className={`btn-page-num breeze-bold btn-contained-xs ${n === page ? "active" : ""}`}
            onClick={() => handlePageClick(n)}
          >
            Page {n}
          </button>
        ))}

        <button
          className="btn-page-nav breeze-bold btn-contained-xs"
          disabled={page >= totalPages}
          onClick={() => handlePageClick(page + 1)}
          aria-label="Next Page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}