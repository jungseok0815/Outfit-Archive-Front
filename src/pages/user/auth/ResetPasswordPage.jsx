import React, { useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../auth/loginForm.css";
import "../auth/auth.css";
import { postResetPassword } from "../../../api/user/auth";
import Toast from "../../../components/common/Toast/Toast";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMismatch, setPwdMismatch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const closeToast = useCallback(() => setToast({ message: "", type: "success" }), []);

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setPwdMismatch(newPassword !== value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMismatch(true);
      return;
    }
    if (!token) {
      setToast({ message: "유효하지 않은 링크입니다.", type: "error" });
      return;
    }
    setLoading(true);
    postResetPassword(token, newPassword)
      .then(() => {
        setDone(true);
      })
      .catch((error) => {
        const msg = error.response?.data?.msg || "유효하지 않거나 만료된 링크입니다.";
        setToast({ message: msg, type: "error" });
      })
      .finally(() => setLoading(false));
  };

  if (!token) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
        <div className="auth-container" style={{ maxWidth: 400 }}>
          <p style={{ color: "#e74c3c", textAlign: "center" }}>유효하지 않은 링크입니다.</p>
          <button className="submit-button" style={{ marginTop: 16 }} onClick={() => navigate("/")}>
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f9f9" }}>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <div className="auth-container" style={{ maxWidth: 400 }}>
        <div className="auth-brand">
          <div className="auth-brand-line"></div>
          <h1 className="auth-title">Outfit Archive</h1>
          <p className="auth-subtitle">비밀번호 재설정</p>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <p style={{ fontSize: "0.95em", color: "#222", fontWeight: 600, marginBottom: 8 }}>
              비밀번호가 변경되었습니다
            </p>
            <p style={{ fontSize: "0.82em", color: "#888", marginBottom: 24 }}>
              새 비밀번호로 로그인해주세요.
            </p>
            <button className="submit-button" onClick={() => navigate("/")}>
              홈으로 이동
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPwdMismatch(confirmPassword !== "" && confirmPassword !== e.target.value);
                }}
                placeholder="새 비밀번호를 입력하세요 (6자 이상)"
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              {pwdMismatch && (
                <p style={{ color: "red", fontSize: "0.8rem", marginTop: 4 }}>
                  비밀번호가 일치하지 않습니다.
                </p>
              )}
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
