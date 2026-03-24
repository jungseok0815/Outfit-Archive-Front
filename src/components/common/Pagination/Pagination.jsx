import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange }) => {
    if (totalPages <= 0) return null;

    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * pageSize + 1;
    const end = Math.min(safePage * pageSize, totalCount);

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startP = Math.max(1, safePage - Math.floor(maxVisible / 2));
        let endP = startP + maxVisible - 1;
        if (endP > totalPages) { endP = totalPages; startP = Math.max(1, endP - maxVisible + 1); }
        for (let i = startP; i <= endP; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="admin-pagination">
            <div className="admin-pagination-info">
                총 <strong>{totalCount}</strong>건 중 <strong>{start}–{end}</strong>건
            </div>
            <div className="admin-pagination-controls">
                <button className="admin-page-btn admin-page-arrow" disabled={safePage <= 1} onClick={() => onPageChange(1)}>
                    <ChevronLeft size={15} /><ChevronLeft size={15} className="admin-page-double" />
                </button>
                <button className="admin-page-btn admin-page-arrow" disabled={safePage <= 1} onClick={() => onPageChange(safePage - 1)}>
                    <ChevronLeft size={15} />
                </button>
                {getPageNumbers().map(num => (
                    <button key={num} className={`admin-page-btn ${safePage === num ? 'active' : ''}`} onClick={() => onPageChange(num)}>
                        {num}
                    </button>
                ))}
                <button className="admin-page-btn admin-page-arrow" disabled={safePage >= totalPages} onClick={() => onPageChange(safePage + 1)}>
                    <ChevronRight size={15} />
                </button>
                <button className="admin-page-btn admin-page-arrow" disabled={safePage >= totalPages} onClick={() => onPageChange(totalPages)}>
                    <ChevronRight size={15} /><ChevronRight size={15} className="admin-page-double" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
