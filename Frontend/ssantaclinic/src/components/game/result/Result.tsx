import React, { useState, useCallback, useEffect } from 'react';
import { ResultDiv, CoinImg } from './resultstyle';
import axios from 'axios';
import { API_BASE_URL } from '../../../apis/url';
interface ResultProp {
  isSucces: boolean;
  time: number | null;
  round: number | null;
  money: number;
  onClose: (value: React.SetStateAction<boolean>) => void;
}

export default function Result(props: ResultProp) {
  const { isSucces, onClose, time, money } = props;
  const BASE_URL = API_BASE_URL;
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
  console.log(time);
  return (
    <ResultDiv>
      {isSucces ? (
        <div>
          memory
          <p>감사합니다 {time}만에 해결해 주셨어요!</p>
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
