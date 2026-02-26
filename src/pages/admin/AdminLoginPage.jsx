import React, { useState } from "react";
import { useAuth } from "../../store/context/UserContext";
import { postLogin } from "../../api/auth";
import "./AdminLoginPage.css";

function AdminLoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [loginForm, setLoginForm] = useState({ userId: "", userPwd: "" });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    postLogin(loginForm)
      .then((res) => {
        const userInfo = res.data;
        if (userInfo.authName === "ROLE_ADMIN") {
          login(userInfo);
          onLoginSuccess();
        } else {
          setError("관리자 권한이 없는 계정입니다.");
        }
      })
      .catch((error) => {
        const msg = error.response?.data?.msg || "로그인에 실패했습니다.";
        setError(msg);
      });
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
          <h1 className="admin-login-title">Outfit Archive</h1>
          <p className="admin-login-subtitle">관리자 로그인</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label htmlFor="admin-userId">아이디</label>
            <input
              type="text"
              id="admin-userId"
              name="userId"
              value={loginForm.userId}
              onChange={handleInputChange}
              placeholder="관리자 아이디를 입력하세요"
              required
            />
          </div>
          <div className="admin-login-field">
            <label htmlFor="admin-userPwd">비밀번호</label>
            <input
              type="password"
              id="admin-userPwd"
              name="userPwd"
              value={loginForm.userPwd}
              onChange={handleInputChange}
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && <p className="admin-login-error">{error}</p>}

          <button type="submit" className="admin-login-btn">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginPage;
