import React, { useState } from "react";
import "../../styles/auth/auth.css"
import LoginForm from "./LoginForm";
import JoinForm from "./JoinForm";
function AuthPage() {

    const [isLogin, setIsLogin] = useState(true);
    return (
        <div className="loginMain">
            <div className="auth-container">
                <div className="auth-brand">
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
                    {isLogin ? (<LoginForm  />) : (<JoinForm  />)}
                </div>
                <div className="auth-footer">
                    <p>패션 커뮤니티에 참여하세요</p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;