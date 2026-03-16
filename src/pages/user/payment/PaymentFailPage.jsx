import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentPage.css";

function PaymentFailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const message = searchParams.get("message") || "결제가 취소되었거나 오류가 발생했습니다.";
  const code = searchParams.get("code");

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="payment-icon error">✕</div>
        <h2 className="payment-title">결제 실패</h2>
        <p className="payment-desc">{message}</p>
        {code && <p className="payment-code">오류 코드: {code}</p>}
        <div className="payment-actions">
          <button className="payment-btn secondary" onClick={() => navigate(-2)}>
            상품으로 돌아가기
          </button>
          <button className="payment-btn primary" onClick={() => navigate("/shop")}>
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailPage;
