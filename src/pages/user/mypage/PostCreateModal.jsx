import React, { useState, useRef, useCallback } from "react";
import "./PostCreateModal.css";
import { ListProduct } from '../../../api/user/product';
import { InsertPost } from '../../../api/user/post';

const IMG_BASE = 'http://localhost:8080/api/img/get?imgNm=';

function PostCreateModal({ onClose, onSuccess }) {
    const [images, setImages] = useState([]);
    const [title, setTitle] = useState("");
    const [caption, setCaption] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [taggedProducts, setTaggedProducts] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const searchTimerRef = useRef(null);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
        setImages((prev) => [...prev, ...newImages]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }
        searchTimerRef.current = setTimeout(() => {
            ListProduct(query, 0, 10)
                .then(res => {
                    const items = res.data.content || [];
                    setSearchResults(items.map(p => ({
                        id: p.id,
                        brand: p.brandNm,
                        name: p.productNm,
                        image: p.images?.length > 0 ? `${IMG_BASE}${p.images[0].imgNm}` : '',
                    })));
                })
                .catch(() => setSearchResults([]));
        }, 300);
    }, []);

    const handleAddProduct = (product) => {
        if (taggedProducts.some((p) => p.id === product.id)) return;
        setTaggedProducts((prev) => [...prev, product]);
        setSearchQuery("");
        setSearchResults([]);
    };

    const handleRemoveProduct = (productId) => {
        setTaggedProducts((prev) => prev.filter((p) => p.id !== productId));
    };

    const handleSubmit = () => {
        if (images.length === 0 || !title.trim()) return;
        setSubmitting(true);
        const fd = new FormData();
        fd.append('title', title.trim());
        fd.append('content', caption.trim());
        images.forEach(img => fd.append('images', img.file));

        InsertPost(fd)
            .then(() => {
                if (onSuccess) onSuccess();
                onClose();
            })
            .catch(err => {
                const msg = err.response?.data?.msg || '게시물 등록에 실패했습니다.';
                alert(msg);
            })
            .finally(() => setSubmitting(false));
    };

    return (
        <div className="post-overlay" onClick={handleOverlayClick}>
            <div className="post-modal">
                <button className="post-close" onClick={onClose}>✕</button>
                <h2>새 게시물</h2>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* 이미지 영역 */}
                <div className="post-image-area">
                    {images.length > 0 ? (
                        <div className="post-preview-grid">
                            {images.map((img, index) => (
                                <div key={index} className="post-preview-item">
                                    <img className="post-preview-image" src={img.preview} alt={`미리보기 ${index + 1}`} />
                                    <button className="post-preview-remove" onClick={() => handleRemoveImage(index)}>✕</button>
                                </div>
                            ))}
                            <button className="post-preview-add" onClick={() => fileInputRef.current?.click()}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="post-upload-zone" onClick={() => fileInputRef.current?.click()}>
                            <svg className="post-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="post-upload-text">사진을 선택하세요</p>
                            <p className="post-upload-hint">여러 장을 한번에 선택할 수 있습니다</p>
                        </div>
                    )}
                </div>

                {/* 제목 입력 */}
                <input
                    className="post-caption"
                    type="text"
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginBottom: 8 }}
                />

                {/* 상품 검색 */}
                <div className="post-product-search">
                    <div className="post-search-input-wrap">
                        <svg className="post-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <input
                            className="post-search-input"
                            type="text"
                            placeholder="착용 상품 검색 (브랜드, 상품명)"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    {searchResults.length > 0 && (
                        <ul className="post-search-results">
                            {searchResults.map((product) => (
                                <li key={product.id} onClick={() => handleAddProduct(product)}>
                                    {product.image && <img src={product.image} alt={product.name} />}
                                    <div className="post-search-result-info">
                                        <span className="post-search-result-brand">{product.brand}</span>
                                        <span className="post-search-result-name">{product.name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="post-tagged-area">
                        {taggedProducts.length > 0 ? (
                            <div className="post-tagged-products">
                                {taggedProducts.map((product) => (
                                    <div key={product.id} className="post-tagged-item">
                                        {product.image && <img src={product.image} alt={product.name} />}
                                        <div className="post-tagged-info">
                                            <span className="post-tagged-brand">{product.brand}</span>
                                            <span className="post-tagged-name">{product.name}</span>
                                        </div>
                                        <button className="post-tagged-remove" onClick={() => handleRemoveProduct(product.id)}>✕</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="post-tagged-empty">검색하여 착용 상품을 추가하세요</p>
                        )}
                    </div>
                </div>

                <textarea
                    className="post-caption"
                    placeholder="문구 입력..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                />

                <button
                    className="post-submit-btn"
                    onClick={handleSubmit}
                    disabled={images.length === 0 || !title.trim() || submitting}
                >
                    {submitting ? '업로드 중...' : '공유하기'}
                </button>
            </div>
        </div>
    );
}

export default PostCreateModal;
