import { useState, useEffect, useMemo } from 'react';
import BrandManagementSearchbar from "./BrandManagementSearchbar";
import BrandManagementContent from './BrandManagementContent';
import { ListBrand } from '../../../api/admin/brand';
import { ListProduct } from '../../../api/admin/product';

const PAGE_SIZE = 10;

const BrandManagement = ({ registerTrigger }) => {
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(0);           // 0-indexed (백엔드 기준)
    const [totalPages, setTotalPages] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [initialLoading, setInitialLoading] = useState(true);

    // 브랜드만 로드 (페이지·키워드 이동 시)
    const loadBrands = async (isRefresh = false) => {
        if (!isRefresh) setInitialLoading(true);
        try {
            const res = await ListBrand(keyword, page, PAGE_SIZE);
            setBrands(res.data.content || []);
            setTotalPages(res.data.totalPages ?? 0);
            setTotalCount(res.data.totalElements ?? 0);
        } catch (e) {
        } finally {
            if (!isRefresh) setInitialLoading(false);
        }
    };

    // 상품만 로드 (최초 1회 + 명시적 갱신 시)
    const loadProducts = async () => {
        try {
            const res = await ListProduct('', 0, 10000);
            setProducts(res.data.content || []);
        } catch (e) {}
    };

    // 전체 갱신 (브랜드 추가·삭제 후 호출)
    const handleRefresh = () => {
        loadBrands(true);
        loadProducts();
    };

    // 키워드 바뀌면 1페이지로 리셋
    useEffect(() => {
        setPage(0);
    }, [keyword]);

    // 페이지·키워드 변경 시 브랜드만 재요청
    useEffect(() => {
        loadBrands();
    }, [keyword, page]);

    // 상품은 최초 1회만 로드
    useEffect(() => {
        loadProducts();
    }, []);

    // 브랜드별 상품 그룹핑
    const brandsWithProducts = useMemo(() => {
        const productMap = products.reduce((acc, product) => {
            const bid = product.brandId;
            if (!acc[bid]) acc[bid] = [];
            acc[bid].push(product);
            return acc;
        }, {});
        return brands.map(brand => ({
            ...brand,
            products: productMap[brand.id] || [],
        }));
    }, [brands, products]);

    return (
        <div>
            <BrandManagementSearchbar keyword={keyword} setKeyword={setKeyword} />
            <BrandManagementContent
                brands={brandsWithProducts}
                loading={initialLoading}
                registerTrigger={registerTrigger}
                onRefresh={handleRefresh}
                currentPage={page + 1}           // 1-indexed (Pagination 컴포넌트 기준)
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setPage(p - 1)} // 1-indexed → 0-indexed
            />
        </div>
    );
};

export default BrandManagement;
