import React, { useState, useEffect } from 'react';
import { ResultDiv, CoinImg } from './resultstyle';
import { SSantaApi } from '../../../apis/ssantaApi';
import { useNavigate } from 'react-router-dom';
import { Money } from '../../../store/store';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import axios from 'axios';
import { API_BASE_URL } from '../../../apis/url';
interface ResultProp {
  money: number;
  round: number;
  isSucces: boolean;
  onClose: (value: React.SetStateAction<boolean>) => void;
}

export default function ResultMemory(props: ResultProp) {
  const BASE_URL = API_BASE_URL;
  const navigate = useNavigate();
  const { money, onClose, round, isSucces } = props;

  const setUserMoney = useSetRecoilState(Money);
  // const totalmoney = useRecoilValue(Money);
  const ACCESS_TOKEN = `${localStorage.getItem('jwt')}`;

  useEffect(() => {
    axios({
      method: 'patch',
      url: `${BASE_URL}coin`,
      data: { coin: money },
      headers: { Authorization: ACCESS_TOKEN },
    }).then((res) => {
      console.log(res);
      // setUserMoney(res.data);
    });
  }, []);

  return (
    <ResultDiv>
      {isSucces ? (
        <div>
          memory
          <p>감사합니다 {round}까지 해결해 주셨어요!</p>
          <p>알바비드릴게요!</p>
          {money}
          <CoinImg src="img/coin.png"></CoinImg>
        </div>
      ) : (
        '실망스럽습니다'
      )}
      <button onClick={() => onClose(false)}>돌아가기</button>
    </ResultDiv>
  );
}
