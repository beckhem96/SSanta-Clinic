import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function FindPassword() {
  const [email, setEmail] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    setIsValid(true);
    axios
      .post('api/user/find/password', {
        email: email,
      })
      .then((res) => {
        // 비밀번호 찾는 url이 응답일 듯
        console.log('응답 받아옴 성공!', res.data);
        // setUUID로 나중에 변경
      })
      .catch((err) => {
        console.log(err.resonse);
      });
  };

  function changePasswordPage() {
    navigate('/changepassword');
  }
  return (
    <div id="find-password-container">
      <div id="find-password">
        <h1>비밀번호 찾기 위한 이메일확인</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          value={email}
          placeholder="이메일"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input type="submit" />
      </form>
      {isValid === true && (
        <p onClick={changePasswordPage}>비밀번호 찾으러 가기</p>
      )}
    </div>
  );
}
