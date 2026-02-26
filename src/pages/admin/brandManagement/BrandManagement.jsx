import React, { useState, useEffect, useMemo } from 'react';
import BrandManagementSearchbar from "./BrandManagementSearchbar";
import BrandManagementContent from './BrandManagementContent';
import { ListBrand } from '../../../api/admin/brand';
import { ListProduct } from '../../../api/admin/product';

const BrandManagement = ({ registerTrigger }) => {
    const [brands, setBrands] = useState([]);
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const [brandsRes, productsRes] = await Promise.all([
                ListBrand(keyword),
                ListProduct(''),
            ]);
            setBrands(brandsRes.data.content || []);
            setProducts(productsRes.data.content || []);
        } catch (e) {
            console.error('데이터 로딩 실패:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [keyword]);

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
                loading={loading}
                registerTrigger={registerTrigger}
                onRefresh={loadData}
            />
        </div>
    );
};

export default BrandManagement;
