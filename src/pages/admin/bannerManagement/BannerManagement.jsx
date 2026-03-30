import { useState, useEffect, useRef, useMemo } from 'react';
import { Edit2, Trash2, Upload, X, Eye, ChevronDown } from 'lucide-react';
import { ListBanner, InsertBanner, UpdateBanner, DeleteBanner } from '../../../api/admin/banner';
import { ListBrand } from '../../../api/admin/brand';
import ConfirmModal from '../../../components/common/Modal/ConfirmModal';
import Pagination from '../../../components/common/Pagination/Pagination';
import { toast } from 'react-toastify';
import './BannerManagement.css';

const PAGE_SIZE = 10;

const EMPTY_FORM = { title: '', highlight: '', description: '', buttonText: '', buttonUrl: '', sortOrder: 1, active: true };

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
                    </div>
                    {banner.buttonText && (
                        <button className="banner-preview-btn">{banner.buttonText}</button>
                    )}
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
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [brands, setBrands] = useState([]);
    const [brandDropOpen, setBrandDropOpen] = useState(false);
    const fileInputRef = useRef(null);
    const isMounted = useRef(false);

    const totalPages = Math.max(1, Math.ceil(banners.length / PAGE_SIZE));
    const pagedBanners = useMemo(
        () => banners.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [banners, currentPage]
    );

    const load = () => {
        setLoading(true);
        ListBanner()
            .then(res => setBanners(res.data || []))
            .catch(() => toast.error('배너 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
        ListBrand('', 0, 200).then(res => setBrands(res.data.content || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
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
            buttonUrl: banner.buttonUrl || '',
            sortOrder: banner.sortOrder ?? 1,
            active: banner.active ?? true,
        });
        setImageFile(null);
        setImagePreview(banner.imgPath || null);
        setShowForm(true);
    };

    const closeForm = () => setShowForm(false);

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
        setSaving(true);
        const req = editTarget
            ? UpdateBanner({ ...form, id: editTarget.id }, imageFile)
            : InsertBanner(form, imageFile);
        req
            .then(() => {
                toast.success(editTarget ? '배너가 수정되었습니다.' : '배너가 등록되었습니다.');
                closeForm();
                load();
            })
            .catch(() => toast.error('저장에 실패했습니다.'))
            .finally(() => setSaving(false));
    };

    const handleDeleteConfirm = () => {
        if (!confirmTarget) return;
        const id = confirmTarget.id;
        setConfirmTarget(null);
        DeleteBanner(id)
            .then(() => { toast.success('배너가 삭제되었습니다.'); load(); })
            .catch(() => toast.error('삭제에 실패했습니다.'));
    };

    const handleFormPreview = () => {
        setPreviewBanner({ ...form, imgPath: imagePreview });
    };

    return (
        <div className="banner-mgmt">
            <div className="banner-mgmt-toolbar">
                <span className="banner-mgmt-count">전체 배너 {banners.length}개</span>
            </div>

            {/* 등록/수정 모달 */}
            {showForm && (
                <div className="banner-modal-overlay" onClick={closeForm}>
                    <div className="banner-modal" onClick={e => e.stopPropagation()}>
                        <div className="banner-modal-header">
                            <h3 className="banner-modal-title">{editTarget ? '배너 수정' : '배너 등록'}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button className="banner-mgmt-preview-btn" onClick={handleFormPreview} type="button">
                                    <Eye size={14} />
                                    미리보기
                                </button>
                                <button className="banner-modal-close" onClick={closeForm}><X size={16} /></button>
                            </div>
                        </div>

                        <div className="banner-modal-body">
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
                                        <label>버튼 클릭 URL</label>
                                        <div className="banner-url-row">
                                            <input
                                                value={form.buttonUrl}
                                                onChange={e => setForm(p => ({ ...p, buttonUrl: e.target.value }))}
                                                placeholder="예) /shop, /brand/1"
                                            />
                                            <div className="banner-brand-drop-wrap">
                                                <button
                                                    type="button"
                                                    className="banner-brand-drop-btn"
                                                    onClick={() => setBrandDropOpen(p => !p)}
                                                >
                                                    브랜드 선택 <ChevronDown size={13} />
                                                </button>
                                                {brandDropOpen && (
                                                    <div className="banner-brand-drop-list">
                                                        {brands.length === 0
                                                            ? <div className="banner-brand-drop-empty">브랜드 없음</div>
                                                            : brands.map(b => (
                                                                <button
                                                                    key={b.id}
                                                                    type="button"
                                                                    className="banner-brand-drop-item"
                                                                    onClick={() => {
                                                                        setForm(p => ({ ...p, buttonUrl: `/brand/${b.id}` }));
                                                                        setBrandDropOpen(false);
                                                                    }}
                                                                >
                                                                    {b.brandNm}
                                                                    <span className="banner-brand-drop-url">/brand/{b.id}</span>
                                                                </button>
                                                            ))
                                                        }
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
                        </div>

                        <div className="banner-modal-footer">
                            <button className="banner-mgmt-btn-cancel" onClick={closeForm} disabled={saving}>취소</button>
                            <button className="banner-mgmt-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? '저장 중...' : '저장'}
                            </button>
                        </div>
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
                            pagedBanners.map(banner => (
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
                                            <button className="banner-mgmt-delete-btn" onClick={() => setConfirmTarget(banner)} title="삭제">
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

            {banners.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={banners.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
            )}

            <BannerPreviewModal banner={previewBanner} onClose={() => setPreviewBanner(null)} />

            <ConfirmModal
                isOpen={!!confirmTarget}
                title="배너 삭제"
                message={`'${confirmTarget?.title}' 배너를 삭제하시겠습니까?`}
                confirmText="삭제"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmTarget(null)}
            />
        </div>
    );
};

export default BannerManagement;
