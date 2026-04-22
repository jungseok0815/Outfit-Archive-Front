import { useState, useEffect, useMemo } from 'react';
import { X, Search, Zap, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-toastify';
import { ListBrand } from '../../../api/admin/brand';
import { ListKeyword } from '../../../api/admin/keyword';
import { CollectProducts } from '../../../api/admin/product';
import './AutoCollectModal.css';

const AutoCollectModal = ({ onClose }) => {
    const [allBrands, setAllBrands] = useState([]);
    const [allKeywords, setAllKeywords] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [loadingKeywords, setLoadingKeywords] = useState(true);
    const [brandSearch, setBrandSearch] = useState('');
    const [selectedBrandIds, setSelectedBrandIds] = useState(new Set());
    const [selectedKeywordIds, setSelectedKeywordIds] = useState(new Set());
    const [collecting, setCollecting] = useState(false);

    useEffect(() => {
        ListBrand('', 0, 10000)
            .then(res => setAllBrands(res.data.content || []))
            .catch(() => toast.error('브랜드 목록을 불러오지 못했습니다.'))
            .finally(() => setLoadingBrands(false));

        ListKeyword()
            .then(res => setAllKeywords((res.data || []).filter(k => k.active)))
            .catch(() => toast.error('키워드 목록을 불러오지 못했습니다.'))
            .finally(() => setLoadingKeywords(false));
    }, []);

    const filteredBrands = useMemo(() => {
        const kw = brandSearch.trim().toLowerCase();
        if (!kw) return allBrands;
        return allBrands.filter(b => b.brandNm?.toLowerCase().includes(kw));
    }, [allBrands, brandSearch]);

    const allBrandsSelected = filteredBrands.length > 0 && filteredBrands.every(b => selectedBrandIds.has(b.id));
    const allKeywordsSelected = allKeywords.length > 0 && allKeywords.every(k => selectedKeywordIds.has(k.id));

    const toggleBrand = (id) => {
        setSelectedBrandIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllBrands = () => {
        setSelectedBrandIds(prev => {
            const next = new Set(prev);
            if (allBrandsSelected) {
                filteredBrands.forEach(b => next.delete(b.id));
            } else {
                filteredBrands.forEach(b => next.add(b.id));
            }
            return next;
        });
    };

    const toggleKeyword = (id) => {
        setSelectedKeywordIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAllKeywords = () => {
        if (allKeywordsSelected) {
            setSelectedKeywordIds(new Set());
        } else {
            setSelectedKeywordIds(new Set(allKeywords.map(k => k.id)));
        }
    };

    const handleCollect = async () => {
        if (selectedBrandIds.size === 0) {
            toast.warn('수집할 브랜드를 선택해주세요.');
            return;
        }
        setCollecting(true);
        try {
            await CollectProducts([...selectedBrandIds], [...selectedKeywordIds]);
            const keywordMsg = selectedKeywordIds.size > 0
                ? `, 키워드 ${selectedKeywordIds.size}개`
                : ' (카테고리 기반)';
            toast.success(`브랜드 ${selectedBrandIds.size}개${keywordMsg} 수집이 시작되었습니다.`);
            onClose();
        } catch {
            toast.error('수집 요청 중 오류가 발생했습니다.');
        } finally {
            setCollecting(false);
        }
    };

    return (
        <div className="acm-overlay" onClick={onClose}>
            <div className="acm-modal" onClick={e => e.stopPropagation()}>
                {/* 헤더 */}
                <div className="acm-header">
                    <div className="acm-header-left">
                        <div className="acm-header-icon">
                            <Zap size={16} />
                        </div>
                        <div>
                            <h3 className="acm-title">자동 상품 수집</h3>
                            <p className="acm-subtitle">브랜드와 키워드를 선택하면 네이버 쇼핑 데이터 기반으로 상품이 자동 등록됩니다.</p>
                        </div>
                    </div>
                    <button className="acm-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* 브랜드 섹션 */}
                <div className="acm-section">
                    <div className="acm-section-header">
                        <span className="acm-section-title">브랜드 선택</span>
                        <span className="acm-section-count">{selectedBrandIds.size}/{allBrands.length}</span>
                    </div>
                    <div className="acm-toolbar">
                        <div className="acm-search-wrap">
                            <Search size={14} className="acm-search-icon" />
                            <input
                                className="acm-search"
                                placeholder="브랜드명 검색"
                                value={brandSearch}
                                onChange={e => setBrandSearch(e.target.value)}
                            />
                        </div>
                        <button className="acm-toggle-all" onClick={toggleAllBrands}>
                            {allBrandsSelected
                                ? <CheckSquare size={15} className="acm-check-icon checked" />
                                : <Square size={15} className="acm-check-icon" />
                            }
                            {allBrandsSelected ? '전체 해제' : '전체 선택'}
                        </button>
                    </div>
                    <div className="acm-list">
                        {loadingBrands ? (
                            <div className="acm-empty">불러오는 중...</div>
                        ) : filteredBrands.length === 0 ? (
                            <div className="acm-empty">검색 결과가 없습니다.</div>
                        ) : (
                            filteredBrands.map(brand => {
                                const checked = selectedBrandIds.has(brand.id);
                                return (
                                    <div
                                        key={brand.id}
                                        className={`acm-item ${checked ? 'selected' : ''}`}
                                        onClick={() => toggleBrand(brand.id)}
                                    >
                                        <div className="acm-item-thumb">
                                            {brand.imgPath
                                                ? <img src={brand.imgPath} alt={brand.brandNm} />
                                                : <span>{brand.brandNm?.charAt(0)}</span>
                                            }
                                        </div>
                                        <div className="acm-item-info">
                                            <span className="acm-item-name">{brand.brandNm}</span>
                                            {brand.brandDc && <span className="acm-item-desc">{brand.brandDc}</span>}
                                        </div>
                                        <div className={`acm-item-checkbox ${checked ? 'checked' : ''}`}>
                                            {checked && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* 구분선 */}
                <div className="acm-divider" />

                {/* 키워드 섹션 */}
                <div className="acm-section acm-keyword-section">
                    <div className="acm-section-header">
                        <span className="acm-section-title">키워드 선택</span>
                        <span className="acm-section-count">{selectedKeywordIds.size}/{allKeywords.length}</span>
                        {allKeywords.length > 0 && (
                            <button className="acm-toggle-all acm-keyword-toggle" onClick={toggleAllKeywords}>
                                {allKeywordsSelected
                                    ? <CheckSquare size={14} className="acm-check-icon checked" />
                                    : <Square size={14} className="acm-check-icon" />
                                }
                                {allKeywordsSelected ? '전체 해제' : '전체 선택'}
                            </button>
                        )}
                    </div>
                    <div className="acm-keyword-list">
                        {loadingKeywords ? (
                            <span className="acm-keyword-empty">불러오는 중...</span>
                        ) : allKeywords.length === 0 ? (
                            <span className="acm-keyword-empty">등록된 키워드가 없습니다. 카테고리 기반으로 수집됩니다.</span>
                        ) : (
                            allKeywords.map(kw => {
                                const checked = selectedKeywordIds.has(kw.id);
                                return (
                                    <button
                                        key={kw.id}
                                        className={`acm-keyword-chip ${checked ? 'selected' : ''}`}
                                        onClick={() => toggleKeyword(kw.id)}
                                    >
                                        {kw.keyword}
                                        {kw.categoryName && <span className="acm-keyword-cat">{kw.categoryName}</span>}
                                    </button>
                                );
                            })
                        )}
                    </div>
                    {allKeywords.length > 0 && selectedKeywordIds.size === 0 && (
                        <p className="acm-keyword-hint">키워드를 선택하지 않으면 카테고리 기반으로 수집됩니다.</p>
                    )}
                </div>

                {/* 푸터 */}
                <div className="acm-footer">
                    <span className="acm-footer-count">
                        {selectedBrandIds.size > 0 ? (
                            <>
                                <strong>{selectedBrandIds.size}</strong>개 브랜드
                                {selectedKeywordIds.size > 0
                                    ? <>, <strong>{selectedKeywordIds.size}</strong>개 키워드 선택됨</>
                                    : ' 선택됨'
                                }
                            </>
                        ) : '브랜드를 선택해주세요'}
                    </span>
                    <div className="acm-footer-actions">
                        <button className="acm-cancel-btn" onClick={onClose} disabled={collecting}>취소</button>
                        <button
                            className="acm-collect-btn"
                            onClick={handleCollect}
                            disabled={collecting || selectedBrandIds.size === 0}
                        >
                            <Zap size={14} />
                            {collecting ? '수집 중...' : `수집 시작 (${selectedBrandIds.size})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoCollectModal;
