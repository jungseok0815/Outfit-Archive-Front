import React, { useState, useRef } from "react";
import "./PostCreateModal.css";

function PostCreateModal({ onClose }) {
    const [images, setImages] = useState([]);
    const [caption, setCaption] = useState("");
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

                {images.length > 0 && (
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
                )}

                {images.length === 0 && (
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
