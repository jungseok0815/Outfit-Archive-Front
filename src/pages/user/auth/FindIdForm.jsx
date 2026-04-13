import React, { useState, useCallback } from "react";
import "../auth/loginForm.css";
import { getFindId } from "../../../api/user/auth";
import Toast from "../../../components/common/Toast/Toast";

function FindIdForm({ onBack }) {
  const [phone, setPhone] = useState("");
  const [foundId, setFoundId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const closeToast = useCallback(() => setToast({ message: "", type: "success" }), []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    getFindId(phone)
      .then((res) => {
        setFoundId(res.data.userId);
      })
      .catch(() => {
        setToast({ message: "해당 전화번호로 가입된 계정이 없습니다.", type: "error" });
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      {foundId ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontSize: "0.82em", color: "#888", marginBottom: "12px" }}>
            가입된 이메일 아이디
          </p>
          <p style={{ fontSize: "1.1em", fontWeight: 700, color: "#222", marginBottom: "24px", letterSpacing: "0.5px" }}>
            {foundId}
          </p>
          <button className="submit-button" onClick={onBack}>
            로그인하러 가기
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: "0.82em", color: "#888", marginBottom: "20px", lineHeight: 1.6 }}>
            가입 시 등록한 전화번호를 입력하시면<br />
            아이디를 확인할 수 있습니다.
          </p>
          <div className="form-group">
            <label htmlFor="findIdPhone">전화번호</label>
            <input
              type="tel"
              id="findIdPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호를 입력하세요 (예: 01012345678)"
              required
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "조회 중..." : "아이디 찾기"}
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

export default FindIdForm;
