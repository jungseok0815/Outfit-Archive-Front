import { useState, useEffect, useMemo } from 'react';
import { Plus, Pencil, Trash2, Check, X, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmModal from '../../../components/common/Modal/ConfirmModal';
import { ListCategory, InsertCategory, UpdateCategory, DeleteCategory } from '../../../api/admin/category';
import { ListKeyword, InsertKeyword, DeleteKeyword } from '../../../api/admin/keyword';
import './CategoryManagement.css';

const EMPTY_FORM = { name: '', korName: '', engName: '', defaultSizes: '' };

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [loading, setLoading] = useState(true);

    // 카테고리 등록 폼
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    // 카테고리 인라인 수정
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // 카테고리 삭제 확인
    const [deleteTarget, setDeleteTarget] = useState(null);

    // 아코디언 열림 상태
    const [expandedId, setExpandedId] = useState(null);

    // 키워드 추가 입력값 (카테고리 id → 텍스트)
    const [kwInputs, setKwInputs] = useState({});
    const [kwAdding, setKwAdding] = useState({});
    const [kwDeleteTarget, setKwDeleteTarget] = useState(null);

    const loadAll = () => {
        setLoading(true);
        Promise.all([ListCategory(), ListKeyword()])
            .then(([catRes, kwRes]) => {
                setCategories(catRes.data || []);
                setKeywords(kwRes.data || []);
            })
            .catch(() => toast.error('목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadAll(); }, []);

    const keywordsByCategory = useMemo(() => {
        const map = {};
        keywords.forEach(kw => {
            if (!map[kw.categoryId]) map[kw.categoryId] = [];
            map[kw.categoryId].push(kw);
        });
        return map;
    }, [keywords]);

    /* ===== 카테고리 CRUD ===== */
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
            loadAll();
        } catch (e) {
            toast.error(e.response?.data?.message || '등록 중 오류가 발생했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (e, cat) => {
        e.stopPropagation();
        setEditId(cat.id);
        setEditForm({ korName: cat.korName, engName: cat.engName, defaultSizes: cat.defaultSizes || '' });
    };

    const cancelEdit = (e) => {
        e?.stopPropagation();
        setEditId(null);
        setEditForm({});
    };

    const handleUpdate = async (e, id) => {
        e.stopPropagation();
        if (!editForm.korName.trim() || !editForm.engName.trim()) {
            toast.warn('한글명, 영문명은 필수입니다.');
            return;
        }
        try {
            await UpdateCategory({ id, ...editForm });
            toast.success('카테고리가 수정되었습니다.');
            cancelEdit();
            loadAll();
        } catch {
            toast.error('수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteCategory = async () => {
        if (!deleteTarget) return;
        try {
            await DeleteCategory(deleteTarget.id);
            toast.success(`"${deleteTarget.korName}" 카테고리가 비활성화되었습니다.`);
            setDeleteTarget(null);
            loadAll();
        } catch {
            toast.error('삭제 중 오류가 발생했습니다.');
        }
    };

    /* ===== 키워드 CRUD ===== */
    const handleAddKeyword = async (categoryId) => {
        const text = (kwInputs[categoryId] || '').trim();
        if (!text) return;
        setKwAdding(prev => ({ ...prev, [categoryId]: true }));
        try {
            await InsertKeyword({ keyword: text, categoryId });
            setKwInputs(prev => ({ ...prev, [categoryId]: '' }));
            const kwRes = await ListKeyword();
            setKeywords(kwRes.data || []);
        } catch {
            toast.error('키워드 등록 중 오류가 발생했습니다.');
        } finally {
            setKwAdding(prev => ({ ...prev, [categoryId]: false }));
        }
    };

    const handleDeleteKeyword = async () => {
        if (!kwDeleteTarget) return;
        try {
            await DeleteKeyword(kwDeleteTarget.id);
            setKwDeleteTarget(null);
            const kwRes = await ListKeyword();
            setKeywords(kwRes.data || []);
        } catch {
            toast.error('키워드 삭제 중 오류가 발생했습니다.');
        }
    };

    const toggleExpand = (catId) => {
        setExpandedId(prev => prev === catId ? null : catId);
    };

    const activeCount = categories.filter(c => c.active).length;

    return (
        <div className="catmgmt">
            <ConfirmModal
                isOpen={deleteTarget !== null}
                message={`"${deleteTarget?.korName}" 카테고리를 비활성화하시겠습니까?`}
                onConfirm={handleDeleteCategory}
                onCancel={() => setDeleteTarget(null)}
            />
            <ConfirmModal
                isOpen={kwDeleteTarget !== null}
                message={`"${kwDeleteTarget?.keyword}" 키워드를 삭제하시겠습니까?`}
                onConfirm={handleDeleteKeyword}
                onCancel={() => setKwDeleteTarget(null)}
            />

            {/* 카테고리 등록 폼 */}
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

            {/* 아코디언 테이블 */}
            <div className="catmgmt-table-wrap">
                <table className="catmgmt-table">
                    <thead>
                        <tr>
                            <th style={{ width: 32 }}></th>
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
                            <tr><td colSpan={7} className="catmgmt-empty">불러오는 중...</td></tr>
                        ) : categories.length === 0 ? (
                            <tr><td colSpan={7} className="catmgmt-empty">등록된 카테고리가 없습니다.</td></tr>
                        ) : (
                            categories.map(cat => {
                                const isExpanded = expandedId === cat.id;
                                const catKeywords = keywordsByCategory[cat.id] || [];
                                const inputVal = kwInputs[cat.id] || '';
                                const adding = !!kwAdding[cat.id];

                                return (
                                    <>
                                        {/* 카테고리 행 */}
                                        <tr
                                            key={cat.id}
                                            className={`catmgmt-cat-row ${!cat.active ? 'catmgmt-row-inactive' : ''} ${isExpanded ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(cat.id)}
                                        >
                                            <td className="catmgmt-chevron-cell">
                                                {isExpanded
                                                    ? <ChevronDown size={14} className="catmgmt-chevron" />
                                                    : <ChevronRight size={14} className="catmgmt-chevron" />
                                                }
                                            </td>
                                            <td>
                                                <span className="catmgmt-name-badge">{cat.name}</span>
                                            </td>
                                            <td>
                                                {editId === cat.id ? (
                                                    <input
                                                        className="catmgmt-edit-input"
                                                        value={editForm.korName}
                                                        onClick={e => e.stopPropagation()}
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
                                                        onClick={e => e.stopPropagation()}
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
                                                        onClick={e => e.stopPropagation()}
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
                                                        <button className="catmgmt-save-btn" onClick={(e) => handleUpdate(e, cat.id)} title="저장">
                                                            <Check size={14} />
                                                        </button>
                                                        <button className="catmgmt-cancel-btn" onClick={cancelEdit} title="취소">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="catmgmt-action-wrap">
                                                        <button className="catmgmt-edit-btn" onClick={(e) => startEdit(e, cat)} title="수정">
                                                            <Pencil size={14} />
                                                        </button>
                                                        {cat.active && (
                                                            <button className="catmgmt-delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteTarget(cat); }} title="비활성화">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>

                                        {/* 키워드 확장 행 */}
                                        {isExpanded && (
                                            <tr key={`kw-${cat.id}`} className="catmgmt-kw-expand-row">
                                                <td colSpan={7}>
                                                    <div className="catmgmt-kw-expand-inner">
                                                        <div className="catmgmt-kw-expand-label">
                                                            <Tag size={12} />
                                                            수집 키워드
                                                            <span className="catmgmt-kw-expand-count">{catKeywords.length}개</span>
                                                        </div>
                                                        <div className="catmgmt-kw-chips">
                                                            {catKeywords.length === 0 && (
                                                                <span className="catmgmt-kw-empty">등록된 키워드 없음</span>
                                                            )}
                                                            {catKeywords.map(kw => (
                                                                <span
                                                                    key={kw.id}
                                                                    className={`catmgmt-kw-chip ${!kw.active ? 'inactive' : ''}`}
                                                                >
                                                                    {kw.keyword}
                                                                    <button
                                                                        className="catmgmt-kw-chip-del"
                                                                        onClick={() => setKwDeleteTarget(kw)}
                                                                        title="삭제"
                                                                    >
                                                                        <X size={10} />
                                                                    </button>
                                                                </span>
                                                            ))}
                                                            <div className="catmgmt-kw-add-wrap">
                                                                <input
                                                                    className="catmgmt-kw-input"
                                                                    placeholder="키워드 입력 후 Enter"
                                                                    value={inputVal}
                                                                    onChange={e => setKwInputs(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                                                    onKeyDown={e => e.key === 'Enter' && handleAddKeyword(cat.id)}
                                                                    maxLength={50}
                                                                    disabled={adding}
                                                                />
                                                                <button
                                                                    className="catmgmt-kw-add-btn"
                                                                    onClick={() => handleAddKeyword(cat.id)}
                                                                    disabled={adding || !inputVal.trim()}
                                                                >
                                                                    <Plus size={13} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryManagement;
