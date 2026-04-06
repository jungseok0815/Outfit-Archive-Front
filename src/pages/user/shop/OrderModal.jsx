import { useState, useEffect, useRef } from "react";
import DaumPostcode from "react-daum-postcode";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import { InsertOrder } from "../../../api/user/order";
import { GetPoint } from "../../../api/user/point";
import { GetMyCoupons } from "../../../api/user/coupon";
import { ListAddress, InsertAddress, DeleteAddress, SetDefaultAddress } from "../../../api/user/address";
import "./OrderModal.css";

function OrderModal({ product, selectedSize, onClose }) {
  const [form, setForm] = useState({ quantity: 1, usePoint: 0 });
  const [availablePoint, setAvailablePoint] = useState(0);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 주소 상태
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const [addressForm, setAddressForm] = useState({
    recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false,
  });
  const detailRef = useRef(null);

  useEffect(() => {
    GetPoint().then(res => setAvailablePoint(res.data.point || 0)).catch(() => {});
    GetMyCoupons()
      .then(res => {
        const now = new Date();
        const valid = (res.data || []).filter(c => !c.isUsed && new Date(c.expiredAt) >= now);
        setCoupons(valid);
      })
      .catch(() => {});
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    ListAddress()
      .then(res => {
        const list = res.data || [];
        setAddresses(list);
        const def = list.find(a => a.isDefault);
        if (def) setSelectedAddressId(def.id);
      })
      .catch(() => {});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const maxQuantity = selectedSize ? selectedSize.quantity : product.productQuantity;
  const handleQuantityChange = (delta) => {
    setForm(prev => ({ ...prev, quantity: Math.max(1, Math.min(maxQuantity, prev.quantity + delta)) }));
  };

  // 쿠폰이 이 상품에 적용 가능한지 확인 (카테고리/브랜드 제한)
  const isCouponApplicable = (coupon) => {
    const cats = coupon.targetCategories || [];
    const brandIds = coupon.targetBrandIds || [];
    if (cats.length === 0 && brandIds.length === 0) return true;
    if (cats.length > 0 && cats.includes(product.category)) return true;
    if (brandIds.length > 0 && brandIds.includes(product.brandId)) return true;
    return false;
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
    if (!selectedAddressId) { setError("배송지를 선택해주세요."); return; }
    const addr = addresses.find(a => a.id === selectedAddressId);
    if (!addr) { setError("배송지를 선택해주세요."); return; }

    setSubmitting(true);
    setError("");
    try {
      const res = await InsertOrder({
        productId: product.id,
        quantity: form.quantity,
        recipientName: addr.recipientName,
        recipientPhone: addr.recipientPhone,
        shippingAddress: `[${addr.zipCode}] ${addr.baseAddress} ${addr.detailAddress || ""}`.trim(),
        usePoint,
        sizeNm: selectedSize?.sizeNm || null,
        userCouponId: selectedCoupon?.userCouponId || null,
      });

      const tossPayments = await loadTossPayments(process.env.REACT_APP_TOSS_CLIENT_KEY);
      await tossPayments.requestPayment("카드", {
        amount: finalPrice,
        orderId: res.data.tossOrderId,
        orderName: product.productNm,
        customerName: addr.recipientName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
      // requestPayment 성공 시 토스가 successUrl로 리다이렉트하므로 아래 코드는 실행되지 않음
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.message || "";
      if (msg) setError(msg);
      setSubmitting(false);
    }
  };

  // 주소 추가 폼
  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePostcodeComplete = (data) => {
    const address = data.roadAddress || data.jibunAddress;
    setAddressForm(prev => ({ ...prev, zipCode: data.zonecode, baseAddress: address, detailAddress: "" }));
    setShowPostcode(false);
    setTimeout(() => detailRef.current?.focus(), 100);
  };

  const handleAddressSubmit = () => {
    if (!addressForm.recipientName.trim()) return;
    if (!addressForm.recipientPhone.trim()) return;
    if (!addressForm.baseAddress.trim()) return;
    InsertAddress({
      recipientName: addressForm.recipientName.trim(),
      recipientPhone: addressForm.recipientPhone.trim(),
      zipCode: addressForm.zipCode,
      baseAddress: addressForm.baseAddress,
      detailAddress: addressForm.detailAddress.trim(),
      isDefault: addressForm.isDefault,
    })
      .then(() => {
        loadAddresses();
        setShowAddressForm(false);
        setAddressForm({ recipientName: "", recipientPhone: "", zipCode: "", baseAddress: "", detailAddress: "", isDefault: false });
      })
      .catch(() => {});
  };

  const handleDeleteAddress = (e, id) => {
    e.stopPropagation();
    DeleteAddress(id)
      .then(() => {
        if (selectedAddressId === id) setSelectedAddressId(null);
        loadAddresses();
      })
      .catch(() => {});
  };

  const handleSetDefault = (e, id) => {
    e.stopPropagation();
    SetDefaultAddress(id).then(() => loadAddresses()).catch(() => {});
  };

  const thumbImg = product.images?.length > 0 ? product.images[0].imgPath : null;

  return (
    <>
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

              {/* 배송지 선택 */}
              <div className="order-section">
                <div className="order-section-header">
                  <span className="order-section-title">배송지</span>
                  <button type="button" className="order-addr-add-btn" onClick={() => setShowAddressForm(true)}>
                    + 배송지 추가
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <p className="order-addr-empty">등록된 배송지가 없습니다. 배송지를 추가해주세요.</p>
                ) : (
                  <div className="order-addr-list">
                    {addresses.map(addr => (
                      <div
                        key={addr.id}
                        className={`order-addr-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddressId(addr.id)}
                      >
                        <div className="order-addr-card-radio">
                          <div className={`order-addr-radio-dot ${selectedAddressId === addr.id ? 'on' : ''}`} />
                        </div>
                        <div className="order-addr-card-info">
                          <div className="order-addr-card-top">
                            <span className="order-addr-card-name">{addr.recipientName}</span>
                            <span className="order-addr-card-phone">{addr.recipientPhone}</span>
                            {addr.isDefault && <span className="order-addr-default-badge">기본</span>}
                          </div>
                          <p className="order-addr-card-address">
                            [{addr.zipCode}] {addr.baseAddress} {addr.detailAddress}
                          </p>
                          <div className="order-addr-card-actions">
                            {!addr.isDefault && (
                              <button type="button" className="order-addr-action-btn" onClick={(e) => handleSetDefault(e, addr.id)}>기본 설정</button>
                            )}
                            <button type="button" className="order-addr-action-btn order-addr-delete-btn" onClick={(e) => handleDeleteAddress(e, addr.id)}>삭제</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 쿠폰 */}
              <div className="order-field">
                <label className="order-label">쿠폰</label>
                <div className="order-coupon-wrap">
                  {(() => {
                    const productCoupons = coupons.filter(isCouponApplicable);
                    if (coupons.length === 0) {
                      return <span className="order-point-available">사용 가능한 쿠폰이 없습니다</span>;
                    }
                    if (productCoupons.length === 0) {
                      return <span className="order-point-available">이 상품에 적용 가능한 쿠폰이 없습니다</span>;
                    }
                    return (
                      <>
                        <select
                          className="order-input order-coupon-select"
                          value={selectedCoupon?.userCouponId || ''}
                          onChange={(e) => {
                            const c = productCoupons.find(c => String(c.userCouponId) === e.target.value);
                            setSelectedCoupon(c || null);
                          }}
                        >
                          <option value="">쿠폰 선택 안함</option>
                          {productCoupons.map(c => {
                            const meetsMin = totalPrice >= (c.minOrderPrice || 0);
                            return (
                              <option key={c.userCouponId} value={c.userCouponId} disabled={!meetsMin}>
                                {formatCouponLabel(c)}{!meetsMin ? ` (${c.minOrderPrice.toLocaleString()}원 이상)` : ''}
                              </option>
                            );
                          })}
                        </select>
                        {selectedCoupon && totalPrice < (selectedCoupon.minOrderPrice || 0) && (
                          <p className="order-coupon-warn">최소 주문금액 {selectedCoupon.minOrderPrice.toLocaleString()}원 이상 구매 시 사용 가능합니다.</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* 포인트 */}
              <div className="order-field">
                <label className="order-label">포인트</label>
                <div className="order-point-wrap">
                  <input className="order-input order-point-input" type="number" name="usePoint" value={form.usePoint} onChange={handleFormChange} min={0} max={availablePoint} placeholder="0" />
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
      </div>

      {/* 배송지 추가 레이어 */}
      {showAddressForm && (
        <div className="order-modal-overlay" onClick={() => setShowAddressForm(false)}>
          <div className="order-modal order-addr-modal" onClick={e => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3 className="order-modal-title">배송지 추가</h3>
              <button className="order-modal-close" onClick={() => setShowAddressForm(false)}>✕</button>
            </div>
            <div className="order-modal-body">
              <div className="order-form">
                <div className="order-field">
                  <label className="order-label">수령인</label>
                  <input className="order-input" type="text" name="recipientName" placeholder="수령인 이름" value={addressForm.recipientName} onChange={handleAddressFormChange} />
                </div>
                <div className="order-field">
                  <label className="order-label">연락처</label>
                  <input className="order-input" type="text" name="recipientPhone" placeholder="010-0000-0000" value={addressForm.recipientPhone} onChange={handleAddressFormChange} />
                </div>
                <div className="order-field order-field-address">
                  <label className="order-label">주소</label>
                  <div className="order-address-wrap">
                    <div className="order-address-zip-row">
                      <input className="order-input order-input-zip" type="text" value={addressForm.zipCode} readOnly placeholder="우편번호" />
                      <button type="button" className="order-address-search-btn" onClick={() => setShowPostcode(true)}>주소 검색</button>
                    </div>
                    <input className="order-input" type="text" value={addressForm.baseAddress} readOnly placeholder="기본 주소" />
                    <input className="order-input" type="text" name="detailAddress" placeholder="상세 주소 (동, 호수 등)" value={addressForm.detailAddress} onChange={handleAddressFormChange} ref={detailRef} />
                  </div>
                </div>
                <label className="order-addr-default-check">
                  <input type="checkbox" name="isDefault" checked={addressForm.isDefault} onChange={handleAddressFormChange} />
                  기본 배송지로 설정
                </label>
                <button type="button" className="order-submit-btn" onClick={handleAddressSubmit}>
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 우편번호 검색 팝업 */}
      {showPostcode && (
        <div className="order-postcode-overlay" onClick={() => setShowPostcode(false)}>
          <div className="order-postcode-popup" onClick={e => e.stopPropagation()}>
            <div className="order-postcode-header">
              <span>주소 검색</span>
              <button onClick={() => setShowPostcode(false)}>✕</button>
            </div>
            <DaumPostcode onComplete={handlePostcodeComplete} autoClose={false} />
          </div>
        </div>
      )}
    </>
  );
}

export default OrderModal;
