import { useState, useEffect, useRef } from "react";
import { X, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import BrandAccordion from "../../../components/admin/brand/BrandAccordion";
import BrandItemCard from "../../../components/admin/brand/BrandItemCard";
import Pagination from "../../../components/common/Pagination/Pagination";
import { DeleteBrand } from "../../../api/admin/brand";
import "./BrandManagementContent.css";

const BrandManagementContent = ({
    brands, loading, registerTrigger, onRefresh,
    currentPage, totalPages, totalCount, pageSize, onPageChange,
}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const isMounted = useRef(false);

    const allPageSelected = brands.length > 0 && brands.every(b => selectedIds.has(b.id));
    const someSelected = selectedIds.size > 0;

    useEffect(() => {
        if (!isMounted.current) { isMounted.current = true; return; }
        if (registerTrigger > 0) setModalOpen(true);
    }, [registerTrigger]);

    // 페이지 이동 시 선택 초기화
    useEffect(() => {
        setSelectedIds(new Set());
    }, [currentPage]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllPage = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allPageSelected) {
                brands.forEach(b => next.delete(b.id));
            } else {
                brands.forEach(b => next.add(b.id));
            }
            return next;
        });
    };

    const handleBulkDelete = async () => {
        setDeleting(true);
        try {
            await Promise.all([...selectedIds].map(id => DeleteBrand(id)));
            toast.success(`${selectedIds.size}개 브랜드가 삭제되었습니다.`);
            setSelectedIds(new Set());
            setConfirmDelete(false);
            onRefresh();
        } catch {
            toast.error("삭제 중 오류가 발생했습니다.");
        } finally {
            setDeleting(false);
        }
    };

    const selectedBrands = brands.filter(b => selectedIds.has(b.id));
    const totalProductCount = selectedBrands.reduce((sum, b) => sum + (b.products?.length || 0), 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16">
                <span className="text-gray-400 text-sm">로딩 중...</span>
            </div>
        );
    }

    return (
        <div className="productManagerContent overflow-scroll px-[20px] scrollbar-hide">
            <div className="container mx-auto px-4 py-7">
                <h2 className="text-xl font-bold text-gray-500 mb-6">브랜드 & 상품 목록</h2>

                {/* 선택/삭제 액션 바 */}
                {brands.length > 0 && (
                    <div className="flex items-center justify-between mb-4 px-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={allPageSelected}
                                onChange={toggleAllPage}
                                className="w-4 h-4 rounded accent-gray-800 cursor-pointer"
                            />
                            <span className="text-sm text-gray-500">
                                {someSelected ? `${selectedIds.size}개 선택됨` : "전체 선택"}
                            </span>
                        </label>

                        {someSelected && (
                            <button
                                onClick={() => setConfirmDelete(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                선택 삭제 ({selectedIds.size})
                            </button>
                        )}
                    </div>
                )}

                <div className="w-full mx-auto space-y-3">
                    {brands.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
                            등록된 브랜드가 없습니다.
                        </div>
                    ) : (
                        brands.map((brand) => (
                            <BrandAccordion
                                brand={brand}
                                id={brand.id}
                                key={brand.id}
                                onRefresh={onRefresh}
                                isSelected={selectedIds.has(brand.id)}
                                onToggleSelect={toggleSelect}
                            />
                        ))
                    )}

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            pageSize={pageSize}
                            onPageChange={onPageChange}
                        />
                    )}
                </div>
            </div>

            {/* 브랜드 등록 모달 */}
            {modalOpen && (
                <div className="brand-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="brand-modal" onClick={e => e.stopPropagation()}>
                        <div className="brand-modal-header">
                            <h3 className="brand-modal-title">브랜드 등록</h3>
                            <button className="brand-modal-close" onClick={() => setModalOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="brand-modal-body">
                            <BrandItemCard onSuccess={() => { setModalOpen(false); onRefresh(); }} />
                        </div>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {confirmDelete && (
                <div className="brand-modal-overlay" onClick={() => !deleting && setConfirmDelete(false)}>
                    <div className="brand-delete-confirm" onClick={e => e.stopPropagation()}>
                        <div className="brand-delete-confirm-icon">
                            <Trash2 size={22} />
                        </div>
                        <h3 className="brand-delete-confirm-title">브랜드 삭제</h3>
                        <p className="brand-delete-confirm-desc">
                            선택한 <strong>{selectedIds.size}개</strong> 브랜드를 삭제합니다.
                            {totalProductCount > 0 && (
                                <> 소속 상품 <strong>{totalProductCount}개</strong> 및 관련 주문·후기·위시리스트가 함께 삭제됩니다.</>
                            )}
                        </p>
                        <ul className="brand-delete-confirm-list">
                            {selectedBrands.map(b => (
                                <li key={b.id}>
                                    <span className="brand-delete-confirm-name">{b.brandNm}</span>
                                    <span className="brand-delete-confirm-count">상품 {b.products?.length || 0}개</span>
                                </li>
                            ))}
                        </ul>
                        <p className="brand-delete-confirm-warn">이 작업은 되돌릴 수 없습니다.</p>
                        <div className="brand-delete-confirm-actions">
                            <button
                                className="brand-delete-cancel-btn"
                                onClick={() => setConfirmDelete(false)}
                                disabled={deleting}
                            >
                                취소
                            </button>
                            <button
                                className="brand-delete-ok-btn"
                                onClick={handleBulkDelete}
                                disabled={deleting}
                            >
                                {deleting ? "삭제 중..." : "삭제"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandManagementContent;
