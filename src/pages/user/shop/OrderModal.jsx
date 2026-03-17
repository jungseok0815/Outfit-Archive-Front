import React, { useState, useEffect, useRef } from "react";
import { loadTossPayments } from "@tosspayments/payment-sdk";
import DaumPostcode from "react-daum-postcode";
import { InsertOrder } from "../../../api/user/order";
import { GetPoint } from "../../../api/user/point";
import "./OrderModal.css";

const TOSS_CLIENT_KEY = "test_ck_zXLkKEypNArWmo50nX3lmeaxYG5R";

function OrderModal({ product, onClose }) {
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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const detailAddressRef = useRef(null);

  useEffect(() => {
    GetPoint()
      .then(res => setAvailablePoint(res.data.point || 0))
      .catch(() => {});
  }, []);

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

  const handleQuantityChange = (delta) => {
    setForm(prev => ({
      ...prev,
      quantity: Math.max(1, Math.min(product.productQuantity, prev.quantity + delta)),
    }));
  };

  const totalPrice = product.productPrice * form.quantity;
  const usePoint = Math.min(Number(form.usePoint) || 0, availablePoint, totalPrice);
  const finalPrice = Math.max(0, totalPrice - usePoint);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.recipientName.trim()) { setError("수령인 이름을 입력해주세요."); return; }
    if (!form.recipientPhone.trim()) { setError("연락처를 입력해주세요."); return; }
    if (!form.baseAddress.trim()) { setError("배송지를 입력해주세요."); return; }

    setSubmitting(true);
    setError("");

    try {
      // 1단계: 주문 생성 (PENDING 상태)
      const res = await InsertOrder({
        productId: product.id,
        quantity: form.quantity,
        recipientName: form.recipientName.trim(),
        recipientPhone: form.recipientPhone.trim(),
        shippingAddress: `[${form.zipCode}] ${form.baseAddress} ${form.detailAddress}`.trim(),
        usePoint,
      });

      const { tossOrderId, actualPayment, productNm } = res.data;

      // 2단계: 토스 결제창 열기
      const tossPayments = await loadTossPayments(TOSS_CLIENT_KEY);
      await tossPayments.requestPayment("카드", {
        amount: actualPayment,
        orderId: tossOrderId,
        orderName: productNm,
        customerName: form.recipientName.trim(),
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });

    } catch (err) {
      // 토스 결제창 닫기(취소)는 에러를 던지지 않고 그냥 종료됨
      const msg = err?.response?.data?.msg || err?.message || "";
      if (msg) setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const thumbImg = product.images?.length > 0 ? product.images[0].imgPath : null;

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
              {thumbImg
                ? <img src={thumbImg} alt={product.productNm} />
                : <div className="order-product-thumb-empty" />
              }
            </div>
            <div className="order-product-info">
              <span className="order-product-brand">{product.brandNm}</span>
              <span className="order-product-name">{product.productNm}</span>
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
                <span className="order-qty-stock">재고 {product.productQuantity}개</span>
              </div>
            </div>

            {/* 수령인 */}
            <div className="order-field">
              <label className="order-label">수령인</label>
              <input
                className="order-input"
                type="text"
                name="recipientName"
                value={form.recipientName}
                onChange={handleChange}
                placeholder="수령인 이름"
              />
            </div>

            {/* 연락처 */}
            <div className="order-field">
              <label className="order-label">연락처</label>
              <input
                className="order-input"
                type="text"
                name="recipientPhone"
                value={form.recipientPhone}
                onChange={handleChange}
                placeholder="010-0000-0000"
              />
            </div>

            {/* 배송지 */}
            <div className="order-field order-field-address">
              <label className="order-label">배송지</label>
              <div className="order-address-wrap">
                <div className="order-address-zip-row">
                  <input
                    className="order-input order-input-zip"
                    type="text"
                    value={form.zipCode}
                    readOnly
                    placeholder="우편번호"
                  />
                  <button
                    type="button"
                    className="order-address-search-btn"
                    onClick={() => setShowPostcode(true)}
                  >
                    주소 검색
                  </button>
                </div>
                <input
                  className="order-input"
                  type="text"
                  value={form.baseAddress}
                  readOnly
                  placeholder="기본 주소"
                />
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

            {/* 포인트 사용 */}
            <div className="order-field">
              <label className="order-label">포인트</label>
              <div className="order-point-wrap">
                <input
                  className="order-input order-point-input"
                  type="number"
                  name="usePoint"
                  value={form.usePoint}
                  onChange={handleChange}
                  min={0}
                  max={availablePoint}
                  placeholder="0"
                />
                <span className="order-point-available">보유 {availablePoint.toLocaleString()} P</span>
              </div>
            </div>

            {/* 결제 요약 */}
            <div className="order-summary">
              <div className="order-summary-row">
                <span>상품금액</span>
                <span>{totalPrice.toLocaleString()}원</span>
              </div>
              {usePoint > 0 && (
                <div className="order-summary-row discount">
                  <span>포인트 할인</span>
                  <span>− {usePoint.toLocaleString()}P</span>
                </div>
              )}
              <div className="order-summary-row total">
                <span>최종 결제금액</span>
                <strong>{finalPrice.toLocaleString()}원</strong>
              </div>
            </div>

            {error && <p className="order-error">{error}</p>}

            <button
              type="submit"
              className="order-submit-btn"
              disabled={submitting}
            >
              {submitting ? "처리 중..." : `${finalPrice.toLocaleString()}원 결제하기`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OrderModal;
