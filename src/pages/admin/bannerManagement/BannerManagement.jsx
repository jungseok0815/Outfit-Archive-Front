import React, { useState, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { ListBanner, InsertBanner, UpdateBanner, DeleteBanner } from '../../../api/admin/banner';
import { toast } from 'react-toastify';
import './BannerManagement.css';

const EMPTY_FORM = { title: '', highlight: '', description: '', buttonText: '', sortOrder: 1, active: true };

const BannerManagement = ({ registerTrigger }) => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

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
        setShowForm(true);
    };

    const handleSave = () => {
        if (!form.title.trim()) { toast.error('제목을 입력해주세요.'); return; }
        setSaving(true);
        const req = editTarget
            ? UpdateBanner({ ...form, id: editTarget.id })
            : InsertBanner(form);
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

    return (
        <div className="banner-mgmt">
            <div className="banner-mgmt-toolbar">
                <span className="banner-mgmt-count">전체 배너 {banners.length}개</span>
            </div>

            {showForm && (
                <div className="banner-mgmt-form-card">
                    <h3 className="banner-mgmt-form-title">{editTarget ? '배너 수정' : '배너 등록'}</h3>
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
                            <th>순서</th>
                            <th>제목</th>
                            <th>강조</th>
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
                                    <td className="banner-mgmt-order">{banner.sortOrder}</td>
                                    <td className="banner-mgmt-title">{banner.title}</td>
                                    <td><span className="banner-mgmt-highlight">{banner.highlight}</span></td>
                                    <td className="banner-mgmt-desc">{banner.description}</td>
                                    <td>{banner.buttonText}</td>
                                    <td>
                                        <span className={`banner-mgmt-status ${banner.active ? 'active' : 'inactive'}`}>
                                            {banner.active ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="banner-mgmt-actions">
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
        </div>
    );
};

export default BannerManagement;
