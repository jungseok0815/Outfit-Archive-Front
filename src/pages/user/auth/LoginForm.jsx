import React, { useState } from "react";
import "../auth/loginForm.css"
import { useAuth } from "../../../store/context/UserContext";
import { postLogin } from "../../../api/user/auth"
function LoginForm({ onClose }) {
  const { login } = useAuth()

  const [loginForm, setLoginForm] = useState({
    userId: "",
    userPwd: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleSubmit = (e) => {
      e.preventDefault();
      console.log(loginForm)
      postLogin(loginForm).then(res =>{
        const userInfo = res.data;
        login(userInfo)
        onClose();
      }).catch(error => {
          const errorResult = error.response.data
          alert(errorResult.msg)
      })
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="userId">아이디</label>
        <input
          type="text"
          id="userId"
          name="userId"
          value={loginForm.userId}
          onChange={handleInputChange}
          placeholder="아이디를 입력하세요"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="userPwd">비밀번호</label>
        <input
          type="password"
          id="userPwd"
          name="userPwd"
          value={loginForm.userPwd}
          onChange={handleInputChange}
          placeholder="비밀번호를 입력하세요"
          required
        />
      </div>
      <button type="submit" className="submit-button">
        로그인
      </button>
    </form>
  );
}

export default LoginForm;
