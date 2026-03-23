import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Upload, X, Eye } from 'lucide-react';
import { ListBanner, InsertBanner, UpdateBanner, DeleteBanner } from '../../../api/admin/banner';
import { toast } from 'react-toastify';
import './BannerManagement.css';

const EMPTY_FORM = { title: '', highlight: '', description: '', buttonText: '', sortOrder: 1, active: true };

/* 배너 미리보기 모달 */
const BannerPreviewModal = ({ banner, onClose }) => {
    if (!banner) return null;
    return (
        <div className="banner-preview-overlay" onClick={onClose}>
            <div className="banner-preview-modal" onClick={e => e.stopPropagation()}>
                <div className="banner-preview-header">
                    <span className="banner-preview-label">배너 미리보기</span>
                    <button className="banner-preview-close" onClick={onClose}><X size={18} /></button>
                </div>
                <div
                    className={`banner-preview-hero ${banner.imgPath ? 'has-image' : ''}`}
                    style={banner.imgPath ? {
                        backgroundImage: `url(${banner.imgPath})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    } : {}}
                >
                    {banner.imgPath && <div className="banner-preview-overlay-dim" />}
                    <div className="banner-preview-content">
                        <h1 className="banner-preview-title">
                            {banner.title}{banner.highlight && <> <em>{banner.highlight}</em></>}
                        </h1>
                        {banner.description && <p className="banner-preview-desc">{banner.description}</p>}
                        {banner.buttonText && <button className="banner-preview-btn">{banner.buttonText}</button>}
                    </div>
                    <div className="banner-preview-dots">
                        <span className="banner-preview-dot active" />
                        <span className="banner-preview-dot" />
                        <span className="banner-preview-dot" />
                    </div>
                </div>
                <p className="banner-preview-hint">실제 메인 페이지에서 보여지는 모습입니다.</p>
            </div>
        </div>
    );
};

const BannerManagement = ({ registerTrigger }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [previewBanner, setPreviewBanner] = useState(null);
    const fileInputRef = useRef(null);

    const load = () => {
        setLoading(true);
        ListBanner()
            .then(res => setBanners(res.data || []))
            .catch(() => toast.error('배너 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        if (registerTrigger > 0) openAdd();
    }, [registerTrigger]);

    const openAdd = () => {
        setEditTarget(null);
        setForm(EMPTY_FORM);
        setImageFile(null);
        setImagePreview(null);
        setShowForm(true);
    };

    const openEdit = (banner) => {
        setEditTarget(banner);
        setForm({
            title: banner.title || '',
            highlight: banner.highlight || '',
            description: banner.description || '',
            buttonText: banner.buttonText || '',
            sortOrder: banner.sortOrder ?? 1,
            active: banner.active ?? true,
        });
        setImageFile(null);
        setImagePreview(banner.imgPath || null);
        setShowForm(true);
    };

    const handleImageSelect = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            toast.error('이미지 파일만 업로드할 수 있습니다.');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) handleImageSelect(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleImageSelect(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSave = () => {
        if (!form.title.trim()) { toast.error('제목을 입력해주세요.'); return; }
        setSaving(true);
        const req = editTarget
            ? UpdateBanner({ ...form, id: editTarget.id }, imageFile)
            : InsertBanner(form, imageFile);
        req
            .then(() => {
                toast.success(editTarget ? '배너가 수정되었습니다.' : '배너가 등록되었습니다.');
                setShowForm(false);
                load();
            })
            .catch(() => toast.error('저장에 실패했습니다.'))
            .finally(() => setSaving(false));
    };

    const handleDelete = (id) => {
        if (!window.confirm('이 배너를 삭제하시겠습니까?')) return;
        DeleteBanner(id)
            .then(() => { toast.success('배너가 삭제되었습니다.'); load(); })
            .catch(() => toast.error('삭제에 실패했습니다.'));
    };

    /* 폼 상태를 미리보기로 표시 */
    const handleFormPreview = () => {
        setPreviewBanner({ ...form, imgPath: imagePreview });
    };

    return (
        <div className="banner-mgmt">
            <div className="banner-mgmt-toolbar">
                <span className="banner-mgmt-count">전체 배너 {banners.length}개</span>
            </div>

            {showForm && (
                <div className="banner-mgmt-form-card">
                    <div className="banner-mgmt-form-top">
                        <h3 className="banner-mgmt-form-title">{editTarget ? '배너 수정' : '배너 등록'}</h3>
                        <button className="banner-mgmt-preview-btn" onClick={handleFormPreview} type="button">
                            <Eye size={14} />
                            미리보기
                        </button>
                    </div>

                    <div className="banner-mgmt-form-body">
                        {/* 이미지 업로드 */}
                        <div className="banner-mgmt-image-section">
                            <span className="banner-mgmt-field-label">배너 이미지</span>
                            {imagePreview ? (
                                <div className="banner-mgmt-image-preview-wrap">
                                    <img src={imagePreview} alt="preview" className="banner-mgmt-image-preview" />
                                    <button className="banner-mgmt-image-remove" onClick={removeImage} type="button">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className={`banner-mgmt-dropzone ${dragOver ? 'drag-over' : ''}`}
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                >
                                    <Upload size={24} className="banner-mgmt-dropzone-icon" />
                                    <p className="banner-mgmt-dropzone-text">클릭하거나 이미지를 드래그하세요</p>
                                    <p className="banner-mgmt-dropzone-hint">JPG, PNG, WEBP</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* 텍스트 필드 */}
                        <div className="banner-mgmt-form-grid">
                            <div className="banner-mgmt-field">
                                <label>제목</label>
                                <input
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="예) Define Your"
                                />
                            </div>
                            <div className="banner-mgmt-field">
                                <label>강조 텍스트</label>
                                <input
                                    value={form.highlight}
                                    onChange={e => setForm(p => ({ ...p, highlight: e.target.value }))}
                                    placeholder="예) Style"
                                />
                            </div>
                            <div className="banner-mgmt-field banner-mgmt-field--full">
                                <label>설명</label>
                                <input
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="배너 설명 텍스트"
                                />
                            </div>
                            <div className="banner-mgmt-field">
                                <label>버튼 텍스트</label>
                                <input
                                    value={form.buttonText}
                                    onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))}
                                    placeholder="예) Explore Now"
                                />
                            </div>
                            <div className="banner-mgmt-field">
                                <label>순서</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.sortOrder}
                                    onChange={e => setForm(p => ({ ...p, sortOrder: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="banner-mgmt-field">
                                <label>활성화</label>
                                <label className="banner-mgmt-toggle">
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
                                    />
                                    <span className="banner-mgmt-toggle-slider" />
                                    <span className="banner-mgmt-toggle-label">{form.active ? '활성' : '비활성'}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="banner-mgmt-form-actions">
                        <button className="banner-mgmt-btn-cancel" onClick={() => setShowForm(false)} disabled={saving}>취소</button>
                        <button className="banner-mgmt-btn-save" onClick={handleSave} disabled={saving}>
                            {saving ? '저장 중...' : '저장'}
                        </button>
                    </div>
                </div>
            )}

            <div className="banner-mgmt-table-wrap">
                <table className="banner-mgmt-table">
                    <thead>
                        <tr>
                            <th>이미지</th>
                            <th>순서</th>
                            <th>제목</th>
                            <th>설명</th>
                            <th>버튼</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="banner-mgmt-empty">불러오는 중...</td></tr>
                        ) : banners.length === 0 ? (
                            <tr><td colSpan={7} className="banner-mgmt-empty">등록된 배너가 없습니다.</td></tr>
                        ) : (
                            banners.map(banner => (
                                <tr key={banner.id} className="banner-mgmt-row">
                                    <td>
                                        {banner.imgPath
                                            ? <img src={banner.imgPath} alt="banner" className="banner-mgmt-thumb" />
                                            : <div className="banner-mgmt-thumb-placeholder" />
                                        }
                                    </td>
                                    <td className="banner-mgmt-order">{banner.sortOrder}</td>
                                    <td>
                                        <div className="banner-mgmt-title-cell">
                                            <span className="banner-mgmt-title">{banner.title}</span>
                                            {banner.highlight && (
                                                <span className="banner-mgmt-highlight">{banner.highlight}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="banner-mgmt-desc">{banner.description}</td>
                                    <td>{banner.buttonText}</td>
                                    <td>
                                        <span className={`banner-mgmt-status ${banner.active ? 'active' : 'inactive'}`}>
                                            {banner.active ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="banner-mgmt-actions">
                                            <button className="banner-mgmt-preview-icon-btn" onClick={() => setPreviewBanner(banner)} title="미리보기">
                                                <Eye size={15} />
                                            </button>
                                            <button className="banner-mgmt-edit-btn" onClick={() => openEdit(banner)} title="수정">
                                                <Edit2 size={15} />
                                            </button>
                                            <button className="banner-mgmt-delete-btn" onClick={() => handleDelete(banner.id)} title="삭제">
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <BannerPreviewModal banner={previewBanner} onClose={() => setPreviewBanner(null)} />
        </div>
    );
};

export default BannerManagement;
