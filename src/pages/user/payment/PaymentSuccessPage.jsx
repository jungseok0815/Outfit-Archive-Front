import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmPayment } from "../../../api/user/payment";
import "./PaymentPage.css";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [orderInfo, setOrderInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    ConfirmPayment({ paymentKey, orderId, amount: Number(amount) })
      .then(res => {
        setOrderInfo(res.data);
        setStatus("success");
      })
      .catch(err => {
        setErrorMsg(err.response?.data?.msg || "결제 승인 중 오류가 발생했습니다.");
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="payment-spinner" />
          <p className="payment-loading-text">결제를 처리하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="payment-icon error">✕</div>
          <h2 className="payment-title">결제 실패</h2>
          <p className="payment-desc">{errorMsg}</p>
          <div className="payment-actions">
            <button className="payment-btn secondary" onClick={() => navigate(-2)}>
              상품으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-icon success">✓</div>
        <h2 className="payment-title">결제 완료</h2>
        <p className="payment-desc">주문이 성공적으로 완료되었습니다.</p>

        {orderInfo && (
          <div className="payment-order-info">
            <div className="payment-info-row">
              <span className="payment-info-label">주문 상품</span>
              <span className="payment-info-value">{orderInfo.productNm}</span>
            </div>
            <div className="payment-info-row">
              <span className="payment-info-label">수량</span>
              <span className="payment-info-value">{orderInfo.quantity}개</span>
            </div>
            <div className="payment-info-row">
              <span className="payment-info-label">결제 금액</span>
              <span className="payment-info-value">{orderInfo.actualPayment?.toLocaleString()}원</span>
            </div>
            {orderInfo.usedPoint > 0 && (
              <div className="payment-info-row">
                <span className="payment-info-label">포인트 사용</span>
                <span className="payment-info-value">− {orderInfo.usedPoint?.toLocaleString()}P</span>
              </div>
            )}
            {orderInfo.earnedPoint > 0 && (
              <div className="payment-info-row">
                <span className="payment-info-label">적립 포인트</span>
                <span className="payment-info-value earn">+ {orderInfo.earnedPoint?.toLocaleString()}P</span>
              </div>
            )}
          </div>
        )}

        <div className="payment-actions">
          <button className="payment-btn secondary" onClick={() => navigate("/shop")}>
            쇼핑 계속하기
          </button>
          <button className="payment-btn primary" onClick={() => navigate("/mypage")}>
            주문 내역 보기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
