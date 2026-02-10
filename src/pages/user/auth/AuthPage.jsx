import React, { useState } from "react";
import "../auth/auth.css"
import LoginForm from "./LoginForm";
import JoinForm from "./JoinForm";

function AuthModal({ onClose }) {
    const [isLogin, setIsLogin] = useState(true);

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
                    <div className="form-toggle">
                        <button
                            className={isLogin ? "active" : ""}
                            onClick={() => setIsLogin(true)}
                        >
                            로그인
                        </button>
                        <button
                            className={!isLogin ? "active" : ""}
                            onClick={() => setIsLogin(false)}
                        >
                            회원가입
                        </button>
                    </div>
                    <div className="form-content" key={isLogin ? "login" : "join"}>
                        {isLogin ? (<LoginForm onClose={onClose} />) : (<JoinForm />)}
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
