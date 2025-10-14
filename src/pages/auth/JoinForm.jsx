import React,{useState} from "react";
import "../../styles/auth/auth.css"
import {postJoin} from '../../api/auth';
function JoinForm(){
  const [joinForm, setJoinForm] = useState({
    email: "",
    password: "",
    username: "",
    age: "",
    AuthName : "USER"
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJoinForm({ ...joinForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postJoin.then(res =>{
        if(res.status === 200 && res.data.success) alert("회원가입이 완료되었습니다!")
    }).catch(error => {
        console.log(error.reponse)
    })
  };
    return (
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="username">사용자 이름</label>
            <input
            type="text"
            id="username"
            name="username"
            value={joinForm.username}
            onChange={handleInputChange}
            placeholder="사용자 이름을 입력하세요"
            required
            />
        </div>
        <div className="form-group">
            <label htmlFor="age">나이</label>
            <input
            type="number"
            id="age"
            name="age"
            value={joinForm.age}
            onChange={handleInputChange}
            placeholder="나이를 입력하세요"
            required
            min="1"
            max="120"
            />
        </div>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={joinForm.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={joinForm.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        <button type="submit" className="submit-button">
            회원가입
        </button>
      </form>
    );
}

export default JoinForm;