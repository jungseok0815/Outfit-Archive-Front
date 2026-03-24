import { useState, useEffect, useRef, useMemo } from 'react';
import { CreateCoupon, ListCoupon, UpdateCoupon, DeleteCoupon } from '../../../api/admin/coupon';
import ConfirmModal from '../../../components/common/Modal/ConfirmModal';
import Pagination from '../../../components/common/Pagination/Pagination';
import { toast } from 'react-toastify';
import './CouponManagement.css';

const PAGE_SIZE = 10;

const INITIAL_FORM = {
    code: '',
    name: '',
    discountType: 'FIXED',
    discountValue: '',
    minOrderPrice: '',
    maxDiscountPrice: '',
    totalQuantity: '',
    startAt: '',
    endAt: '',
};

const toInputFormat = (dt) => {
    if (!dt) return '';
    return dt.length > 16 ? dt.substring(0, 16) : dt;
};

const CouponManagement = ({ registerTrigger }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [confirmTarget, setConfirmTarget] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const isMounted = useRef(false);

    const totalPages = Math.max(1, Math.ceil(coupons.length / PAGE_SIZE));
    const pagedCoupons = useMemo(
        () => coupons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
        [coupons, currentPage]
    );

    const loadCoupons = () => {
        setLoading(true);
        ListCoupon()
            .then(res => setCoupons(res.data || []))
            .catch(() => toast.error('쿠폰 목록을 불러오지 못했습니다.'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadCoupons(); }, []);

    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }
        if (registerTrigger > 0) openCreate();
    }, [registerTrigger]);

    const openCreate = () => {
        setEditTarget(null);
        setForm(INITIAL_FORM);
        setShowForm(true);
    };

    const openEdit = (coupon) => {
        setEditTarget(coupon);
        setForm({
            code: coupon.code,
            name: coupon.name,
            discountType: coupon.discountType,
            discountValue: String(coupon.discountValue),
            minOrderPrice: String(coupon.minOrderPrice),
            maxDiscountPrice: String(coupon.maxDiscountPrice),
            totalQuantity: String(coupon.totalQuantity),
            startAt: toInputFormat(coupon.startAt),
            endAt: toInputFormat(coupon.endAt),
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditTarget(null);
        setForm(INITIAL_FORM);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.name.trim()) { toast.error('쿠폰명을 입력해주세요.'); return false; }
        if (!editTarget && !form.code.trim()) { toast.error('쿠폰 코드를 입력해주세요.'); return false; }
        if (!form.discountValue || Number(form.discountValue) <= 0) { toast.error('할인 값을 올바르게 입력해주세요.'); return false; }
        if (form.discountType === 'PERCENT' && Number(form.discountValue) > 100) { toast.error('할인율은 100%를 초과할 수 없습니다.'); return false; }
        if (form.minOrderPrice === '' || Number(form.minOrderPrice) < 0) { toast.error('최소 주문금액을 입력해주세요.'); return false; }
        if (!form.maxDiscountPrice || Number(form.maxDiscountPrice) <= 0) { toast.error('최대 할인금액을 입력해주세요.'); return false; }
        if (!form.totalQuantity || Number(form.totalQuantity) <= 0) { toast.error('총 수량을 입력해주세요.'); return false; }
        if (!form.startAt) { toast.error('시작일을 선택해주세요.'); return false; }
        if (!form.endAt) { toast.error('종료일을 선택해주세요.'); return false; }
        if (new Date(form.startAt) >= new Date(form.endAt)) { toast.error('종료일은 시작일 이후여야 합니다.'); return false; }
        return true;
    };

    const handleSave = () => {
        if (!validate()) return;
        setSaving(true);

        if (editTarget) {
            const dto = {
                name: form.name,
                discountType: form.discountType,
                discountValue: Number(form.discountValue),
                minOrderPrice: Number(form.minOrderPrice),
                maxDiscountPrice: Number(form.maxDiscountPrice),
                totalQuantity: Number(form.totalQuantity),
                startAt: form.startAt,
                endAt: form.endAt,
            };
            UpdateCoupon(editTarget.id, dto)
                .then(() => {
                    toast.success('쿠폰이 수정되었습니다.');
                    closeForm();
                    loadCoupons();
                })
                .catch((e) => toast.error(e.response?.data?.msg || '수정에 실패했습니다.'))
                .finally(() => setSaving(false));
        } else {
            const dto = {
                ...form,
                discountValue: Number(form.discountValue),
                minOrderPrice: Number(form.minOrderPrice),
                maxDiscountPrice: Number(form.maxDiscountPrice),
                totalQuantity: Number(form.totalQuantity),
            };
            CreateCoupon(dto)
                .then(() => {
                    toast.success('쿠폰이 생성되었습니다.');
                    closeForm();
                    loadCoupons();
                })
                .catch((e) => toast.error(e.response?.data?.msg || '쿠폰 생성에 실패했습니다.'))
                .finally(() => setSaving(false));
        }
    };

    const handleDelete = (coupon) => {
        setConfirmTarget(coupon);
    };

    const handleDeleteConfirm = () => {
        const coupon = confirmTarget;
        setConfirmTarget(null);
        setDeletingId(coupon.id);
        DeleteCoupon(coupon.id)
            .then(() => {
                toast.success('쿠폰이 삭제되었습니다.');
                loadCoupons();
            })
            .catch((e) => toast.error(e.response?.data?.msg || '삭제에 실패했습니다.'))
            .finally(() => setDeletingId(null));
    };

    const isExpired = (endAt) => new Date(endAt) < new Date();
    const isActive = (startAt, endAt) => {
        const now = new Date();
        return new Date(startAt) <= now && now < new Date(endAt);
    };

    return (
        <div className="coupon-mgmt">

            {/* 삭제 확인 모달 */}
            <ConfirmModal
                isOpen={!!confirmTarget}
                title="쿠폰 삭제"
                message={`"${confirmTarget?.name}" 쿠폰을 삭제하시겠습니까?\n발급된 이력이 있으면 삭제할 수 없습니다.`}
                confirmText="삭제"
                cancelText="취소"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirmTarget(null)}
            />

            {/* 등록/수정 모달 */}
            {showForm && (
                <div className="coupon-modal-overlay" onClick={closeForm}>
                    <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>

                        {/* 모달 헤더 */}
                        <div className="coupon-modal-header">
                            <h2 className="coupon-modal-title">
                                {editTarget ? `쿠폰 수정 — ${editTarget.code}` : '새 쿠폰 생성'}
                            </h2>
                            <button className="coupon-modal-close" onClick={closeForm}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* 모달 바디 */}
                        <div className="coupon-modal-body">
                            <div className="coupon-mgmt-grid">
                                <div className="coupon-mgmt-field">
                                    <label>쿠폰 코드 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleChange}
                                        placeholder="예: SUMMER2024"
                                        disabled={!!editTarget}
                                        className={editTarget ? 'coupon-mgmt-input-disabled' : ''}
                                    />
                                    {editTarget && <span className="coupon-mgmt-hint">코드는 수정할 수 없습니다.</span>}
                                </div>
                                <div className="coupon-mgmt-field">
                                    <label>쿠폰명 <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="예: 여름 할인 쿠폰"
                                    />
                                </div>

                                <div className="coupon-mgmt-field">
                                    <label>할인 유형 <span className="required">*</span></label>
                                    <select name="discountType" value={form.discountType} onChange={handleChange}>
                                        <option value="FIXED">정액 할인 (원)</option>
                                        <option value="PERCENT">정률 할인 (%)</option>
                                    </select>
                                </div>
                                <div className="coupon-mgmt-field">
                                    <label>
                                        {form.discountType === 'FIXED' ? '할인 금액 (원)' : '할인율 (%)'}
                                        <span className="required"> *</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="discountValue"
                                        value={form.discountValue}
                                        onChange={handleChange}
                                        placeholder={form.discountType === 'FIXED' ? '예: 3000' : '예: 10'}
                                        min="1"
                                        max={form.discountType === 'PERCENT' ? 100 : undefined}
                                    />
                                </div>

                                <div className="coupon-mgmt-field">
                                    <label>최소 주문금액 (원) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="minOrderPrice"
                                        value={form.minOrderPrice}
                                        onChange={handleChange}
                                        placeholder="예: 30000"
                                        min="0"
                                    />
                                </div>
                                <div className="coupon-mgmt-field">
                                    <label>최대 할인금액 (원) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="maxDiscountPrice"
                                        value={form.maxDiscountPrice}
                                        onChange={handleChange}
                                        placeholder="예: 5000"
                                        min="1"
                                    />
                                    {form.discountType === 'FIXED' && (
                                        <span className="coupon-mgmt-hint">정액 할인 시 최대 할인금액과 동일하게 입력하세요.</span>
                                    )}
                                </div>

                                <div className="coupon-mgmt-field">
                                    <label>총 발급 수량 <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        name="totalQuantity"
                                        value={form.totalQuantity}
                                        onChange={handleChange}
                                        placeholder="예: 100"
                                        min={editTarget ? editTarget.issuedCount : 1}
                                    />
                                    {editTarget && editTarget.issuedCount > 0 && (
                                        <span className="coupon-mgmt-hint">현재 {editTarget.issuedCount}개 발급됨 — 이보다 작게 설정 불가</span>
                                    )}
                                </div>

                                <div className="coupon-mgmt-field coupon-mgmt-field--date">
                                    <label>유효 시작일 <span className="required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        name="startAt"
                                        value={form.startAt}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="coupon-mgmt-field coupon-mgmt-field--date">
                                    <label>유효 종료일 <span className="required">*</span></label>
                                    <input
                                        type="datetime-local"
                                        name="endAt"
                                        value={form.endAt}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* 미리보기 */}
                            {form.discountValue && form.name && (
                                <div className="coupon-preview">
                                    <div className="coupon-preview-card">
                                        <div className="coupon-preview-left">
                                            <span className="coupon-preview-name">{form.name}</span>
                                            <span className="coupon-preview-code">{form.code || 'CODE'}</span>
                                            {form.minOrderPrice && (
                                                <span className="coupon-preview-min">{Number(form.minOrderPrice).toLocaleString()}원 이상 구매 시</span>
                                            )}
                                        </div>
                                        <div className="coupon-preview-right">
                                            <span className="coupon-preview-discount">
                                                {form.discountType === 'FIXED'
                                                    ? `${Number(form.discountValue).toLocaleString()}원`
                                                    : `${form.discountValue}%`}
                                            </span>
                                            <span className="coupon-preview-discount-label">할인</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 모달 푸터 */}
                        <div className="coupon-modal-footer">
                            <button className="coupon-mgmt-btn-cancel" onClick={closeForm}>
                                취소
                            </button>
                            <button className="coupon-mgmt-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? '저장 중...' : editTarget ? '수정 완료' : '쿠폰 생성'}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* 쿠폰 목록 테이블 */}
            <div className="coupon-mgmt-table-wrap">
                {loading ? (
                    <p className="coupon-mgmt-loading">불러오는 중...</p>
                ) : coupons.length === 0 ? (
                    <div className="coupon-mgmt-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                            <line x1="7" y1="7" x2="7.01" y2="7" />
                        </svg>
                        <p>등록된 쿠폰이 없습니다. <strong>쿠폰 등록</strong> 버튼을 눌러 생성하세요.</p>
                    </div>
                ) : (
                    <table className="coupon-mgmt-table">
                        <thead>
                            <tr>
                                <th>쿠폰코드</th>
                                <th>쿠폰명</th>
                                <th>할인</th>
                                <th>최소주문</th>
                                <th>발급현황</th>
                                <th>유효기간</th>
                                <th>상태</th>
                                <th>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagedCoupons.map((c) => (
                                <tr key={c.id}>
                                    <td><code className="coupon-code-badge">{c.code}</code></td>
                                    <td>{c.name}</td>
                                    <td className="coupon-discount-cell">
                                        {c.discountType === 'FIXED'
                                            ? `${c.discountValue.toLocaleString()}원`
                                            : `${c.discountValue}%`}
                                        {c.discountType === 'PERCENT' && (
                                            <span className="coupon-max-discount">최대 {c.maxDiscountPrice.toLocaleString()}원</span>
                                        )}
                                    </td>
                                    <td>{c.minOrderPrice.toLocaleString()}원 이상</td>
                                    <td>
                                        <div className="coupon-qty-wrap">
                                            <div
                                                className="coupon-qty-bar"
                                                style={{ width: `${Math.min(100, (c.issuedCount / c.totalQuantity) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="coupon-qty-text">{c.issuedCount} / {c.totalQuantity}</span>
                                    </td>
                                    <td className="coupon-date-cell">
                                        {c.startAt?.substring(0, 10)}
                                        <span className="coupon-date-sep">~</span>
                                        {c.endAt?.substring(0, 10)}
                                    </td>
                                    <td>
                                        {isExpired(c.endAt) ? (
                                            <span className="coupon-status coupon-status--expired">만료</span>
                                        ) : isActive(c.startAt, c.endAt) ? (
                                            <span className="coupon-status coupon-status--active">진행중</span>
                                        ) : (
                                            <span className="coupon-status coupon-status--scheduled">예정</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="coupon-action-btns">
                                            <button className="coupon-btn-edit" onClick={() => openEdit(c)}>
                                                수정
                                            </button>
                                            <button
                                                className="coupon-btn-delete"
                                                onClick={() => handleDelete(c)}
                                                disabled={deletingId === c.id}
                                            >
                                                {deletingId === c.id ? '...' : '삭제'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {coupons.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalCount={coupons.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default CouponManagement;
