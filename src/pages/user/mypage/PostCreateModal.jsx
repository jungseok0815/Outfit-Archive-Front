import React, { useState, useRef } from "react";
import "./PostCreateModal.css";

const dummyProducts = [
    { id: 1, brand: "Nike", name: "Air Force 1 '07 Low White", image: "https://via.placeholder.com/60/222222" },
    { id: 2, brand: "Adidas", name: "Samba OG Cloud White", image: "https://via.placeholder.com/60/333333" },
    { id: 3, brand: "New Balance", name: "993 Made in USA Grey", image: "https://via.placeholder.com/60/444444" },
    { id: 4, brand: "Nike", name: "Dunk Low Panda", image: "https://via.placeholder.com/60/555555" },
    { id: 5, brand: "Stussy", name: "Basic Logo Hoodie Black", image: "https://via.placeholder.com/60/666666" },
    { id: 6, brand: "Carhartt WIP", name: "OG Active Jacket", image: "https://via.placeholder.com/60/777777" },
];

function PostCreateModal({ onClose }) {
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [taggedProducts, setTaggedProducts] = useState([]);
    const fileInputRef = useRef(null);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (query.trim() === "") {
            setSearchResults([]);
            return;
        }
        // TODO: 백엔드 API 검색 연동
        const filtered = dummyProducts.filter(
            (p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.brand.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
    };

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
        // TODO: 백엔드 API 연동
        onClose();
    };

    return (
        <div className="post-overlay" onClick={handleOverlayClick}>
            <div className="post-modal">
                <button className="post-close" onClick={onClose}>
                    ✕
                </button>
                <h2>새 게시물</h2>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />

                {/* 이미지 영역 (고정 높이) */}
                <div className="post-image-area">
                    {images.length > 0 ? (
                        <div className="post-preview-grid">
                            {images.map((img, index) => (
                                <div key={index} className="post-preview-item">
                                    <img
                                        className="post-preview-image"
                                        src={img.preview}
                                        alt={`미리보기 ${index + 1}`}
                                    />
                                    <button
                                        className="post-preview-remove"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                className="post-preview-add"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div
                            className="post-upload-zone"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <svg
                                className="post-upload-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p className="post-upload-text">사진을 선택하세요</p>
                            <p className="post-upload-hint">여러 장을 한번에 선택할 수 있습니다</p>
                        </div>
                    )}
                </div>

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
                                    <img src={product.image} alt={product.name} />
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
                                        <img src={product.image} alt={product.name} />
                                        <div className="post-tagged-info">
                                            <span className="post-tagged-brand">{product.brand}</span>
                                            <span className="post-tagged-name">{product.name}</span>
                                        </div>
                                        <button
                                            className="post-tagged-remove"
                                            onClick={() => handleRemoveProduct(product.id)}
                                        >
                                            ✕
                                        </button>
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
                    disabled={images.length === 0}
                >
                    공유하기
                </button>
            </div>
        </div>
    );
}

export default PostCreateModal;
