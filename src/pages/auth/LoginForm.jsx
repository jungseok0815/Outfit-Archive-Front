import React, {  useState,createContext, Context } from "react";
import "../../styles/auth/loginForm.css"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../store/context/UserContext";
import { postLogin} from "../../api/auth"
function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate();

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
      postLogin(loginForm).then(res =>{
        const userInfo = res.data.data;   
        login(userInfo)
        if(userInfo.authName === "ROLE_USER") navigate("/")
        if(userInfo.authName === "ROLE_ADMIN") navigate("/admin")        
      }).catch(error => {
          const errorResult = error.response.data
          alert(errorResult.msg)
      }) 
  };

  return (
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
      <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="userId"
            name="userId"
            value={loginForm.userId}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
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
    </div>
  );
}

export default LoginForm;
