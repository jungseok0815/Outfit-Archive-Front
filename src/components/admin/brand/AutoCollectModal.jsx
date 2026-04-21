import { useState, useEffect, useMemo } from 'react';
import { X, Search, Zap, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-toastify';
import { ListBrand } from '../../../api/admin/brand';
import { CollectProducts } from '../../../api/admin/product';
import './AutoCollectModal.css';

const AutoCollectModal = ({ onClose }) => {
    const [allBrands, setAllBrands] = useState([]);
    const [loadingBrands, setLoadingBrands] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [collecting, setCollecting] = useState(false);

    useEffect(() => {
        ListBrand('', 0, 10000)
            .then(res => setAllBrands(res.data.content || []))
            .catch(() => toast.error('브랜드 목록을 불러오지 못했습니다.'))
            .finally(() => setLoadingBrands(false));
    }, []);

    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        if (!kw) return allBrands;
        return allBrands.filter(b => b.brandNm?.toLowerCase().includes(kw));
    }, [allBrands, keyword]);

    const allSelected = filtered.length > 0 && filtered.every(b => selectedIds.has(b.id));

    const toggleOne = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                filtered.forEach(b => next.delete(b.id));
            } else {
                filtered.forEach(b => next.add(b.id));
            }
            return next;
        });
    };

    const handleCollect = async () => {
        if (selectedIds.size === 0) {
            toast.warn('수집할 브랜드를 선택해주세요.');
            return;
        }
        setCollecting(true);
        try {
            await CollectProducts([...selectedIds]);
            toast.success(`${selectedIds.size}개 브랜드 자동 상품 수집이 시작되었습니다.`);
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
                            <p className="acm-subtitle">수집할 브랜드를 선택하면 네이버 쇼핑 데이터 기반으로 상품이 자동 등록됩니다.</p>
                        </div>
                    </div>
                    <button className="acm-close" onClick={onClose}><X size={16} /></button>
                </div>

                {/* 검색 + 전체 선택 */}
                <div className="acm-toolbar">
                    <div className="acm-search-wrap">
                        <Search size={14} className="acm-search-icon" />
                        <input
                            className="acm-search"
                            placeholder="브랜드명 검색"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />
                    </div>
                    <button className="acm-toggle-all" onClick={toggleAll}>
                        {allSelected
                            ? <CheckSquare size={15} className="acm-check-icon checked" />
                            : <Square size={15} className="acm-check-icon" />
                        }
                        {allSelected ? '전체 해제' : '전체 선택'}
                    </button>
                </div>

                {/* 브랜드 목록 */}
                <div className="acm-list">
                    {loadingBrands ? (
                        <div className="acm-empty">불러오는 중...</div>
                    ) : filtered.length === 0 ? (
                        <div className="acm-empty">검색 결과가 없습니다.</div>
                    ) : (
                        filtered.map(brand => {
                            const checked = selectedIds.has(brand.id);
                            return (
                                <div
                                    key={brand.id}
                                    className={`acm-item ${checked ? 'selected' : ''}`}
                                    onClick={() => toggleOne(brand.id)}
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

                {/* 푸터 */}
                <div className="acm-footer">
                    <span className="acm-footer-count">
                        {selectedIds.size > 0
                            ? <><strong>{selectedIds.size}</strong>개 브랜드 선택됨</>
                            : '브랜드를 선택해주세요'
                        }
                    </span>
                    <div className="acm-footer-actions">
                        <button className="acm-cancel-btn" onClick={onClose} disabled={collecting}>취소</button>
                        <button
                            className="acm-collect-btn"
                            onClick={handleCollect}
                            disabled={collecting || selectedIds.size === 0}
                        >
                            <Zap size={14} />
                            {collecting ? '수집 중...' : `수집 시작 (${selectedIds.size})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AutoCollectModal;
