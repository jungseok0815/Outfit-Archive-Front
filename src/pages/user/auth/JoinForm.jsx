import React,{useState, useCallback} from "react";
import "../auth/loginForm.css"
import { postJoin } from '../../../api/user/auth';
import Toast from '../../../components/common/Toast/Toast';

function JoinForm(){
  const [joinForm, setJoinForm] = useState({
    userId: "",
    userPwd: "",
    userNm: "",
    userAge: "",
    authName: "USER"
  });
  const [toast, setToast] = useState({ message: "", type: "success" });

  const closeToast = useCallback(() => setToast({ message: "", type: "success" }), []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJoinForm({ ...joinForm, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(joinForm)
    postJoin(joinForm).then(res =>{
        if(res.status === 200) setToast({ message: "회원가입이 완료되었습니다!", type: "success" });
    }).catch(error => {
        const msg = error.response?.data?.msg || '회원가입에 실패했습니다.';
        setToast({ message: msg, type: "error" });
    })
  };
    return (
      <>
      <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      <form onSubmit={handleSubmit}>
        <div className="form-group">
            <label htmlFor="userNm">사용자 이름</label>
            <input
            type="text"
            id="userNm"
            name="userNm"
            value={joinForm.userNm}
            onChange={handleInputChange}
            placeholder="사용자 이름을 입력하세요"
            required
            />
        </div>
        <div className="form-group">
            <label htmlFor="userAge">나이</label>
            <input
            type="number"
            id="userAge"
            name="userAge"
            value={joinForm.userAge}
            onChange={handleInputChange}
            placeholder="나이를 입력하세요"
            required
            min="1"
            max="120"
            />
        </div>
        <div className="form-group">
          <label htmlFor="userId">이메일</label>
          <input
            type="email"
            id="userId"
            name="userId"
            value={joinForm.userId}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="userPwd">비밀번호</label>
          <input
            type="password"
            id="userPwd"
            name="userPwd"
            value={joinForm.userPwd}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        <button type="submit" className="submit-button">
            회원가입
        </button>
      </form>
      </>
    );
}

export default JoinForm;
