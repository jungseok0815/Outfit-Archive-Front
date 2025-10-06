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
                    <p className="auth-subtitle">Your Fashion, Your Story</p>
                </div>
                <div className="auth-form">
                    <div className="form-toggle">
                        <button
                            className={isLogin ? "active" : ""}
                            onClick={() => setIsLogin(true)}
                        >
                            Login
                        </button>
                        <button
                            className={!isLogin ? "active" : ""}
                            onClick={() => setIsLogin(false)}
                        >
                            Sign Up
                        </button>
                    </div>
                    {isLogin ? (<LoginForm  />) : (<JoinForm  />)}
                </div>
                <div className="auth-footer">
                    <p>Join our fashion community</p>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;