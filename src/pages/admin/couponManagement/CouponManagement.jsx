import React, { useState, useEffect } from 'react';
import { CreateCoupon } from '../../../api/admin/coupon';
import { toast } from 'react-toastify';
import './CouponManagement.css';

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

const CouponManagement = ({ registerTrigger }) => {
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (registerTrigger > 0) setShowForm(true);
    }, [registerTrigger]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        if (!form.code.trim()) { toast.error('쿠폰 코드를 입력해주세요.'); return false; }
        if (!form.name.trim()) { toast.error('쿠폰명을 입력해주세요.'); return false; }
        if (!form.discountValue || Number(form.discountValue) <= 0) { toast.error('할인 값을 올바르게 입력해주세요.'); return false; }
        if (form.discountType === 'PERCENT' && Number(form.discountValue) > 100) { toast.error('할인율은 100%를 초과할 수 없습니다.'); return false; }
        if (!form.minOrderPrice || Number(form.minOrderPrice) < 0) { toast.error('최소 주문금액을 입력해주세요.'); return false; }
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
                setForm(INITIAL_FORM);
                setShowForm(false);
            })
            .catch((e) => {
                const msg = e.response?.data?.msg || '쿠폰 생성에 실패했습니다.';
                toast.error(msg);
            })
            .finally(() => setSaving(false));
    };

    return (
        <div className="coupon-mgmt">
            {!showForm && (
                <div className="coupon-mgmt-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                        <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <p>상단의 <strong>쿠폰 등록</strong> 버튼을 눌러 새 쿠폰을 생성하세요.</p>
                </div>
            )}

            {showForm && (
                <div className="coupon-mgmt-form-card">
                    <h2 className="coupon-mgmt-form-title">새 쿠폰 생성</h2>

                    <div className="coupon-mgmt-grid">
                        <div className="coupon-mgmt-field">
                            <label>쿠폰 코드 <span className="required">*</span></label>
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="예: SUMMER2024"
                            />
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
                                min="1"
                            />
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
                                    <span className="coupon-preview-name">{form.name || '쿠폰명'}</span>
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

                    <div className="coupon-mgmt-actions">
                        <button className="coupon-mgmt-btn-cancel" onClick={() => { setShowForm(false); setForm(INITIAL_FORM); }}>
                            취소
                        </button>
                        <button className="coupon-mgmt-btn-save" onClick={handleSave} disabled={saving}>
                            {saving ? '저장 중...' : '쿠폰 생성'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;
