import { useState, useMemo } from 'react';
import { ChevronDown, Edit2, Package, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import BrandItemCard from './BrandItemCard';
import ProductModal from '../../common/Modal/ProductModal';
import { DeleteProduct } from '../../../api/admin/product';
import '../../../pages/admin/brandManagement/BrandManagementContent.css';

const CATEGORY_KOR = {
    TOP: '상의', BOTTOM: '하의', OUTER: '아우터',
    DRESS: '원피스/세트', SHOES: '신발', BAG: '가방',
};

const BrandAccordion = ({ brand, id, onRefresh, isSelected, onToggleSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // 상품 다중 선택
    const [selectedProductIds, setSelectedProductIds] = useState(new Set());
    const [confirmProductDelete, setConfirmProductDelete] = useState(false);
    const [deletingProducts, setDeletingProducts] = useState(false);

    const userForModal = useMemo(() => ({ brandNm: brand.brandNm, brandId: id }), [brand.brandNm, id]);

    const totalStock = brand.products?.reduce((sum, p) => sum + p.productQuantity, 0) || 0;
    const productCount = brand.products?.length || 0;
    const imgUrl = brand.imgPath || null;

    const allProductsSelected = productCount > 0 && brand.products.every(p => selectedProductIds.has(p.id));
    const someProductSelected = selectedProductIds.size > 0;

    const toggleProductSelect = (e, pid) => {
        e.stopPropagation();
        setSelectedProductIds(prev => {
            const next = new Set(prev);
            next.has(pid) ? next.delete(pid) : next.add(pid);
            return next;
        });
    };

    const toggleAllProducts = () => {
        setSelectedProductIds(prev => {
            const next = new Set(prev);
            if (allProductsSelected) {
                brand.products.forEach(p => next.delete(p.id));
            } else {
                brand.products.forEach(p => next.add(p.id));
            }
            return next;
        });
    };

    const handleBulkProductDelete = async () => {
        setDeletingProducts(true);
        try {
            await Promise.all([...selectedProductIds].map(pid => DeleteProduct(pid)));
            toast.success(`${selectedProductIds.size}개 상품이 삭제되었습니다.`);
            setSelectedProductIds(new Set());
            setConfirmProductDelete(false);
            onRefresh();
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        } finally {
            setDeletingProducts(false);
        }
    };

    const selectedProductList = (brand.products || []).filter(p => selectedProductIds.has(p.id));

    return (
        <div className={`border rounded-lg overflow-hidden shadow-sm ${isSelected ? 'ring-2 ring-red-400' : ''}`}>
            {/* 브랜드 헤더 */}
            <div className="w-full flex items-center bg-white hover:bg-gray-50 transition-colors">
                {/* 체크박스 */}
                <div className="pl-4 pr-2 flex items-center" onClick={e => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => onToggleSelect(id)}
                        className="w-4 h-4 rounded accent-gray-800 cursor-pointer"
                    />
                </div>

                {/* 아코디언 토글 버튼 */}
                <button
                    className="flex-1 flex items-center justify-between p-4 pl-1"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-800 font-bold text-sm flex-shrink-0 overflow-hidden border border-gray-200">
                            {imgUrl
                                ? <img src={imgUrl} alt={brand.brandNm} className="w-full h-full object-contain p-1" />
                                : brand.brandNm?.charAt(0)
                            }
                        </div>
                        <div className="text-left">
                            <span className="font-semibold text-gray-800 block">{brand.brandNm}</span>
                            <span className="text-xs text-gray-400">{brand.brandDc}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Package className="w-3.5 h-3.5" />
                            <span>{productCount}개 상품</span>
                        </div>
                        <ChevronDown
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </button>
            </div>

            {/* 확장 영역 */}
            <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-gray-50 border-t">
                    {/* 브랜드 요약 바 */}
                    <div className="flex items-center justify-between px-5 py-3 bg-white border-b">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-xs text-gray-400">총 상품</p>
                                <p className="text-sm font-bold text-gray-800">{productCount}개</p>
                            </div>
                            <div className="w-px h-8 bg-gray-200" />
                            <div className="text-center">
                                <p className="text-xs text-gray-400">총 재고</p>
                                <p className="text-sm font-bold text-gray-800">{totalStock.toLocaleString()}개</p>
                            </div>
                        </div>
                        <button
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            onClick={(e) => { e.stopPropagation(); setShowEditForm(true); }}
                        >
                            <Edit2 className="w-3.5 h-3.5" />
                            브랜드 수정
                        </button>
                    </div>

                    {/* 상품 그리드 */}
                    <div className="p-4">
                        {brand.products && brand.products.length > 0 ? (
                            <>
                                {/* 상품 선택/삭제 액션 바 */}
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={allProductsSelected}
                                            onChange={toggleAllProducts}
                                            className="w-4 h-4 rounded accent-gray-800 cursor-pointer"
                                        />
                                        <span className="text-xs text-gray-500">
                                            {someProductSelected ? `${selectedProductIds.size}개 선택됨` : '전체 선택'}
                                        </span>
                                    </label>
                                    {someProductSelected && (
                                        <button
                                            onClick={() => setConfirmProductDelete(true)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            선택 삭제 ({selectedProductIds.size})
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {brand.products.map((product) => {
                                        const checked = selectedProductIds.has(product.id);
                                        return (
                                            <div
                                                key={product.id}
                                                className={`bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative ${checked ? 'border-red-400 ring-2 ring-red-400' : 'border-gray-200'}`}
                                                onClick={() => { setSelectedProduct(product); setIsProductModalOpen(true); }}
                                            >
                                                {/* 선택 체크박스 오버레이 */}
                                                <div
                                                    className="absolute top-2 right-2 z-10"
                                                    onClick={e => toggleProductSelect(e, product.id)}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => {}}
                                                        className="w-4 h-4 rounded accent-red-500 cursor-pointer"
                                                    />
                                                </div>
                                                <div className="relative h-32 bg-gray-100">
                                                    <img
                                                        src={
                                                            product.images?.length > 0
                                                                ? product.images[0].imgPath
                                                                : `https://placehold.co/400x320/f3f4f6/9ca3af?text=${encodeURIComponent(product.productNm)}`
                                                        }
                                                        alt={product.productNm}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <span className="absolute top-2 left-2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                        {CATEGORY_KOR[product.category] || product.category}
                                                    </span>
                                                </div>
                                                <div className="p-2.5">
                                                    <h4 className="text-sm font-semibold text-gray-800 truncate">{product.productNm}</h4>
                                                    <div className="flex items-center justify-between mt-1.5">
                                                        <span className="text-sm font-bold text-blue-500">
                                                            ₩{product.productPrice?.toLocaleString()}
                                                        </span>
                                                        <span className="text-[11px] text-gray-400">
                                                            재고 {product.productQuantity}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* 상품 추가 버튼 */}
                                    <div
                                        className="bg-white rounded-lg border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center min-h-[180px] cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                                        onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }}
                                    >
                                        <div className="text-center">
                                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">상품 추가</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                등록된 상품이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => { setIsProductModalOpen(false); setSelectedProduct(null); }}
                updateProduct={onRefresh}
                product={selectedProduct}
                user={userForModal}
            />

            {/* 브랜드 수정 모달 */}
            {showEditForm && (
                <div className="brand-modal-overlay" onClick={() => setShowEditForm(false)}>
                    <div className="brand-modal" onClick={e => e.stopPropagation()}>
                        <div className="brand-modal-header">
                            <h3 className="brand-modal-title">브랜드 수정</h3>
                            <button className="brand-modal-close" onClick={() => setShowEditForm(false)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="brand-modal-body">
                            <BrandItemCard
                                brand={brand}
                                onSuccess={() => {
                                    setShowEditForm(false);
                                    onRefresh();
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* 상품 삭제 확인 모달 */}
            {confirmProductDelete && (
                <div className="brand-modal-overlay" onClick={() => !deletingProducts && setConfirmProductDelete(false)}>
                    <div className="brand-delete-confirm" onClick={e => e.stopPropagation()}>
                        <div className="brand-delete-confirm-icon">
                            <Trash2 size={22} />
                        </div>
                        <h3 className="brand-delete-confirm-title">상품 삭제</h3>
                        <p className="brand-delete-confirm-desc">
                            선택한 <strong>{selectedProductIds.size}개</strong> 상품을 삭제합니다.
                            관련 주문·후기·위시리스트가 함께 삭제됩니다.
                        </p>
                        <ul className="brand-delete-confirm-list">
                            {selectedProductList.map(p => (
                                <li key={p.id}>
                                    <span className="brand-delete-confirm-name">{p.productNm}</span>
                                    <span className="brand-delete-confirm-count">재고 {p.productQuantity}개</span>
                                </li>
                            ))}
                        </ul>
                        <p className="brand-delete-confirm-warn">이 작업은 되돌릴 수 없습니다.</p>
                        <div className="brand-delete-confirm-actions">
                            <button
                                className="brand-delete-cancel-btn"
                                onClick={() => setConfirmProductDelete(false)}
                                disabled={deletingProducts}
                            >
                                취소
                            </button>
                            <button
                                className="brand-delete-ok-btn"
                                onClick={handleBulkProductDelete}
                                disabled={deletingProducts}
                            >
                                {deletingProducts ? '삭제 중...' : '삭제'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandAccordion;
