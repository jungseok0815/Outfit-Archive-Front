import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/common/Modal/ConfirmModal';
import { ListCategory, InsertCategory, UpdateCategory, DeleteCategory } from '../../../api/admin/category';
import './CategoryManagement.css';

const EMPTY_FORM = { name: '', korName: '', engName: '', defaultSizes: '' };

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 등록 폼
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    // 인라인 수정
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 삭제 확인
    const [deleteTarget, setDeleteTarget] = useState(null);

    const load = () => {
        setLoading(true);
        ListCategory()
            .then(res => setCategories(res.data || []))
            .catch(() => toast.error('카테고리 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const handleInsert = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.korName.trim() || !form.engName.trim()) {
            toast.warn('식별자, 한글명, 영문명은 필수입니다.');
            return;
        }
        setSubmitting(true);
        try {
            await InsertCategory({
                name: form.name.trim().toUpperCase(),
                korName: form.korName.trim(),
                engName: form.engName.trim(),
                defaultSizes: form.defaultSizes.trim(),
            });
            toast.success('카테고리가 등록되었습니다.');
            setForm(EMPTY_FORM);
            load();
        } catch (e) {
            toast.error(e.response?.data?.message || '등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (cat) => {
        setEditId(cat.id);
        setEditForm({ korName: cat.korName, engName: cat.engName, defaultSizes: cat.defaultSizes || '' });
    };

    const cancelEdit = () => { setEditId(null); setEditForm({}); };

    const handleUpdate = async (id) => {
        if (!editForm.korName.trim() || !editForm.engName.trim()) {
            toast.warn('한글명, 영문명은 필수입니다.');
            return;
        }
        try {
            await UpdateCategory({ id, ...editForm });
            toast.success('카테고리가 수정되었습니다.');
            cancelEdit();
            load();
        } catch {
            toast.error('수정 중 오류가 발생했습니다.');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await DeleteCategory(deleteTarget.id);
            toast.success(`"${deleteTarget.korName}" 카테고리가 비활성화되었습니다.`);
            setDeleteTarget(null);
            load();
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        }
    };

    const activeCount = categories.filter(c => c.active).length;

    return (
        <div className="catmgmt">
            <ConfirmModal
                isOpen={deleteTarget !== null}
                message={`"${deleteTarget?.korName}" 카테고리를 비활성화하시겠습니까?`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* 등록 폼 */}
            <div className="catmgmt-add-card">
                <h3 className="catmgmt-add-title">카테고리 등록</h3>
                <form className="catmgmt-add-form" onSubmit={handleInsert}>
                    <div className="catmgmt-field-group">
                        <div className="catmgmt-field">
                            <label className="catmgmt-label">식별자 <span className="catmgmt-required">*</span></label>
                            <input
                                className="catmgmt-input"
                                placeholder="예: TOP"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                maxLength={20}
                            />
                            <span className="catmgmt-hint">영문 대문자, 저장 시 자동 변환됩니다.</span>
                        </div>
                        <div className="catmgmt-field">
                            <label className="catmgmt-label">한글명 <span className="catmgmt-required">*</span></label>
                            <input
                                className="catmgmt-input"
                                placeholder="예: 상의"
                                value={form.korName}
                                onChange={e => setForm(f => ({ ...f, korName: e.target.value }))}
                                maxLength={30}
                            />
                        </div>
                        <div className="catmgmt-field">
                            <label className="catmgmt-label">영문명 <span className="catmgmt-required">*</span></label>
                            <input
                                className="catmgmt-input"
                                placeholder="예: Tops"
                                value={form.engName}
                                onChange={e => setForm(f => ({ ...f, engName: e.target.value }))}
                                maxLength={30}
                            />
                        </div>
                        <div className="catmgmt-field">
                            <label className="catmgmt-label">기본 사이즈</label>
                            <input
                                className="catmgmt-input"
                                placeholder="예: S,M,L,XL"
                                value={form.defaultSizes}
                                onChange={e => setForm(f => ({ ...f, defaultSizes: e.target.value }))}
                                maxLength={100}
                            />
                            <span className="catmgmt-hint">쉼표(,)로 구분하여 입력하세요.</span>
                        </div>
                    </div>
                    <button className="catmgmt-submit-btn" type="submit" disabled={submitting}>
                        <Plus size={15} />
                        {submitting ? '등록 중...' : '카테고리 등록'}
                    </button>
                </form>
            </div>

            {/* 목록 헤더 */}
            <div className="catmgmt-list-header">
                <span className="catmgmt-list-title">카테고리 목록</span>
                <span className="catmgmt-list-count">활성 <strong>{activeCount}</strong> / 전체 <strong>{categories.length}</strong></span>
            </div>

            {/* 테이블 */}
            <div className="catmgmt-table-wrap">
                <table className="catmgmt-table">
                    <thead>
                        <tr>
                            <th>식별자</th>
                            <th>한글명</th>
                            <th>영문명</th>
                            <th>기본 사이즈</th>
                            <th>상태</th>
                            <th>관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="catmgmt-empty">불러오는 중...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={6} className="catmgmt-empty">등록된 카테고리가 없습니다.</td></tr>
                        ) : (
                            categories.map(cat => (
                                <tr key={cat.id} className={!cat.active ? 'catmgmt-row-inactive' : ''}>
                                    <td>
                                        <span className="catmgmt-name-badge">{cat.name}</span>
                                    </td>
                                    <td>
                                        {editId === cat.id ? (
                                            <input
                                                className="catmgmt-edit-input"
                                                value={editForm.korName}
                                                onChange={e => setEditForm(f => ({ ...f, korName: e.target.value }))}
                                                maxLength={30}
                                            />
                                        ) : cat.korName}
                                    </td>
                                    <td>
                                        {editId === cat.id ? (
                                            <input
                                                className="catmgmt-edit-input"
                                                value={editForm.engName}
                                                onChange={e => setEditForm(f => ({ ...f, engName: e.target.value }))}
                                                maxLength={30}
                                            />
                                        ) : cat.engName}
                                    </td>
                                    <td>
                                        {editId === cat.id ? (
                                            <input
                                                className="catmgmt-edit-input"
                                                value={editForm.defaultSizes}
                                                onChange={e => setEditForm(f => ({ ...f, defaultSizes: e.target.value }))}
                                                placeholder="S,M,L,XL"
                                                maxLength={100}
                                            />
                                        ) : (
                                            <div className="catmgmt-size-wrap">
                                                {cat.defaultSizes
                                                    ? cat.defaultSizes.split(',').map(s => (
                                                        <span key={s} className="catmgmt-size-chip">{s.trim()}</span>
                                                    ))
                                                    : <span className="catmgmt-no-size">-</span>
                                                }
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`catmgmt-status ${cat.active ? 'active' : 'inactive'}`}>
                                            {cat.active ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        {editId === cat.id ? (
                                            <div className="catmgmt-action-wrap">
                                                <button className="catmgmt-save-btn" onClick={() => handleUpdate(cat.id)} title="저장">
                                                    <Check size={14} />
                                                </button>
                                                <button className="catmgmt-cancel-btn" onClick={cancelEdit} title="취소">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="catmgmt-action-wrap">
                                                <button className="catmgmt-edit-btn" onClick={() => startEdit(cat)} title="수정">
                                                    <Pencil size={14} />
                                                </button>
                                                {cat.active && (
                                                    <button className="catmgmt-delete-btn" onClick={() => setDeleteTarget(cat)} title="비활성화">
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        )}
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

export default CategoryManagement;
