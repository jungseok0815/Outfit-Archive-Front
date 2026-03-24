import { useState, useEffect, useMemo } from "react";
import BrandAccordion from "../../../components/admin/brand/BrandAccordion";
import BrandInsertAccordion from "../../../components/admin/brand/BrandInsertAccordion";
import Pagination from "../../../components/common/Pagination/Pagination";

const PAGE_SIZE = 10;

const BrandManagementContent = ({ brands, loading, registerTrigger, onRefresh }) => {
    const [insertOpen, setInsertOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(brands.length / PAGE_SIZE));
    const pagedBrands = useMemo(
        () => brands.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [brands, currentPage]
    );

    useEffect(() => {
        if (registerTrigger > 0) {
            setInsertOpen(true);
        }
    }, [registerTrigger]);

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
                <div className="w-full mx-auto space-y-3">
                    {insertOpen && (
                        <BrandInsertAccordion
                            forceOpen={insertOpen}
                            onClose={() => setInsertOpen(false)}
                            onSuccess={() => {
                                setInsertOpen(false);
                                onRefresh();
                            }}
                        />
                    )}
                    {brands.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm border rounded-lg bg-white">
                            등록된 브랜드가 없습니다.
                        </div>
                    ) : (
                        pagedBrands.map((brand) => (
                            <BrandAccordion
                                brand={brand}
                                id={brand.id}
                                key={brand.id}
                                onRefresh={onRefresh}
                            />
                        ))
                    )}
                    {brands.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={brands.length}
                            pageSize={PAGE_SIZE}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BrandManagementContent;
