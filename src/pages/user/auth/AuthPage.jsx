import React, { useState } from "react";
import "../auth/auth.css"
import LoginForm from "./LoginForm";
import JoinForm from "./JoinForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import FindIdForm from "./FindIdForm";

function AuthModal({ onClose }) {
    const [view, setView] = useState("login"); // "login" | "join" | "forgot" | "findId"

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="auth-overlay" onClick={handleOverlayClick}>
            <div className="auth-container">
                <button className="auth-close" onClick={onClose}>
                    ✕
                </button>
                <div className="auth-brand">
                    <div className="auth-brand-line"></div>
                    <h1 className="auth-title">Outfit Archive</h1>
                    <p className="auth-subtitle">당신의 패션, 당신의 이야기</p>
                </div>
                <div className="auth-form">
                    {(view === "login" || view === "join") && (
                        <div className="form-toggle">
                            <button
                                className={view === "login" ? "active" : ""}
                                onClick={() => setView("login")}
                            >
                                로그인
                            </button>
                            <button
                                className={view === "join" ? "active" : ""}
                                onClick={() => setView("join")}
                            >
                                회원가입
                            </button>
                        </div>
                    )}
                    {view === "forgot" && (
                        <p style={{ fontWeight: 600, fontSize: "0.95em", color: "#222", marginBottom: 20 }}>
                            비밀번호 찾기
                        </p>
                    )}
                    {view === "findId" && (
                        <p style={{ fontWeight: 600, fontSize: "0.95em", color: "#222", marginBottom: 20 }}>
                            아이디 찾기
                        </p>
                    )}
                    <div className="form-content" key={view}>
                        {view === "login" && (
                            <>
                                <LoginForm onClose={onClose} />
                                <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: 12 }}>
                                    <button
                                        type="button"
                                        onClick={() => setView("findId")}
                                        style={{ background: "none", border: "none", color: "#888", fontSize: "0.8em", cursor: "pointer" }}
                                    >
                                        아이디 찾기
                                    </button>
                                    <span style={{ color: "#ddd", fontSize: "0.8em", lineHeight: "1.8" }}>|</span>
                                    <button
                                        type="button"
                                        onClick={() => setView("forgot")}
                                        style={{ background: "none", border: "none", color: "#888", fontSize: "0.8em", cursor: "pointer" }}
                                    >
                                        비밀번호 찾기
                                    </button>
                                </div>
                            </>
                        )}
                        {view === "join" && <JoinForm onSuccess={() => setView("login")} />}
                        {view === "forgot" && <ForgotPasswordForm onBack={() => setView("login")} />}
                        {view === "findId" && <FindIdForm onBack={() => setView("login")} />}
                    </div>
                </div>
                <div className="auth-footer">
                    <p>패션 커뮤니티에 참여하세요</p>
                </div>
            </div>
        </div>
    );
}

export default AuthModal;
