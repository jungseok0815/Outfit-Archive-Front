import React, { useState, useCallback } from "react";
import "../auth/loginForm.css";
import { postForgotPassword } from "../../../api/user/auth";
import Toast from "../../../components/common/Toast/Toast";

function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const closeToast = useCallback(() => setToast({ message: "", type: "success" }), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    postForgotPassword(email)
      .then(() => {
        setSent(true);
      })
      .catch(() => {
        setToast({ message: "이메일 발송에 실패했습니다. 잠시 후 다시 시도해주세요.", type: "error" });
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      {sent ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontSize: "0.95em", color: "#222", marginBottom: "8px", fontWeight: 600 }}>
            이메일을 확인해주세요
          </p>
          <p style={{ fontSize: "0.82em", color: "#888", lineHeight: 1.6, marginBottom: "24px" }}>
            <strong>{email}</strong>로<br />
            비밀번호 재설정 링크를 발송했습니다.<br />
            링크는 10분간 유효합니다.
          </p>
          <button className="submit-button" onClick={onBack}>
            로그인으로 돌아가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: "0.82em", color: "#888", marginBottom: "20px", lineHeight: 1.6 }}>
            가입 시 사용한 이메일을 입력하시면<br />
            비밀번호 재설정 링크를 보내드립니다.
          </p>
          <div className="form-group">
            <label htmlFor="resetEmail">이메일</label>
            <input
              type="email"
              id="resetEmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "발송 중..." : "재설정 링크 발송"}
          </button>
          <button
            type="button"
            onClick={onBack}
            style={{ width: "100%", marginTop: "10px", padding: "10px", background: "none", border: "none", color: "#888", fontSize: "0.82em", cursor: "pointer" }}
          >
            로그인으로 돌아가기
          </button>
        </form>
      )}
    </>
  );
}

export default ForgotPasswordForm;
