import { useState, useEffect, useRef } from "react";
import DaumPostcode from "react-daum-postcode";
import { InsertOrder } from "../../../api/user/order";
import { DirectCompleteOrder } from "../../../api/user/payment";
import { GetPoint } from "../../../api/user/point";
import { GetMyCoupons } from "../../../api/user/coupon";
import { ListAddress, InsertAddress, DeleteAddress, SetDefaultAddress } from "../../../api/user/address";
import "./OrderModal.css";

function OrderModal({ product, selectedSize, onClose }) {
  const [form, setForm] = useState({
    quantity: 1,
    recipientName: "",
    recipientPhone: "",
    zipCode: "",
    baseAddress: "",
    detailAddress: "",
    usePoint: 0,
  });
  const [showPostcode, setShowPostcode] = useState(false);
  const [availablePoint, setAvailablePoint] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState(null);
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState(0);
  const detailAddressRef = useRef(null);

  // 주소 관련 상태
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressPanel, setShowAddressPanel] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAddressPostcode, setShowAddressPostcode] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false,
  });
  const addressDetailRef = useRef(null);

  useEffect(() => {
    GetPoint()
      .then(res => setAvailablePoint(res.data.point || 0))
      .catch(() => {});
    GetMyCoupons()
      .then(res => {
        const now = new Date();
        const valid = (res.data || []).filter(c => !c.isUsed && new Date(c.expiredAt) >= now);
        setCoupons(valid);
      })
      .catch(() => {});
    ListAddress()
      .then(res => {
        const list = res.data || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) applyAddress(def);
      })
      .catch(() => {});
  }, []);

  const applyAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setForm(prev => ({
      ...prev,
      recipientName: addr.recipientName,
      recipientPhone: addr.recipientPhone,
      zipCode: addr.zipCode,
      baseAddress: addr.baseAddress,
      detailAddress: addr.detailAddress || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handlePostcodeComplete = (data) => {
    const address = data.roadAddress || data.jibunAddress;
    setForm(prev => ({ ...prev, zipCode: data.zonecode, baseAddress: address, detailAddress: "" }));
    setShowPostcode(false);
    setTimeout(() => detailAddressRef.current?.focus(), 100);
  };

  const maxQuantity = selectedSize ? selectedSize.quantity : product.productQuantity;

  const handleQuantityChange = (delta) => {
    setForm(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(maxQuantity, prev.quantity + delta)),
    }));
  };

  const totalPrice = product.productPrice * form.quantity;

  const couponDiscount = (() => {
    if (!selectedCoupon || totalPrice < (selectedCoupon.minOrderPrice || 0)) return 0;
    if (selectedCoupon.discountType === 'FIXED') return Math.min(selectedCoupon.discountValue, totalPrice);
    const d = Math.floor(totalPrice * selectedCoupon.discountValue / 100);
    return selectedCoupon.maxDiscountPrice ? Math.min(d, selectedCoupon.maxDiscountPrice) : d;
  })();

  const priceAfterCoupon = Math.max(0, totalPrice - couponDiscount);
  const usePoint = Math.min(Number(form.usePoint) || 0, availablePoint, priceAfterCoupon);
  const finalPrice = Math.max(0, priceAfterCoupon - usePoint);

  const formatCouponLabel = (c) => {
    const discount = c.discountType === 'FIXED'
      ? `${c.discountValue.toLocaleString()}원 할인`
      : `${c.discountValue}% 할인${c.maxDiscountPrice ? ` (최대 ${c.maxDiscountPrice.toLocaleString()}원)` : ''}`;
    return `${c.couponName} — ${discount}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recipientName.trim()) { setError("수령인 이름을 입력해주세요."); return; }
    if (!form.recipientPhone.trim()) { setError("연락처를 입력해주세요."); return; }
    if (!form.baseAddress.trim()) { setError("배송지를 입력해주세요."); return; }

    setSubmitting(true);
    setError("");

    try {
      const res = await InsertOrder({
        productId: product.id,
        quantity: form.quantity,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        shippingAddress: `[${form.zipCode}] ${form.baseAddress} ${form.detailAddress}`.trim(),
        usePoint,
        sizeNm: selectedSize?.sizeNm || null,
        userCouponId: selectedCoupon?.userCouponId || null,
      });
      setAppliedCouponDiscount(couponDiscount);
      const { tossOrderId } = res.data;
      const completeRes = await DirectCompleteOrder(tossOrderId);
      setOrderResult(completeRes.data);
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || "";
      if (msg) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // 주소 추가 폼 핸들러
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressPostcodeComplete = (data) => {
    const address = data.roadAddress || data.jibunAddress;
    setAddressForm(prev => ({ ...prev, zipCode: data.zonecode, baseAddress: address, detailAddress: "" }));
    setShowAddressPostcode(false);
    setTimeout(() => addressDetailRef.current?.focus(), 100);
  };

  const handleAddressSubmit = () => {
    if (!addressForm.recipientName.trim() || !addressForm.recipientPhone.trim() || !addressForm.baseAddress.trim()) return;
    InsertAddress({
      recipientName: addressForm.recipientName.trim(),
      recipientPhone: addressForm.recipientPhone.trim(),
      zipCode: addressForm.zipCode,
      baseAddress: addressForm.baseAddress,
      detailAddress: addressForm.detailAddress.trim(),
      isDefault: addressForm.isDefault,
    })
      .then(() => ListAddress().then(res => {
        const list = res.data || [];
        setAddresses(list);
        setShowAddressForm(false);
        setAddressForm({ recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false });
      }))
      .catch(() => {});
  };

  const handleDeleteAddress = (id) => {
    DeleteAddress(id)
      .then(() => ListAddress().then(res => {
        const list = res.data || [];
        setAddresses(list);
        if (selectedAddressId === id) setSelectedAddressId(null);
      }))
      .catch(() => {});
  };

  const handleSetDefault = (id) => {
    SetDefaultAddress(id)
      .then(() => ListAddress().then(res => setAddresses(res.data || [])))
      .catch(() => {});
  };

  const thumbImg = product.images?.length > 0 ? product.images[0].imgPath : null;

  if (orderResult) {
    return (
      <div className="order-modal-overlay" onClick={onClose}>
        <div className="order-modal" onClick={e => e.stopPropagation()}>
          <div className="order-modal-header">
            <h3 className="order-modal-title">주문 완료</h3>
            <button className="order-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="order-modal-body order-success-body">
            <div className="order-success-icon">✓</div>
            <p className="order-success-title">결제가 완료되었습니다</p>
            <div className="order-success-info">
              <div className="order-success-row"><span>주문 상품</span><span>{orderResult.productNm}</span></div>
              <div className="order-success-row"><span>수량</span><span>{orderResult.quantity}개</span></div>
              <div className="order-success-row"><span>결제 금액</span><span>{orderResult.actualPayment?.toLocaleString()}원</span></div>
              {appliedCouponDiscount > 0 && (
                <div className="order-success-row"><span>쿠폰 할인</span><span>− {appliedCouponDiscount.toLocaleString()}원</span></div>
              )}
              {orderResult.usedPoint > 0 && (
                <div className="order-success-row"><span>포인트 사용</span><span>− {orderResult.usedPoint?.toLocaleString()}P</span></div>
              )}
              {orderResult.earnedPoint > 0 && (
                <div className="order-success-row earn"><span>적립 포인트</span><span>+ {orderResult.earnedPoint?.toLocaleString()}P</span></div>
              )}
            </div>
            <button className="order-submit-btn" onClick={onClose}>확인</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal" onClick={e => e.stopPropagation()}>
        <div className="order-modal-header">
          <h3 className="order-modal-title">주문하기</h3>
          <button className="order-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="order-modal-body">
          {/* 상품 요약 */}
          <div className="order-product-summary">
            <div className="order-product-thumb">
              {thumbImg ? <img src={thumbImg} alt={product.productNm} /> : <div className="order-product-thumb-empty" />}
            </div>
            <div className="order-product-info">
              <span className="order-product-brand">{product.brandNm}</span>
              <span className="order-product-name">{product.productNm}</span>
              {product.productEnNm && <span className="order-product-name-en">{product.productEnNm}</span>}
              {selectedSize && <span className="order-product-size">사이즈: {selectedSize.sizeNm}</span>}
              <span className="order-product-price">{product.productPrice?.toLocaleString()}원</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="order-form">
            {/* 수량 */}
            <div className="order-field">
              <label className="order-label">수량</label>
              <div className="order-quantity">
                <button type="button" className="order-qty-btn" onClick={() => handleQuantityChange(-1)}>−</button>
                <span className="order-qty-value">{form.quantity}</span>
                <button type="button" className="order-qty-btn" onClick={() => handleQuantityChange(1)}>+</button>
                <span className="order-qty-stock">재고 {maxQuantity}개</span>
              </div>
            </div>

            {/* 배송지 섹션 */}
            <div className="order-field order-field-address">
              <label className="order-label">배송지</label>
              <div className="order-address-wrap">
                {/* 저장된 배송지 버튼 */}
                <button
                  type="button"
                  className="order-saved-address-btn"
                  onClick={() => setShowAddressPanel(true)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {selectedAddressId ? '배송지 변경' : '저장된 배송지 선택'}
                </button>

                {/* 주소 입력 폼 */}
                <div className="order-address-zip-row">
                  <input className="order-input order-input-zip" type="text" value={form.zipCode} readOnly placeholder="우편번호" />
                  <button type="button" className="order-address-search-btn" onClick={() => setShowPostcode(true)}>주소 검색</button>
                </div>
                <input className="order-input" type="text" value={form.baseAddress} readOnly placeholder="기본 주소" />
                <input
                  className="order-input"
                  type="text"
                  name="detailAddress"
                  value={form.detailAddress}
                  onChange={handleChange}
                  placeholder="상세 주소 입력 (동, 호수 등)"
                  ref={detailAddressRef}
                />
              </div>
            </div>

            {/* 수령인 */}
            <div className="order-field">
              <label className="order-label">수령인</label>
              <input className="order-input" type="text" name="recipientName" value={form.recipientName} onChange={handleChange} placeholder="수령인 이름" />
            </div>

            {/* 연락처 */}
            <div className="order-field">
              <label className="order-label">연락처</label>
              <input className="order-input" type="text" name="recipientPhone" value={form.recipientPhone} onChange={handleChange} placeholder="010-0000-0000" />
            </div>

            {/* 주소 검색 팝업 */}
            {showPostcode && (
              <div className="order-postcode-overlay" onClick={() => setShowPostcode(false)}>
                <div className="order-postcode-popup" onClick={e => e.stopPropagation()}>
                  <div className="order-postcode-header">
                    <span>주소 검색</span>
                    <button type="button" onClick={() => setShowPostcode(false)}>✕</button>
                  </div>
                  <DaumPostcode onComplete={handlePostcodeComplete} autoClose={false} />
                </div>
              </div>
            )}

            {/* 쿠폰 */}
            <div className="order-field">
              <label className="order-label">쿠폰</label>
              <div className="order-coupon-wrap">
                {coupons.length === 0 ? (
                  <span className="order-point-available">사용 가능한 쿠폰이 없습니다</span>
                ) : (
                  <>
                    <select
                      className="order-input order-coupon-select"
                      value={selectedCoupon?.userCouponId || ''}
                      onChange={(e) => {
                        const c = coupons.find(c => String(c.userCouponId) === e.target.value);
                        setSelectedCoupon(c || null);
                      }}
                    >
                      <option value="">쿠폰 선택 안함</option>
                      {coupons.map(c => {
                        const applicable = totalPrice >= (c.minOrderPrice || 0);
                        return (
                          <option key={c.userCouponId} value={c.userCouponId} disabled={!applicable}>
                            {formatCouponLabel(c)}{!applicable ? ` (${c.minOrderPrice.toLocaleString()}원 이상)` : ''}
                          </option>
                        );
                      })}
                    </select>
                    {selectedCoupon && totalPrice < (selectedCoupon.minOrderPrice || 0) && (
                      <p className="order-coupon-warn">최소 주문금액 {selectedCoupon.minOrderPrice.toLocaleString()}원 이상 구매 시 사용 가능합니다.</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* 포인트 */}
            <div className="order-field">
              <label className="order-label">포인트</label>
              <div className="order-point-wrap">
                <input className="order-input order-point-input" type="number" name="usePoint" value={form.usePoint} onChange={handleChange} min={0} max={availablePoint} placeholder="0" />
                <span className="order-point-available">보유 {availablePoint.toLocaleString()} P</span>
              </div>
            </div>

            {/* 결제 요약 */}
            <div className="order-summary">
              <div className="order-summary-row"><span>상품금액</span><span>{totalPrice.toLocaleString()}원</span></div>
              {couponDiscount > 0 && <div className="order-summary-row discount"><span>쿠폰 할인</span><span>− {couponDiscount.toLocaleString()}원</span></div>}
              {usePoint > 0 && <div className="order-summary-row discount"><span>포인트 할인</span><span>− {usePoint.toLocaleString()}P</span></div>}
              <div className="order-summary-row total"><span>최종 결제금액</span><strong>{finalPrice.toLocaleString()}원</strong></div>
            </div>

            {error && <p className="order-error">{error}</p>}
            <button type="submit" className="order-submit-btn" disabled={submitting}>
              {submitting ? "처리 중..." : `${finalPrice.toLocaleString()}원 결제하기`}
            </button>
          </form>
        </div>
      </div>

      {/* 저장된 주소 선택 패널 */}
      {showAddressPanel && (
        <div className="order-addr-panel-overlay" onClick={() => { setShowAddressPanel(false); setShowAddressForm(false); }}>
          <div className="order-addr-panel" onClick={e => e.stopPropagation()}>
            <div className="order-addr-panel-header">
              <h4>{showAddressForm ? '새 배송지 추가' : '배송지 선택'}</h4>
              <button onClick={() => { setShowAddressPanel(false); setShowAddressForm(false); }}>✕</button>
            </div>

            {showAddressForm ? (
              /* 주소 추가 폼 */
              <div className="order-addr-form">
                <div className="order-addr-form-row">
                  <input
                    className="order-input"
                    type="text"
                    name="recipientName"
                    placeholder="수령인 이름"
                    value={addressForm.recipientName}
                    onChange={handleAddressFormChange}
                  />
                </div>
                <div className="order-addr-form-row">
                  <input
                    className="order-input"
                    type="text"
                    name="recipientPhone"
                    placeholder="연락처 (010-0000-0000)"
                    value={addressForm.recipientPhone}
                    onChange={handleAddressFormChange}
                  />
                </div>
                <div className="order-address-zip-row">
                  <input className="order-input order-input-zip" type="text" value={addressForm.zipCode} readOnly placeholder="우편번호" />
                  <button type="button" className="order-address-search-btn" onClick={() => setShowAddressPostcode(true)}>주소 검색</button>
                </div>
                <input className="order-input" type="text" value={addressForm.baseAddress} readOnly placeholder="기본 주소" />
                <input
                  className="order-input"
                  type="text"
                  name="detailAddress"
                  placeholder="상세 주소 (동, 호수 등)"
                  value={addressForm.detailAddress}
                  onChange={handleAddressFormChange}
                  ref={addressDetailRef}
                />
                <label className="order-addr-default-check">
                  <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} />
                  기본 배송지로 설정
                </label>
                <div className="order-addr-form-btns">
                  <button className="order-addr-cancel-btn" onClick={() => setShowAddressForm(false)}>취소</button>
                  <button className="order-addr-save-btn" onClick={handleAddressSubmit}>저장</button>
                </div>

                {showAddressPostcode && (
                  <div className="order-postcode-overlay" onClick={() => setShowAddressPostcode(false)}>
                    <div className="order-postcode-popup" onClick={e => e.stopPropagation()}>
                      <div className="order-postcode-header">
                        <span>주소 검색</span>
                        <button onClick={() => setShowAddressPostcode(false)}>✕</button>
                      </div>
                      <DaumPostcode onComplete={handleAddressPostcodeComplete} autoClose={false} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* 주소 목록 */
              <div className="order-addr-list">
                {addresses.length === 0 ? (
                  <p className="order-addr-empty">저장된 배송지가 없습니다.</p>
                ) : (
                  addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`order-addr-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => { applyAddress(addr); setShowAddressPanel(false); }}
                    >
                      <div className="order-addr-card-info">
                        <div className="order-addr-card-top">
                          <span className="order-addr-card-name">{addr.recipientName}</span>
                          <span className="order-addr-card-phone">{addr.recipientPhone}</span>
                          {addr.isDefault && <span className="order-addr-default-badge">기본</span>}
                        </div>
                        <p className="order-addr-card-address">[{addr.zipCode}] {addr.baseAddress} {addr.detailAddress}</p>
                      </div>
                      <div className="order-addr-card-actions" onClick={e => e.stopPropagation()}>
                        {!addr.isDefault && (
                          <button className="order-addr-action-btn" onClick={() => handleSetDefault(addr.id)}>기본 설정</button>
                        )}
                        <button className="order-addr-action-btn order-addr-delete-btn" onClick={() => handleDeleteAddress(addr.id)}>삭제</button>
                      </div>
                    </div>
                  ))
                )}
                <button className="order-addr-add-btn" onClick={() => setShowAddressForm(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  새 배송지 추가
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderModal;
