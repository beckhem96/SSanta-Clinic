import React, { useState, useEffect, Fragment } from 'react';
import {
  ItemAlert,
  Button,
  ButtonDiv,
  TextSpan,
  SuccessAlert,
  NumberBox,
  NextNumber,
  NumberContainer,
  PrevNumber,
} from './styles';
import axios from 'axios';
import { API_BASE_URL } from '../../apis/url';
import { Money, MyItems } from '../../store/store';
import { useRecoilValue, useSetRecoilState } from 'recoil';

// import { SSantaApi } from '../../apis/ssantaApi';
// import { useNavigate } from 'react-router-dom';

interface Iprops {
  item: number;
  userId: number;
  cost: number;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Request {
  itemId: number;
  count: number;
  userId: number;
}

export default function ShopAlert(props: Iprops) {
  const BASE_URL = API_BASE_URL;
  // const [itemId, setItemId] = useState<number>(0);
  // const navigate = useNavigate();
  const setUserMoney = useSetRecoilState(Money);
  const money = useRecoilValue(Money);
  const setUserItems = useSetRecoilState(MyItems);
  const items = useRecoilValue(MyItems);

  const { item, userId, cost, onClose } = props;
  const [count, setCount] = useState<number>(0);
  const [data, setData] = useState<Request>();
  const [isBuy, setIsBuy] = useState<boolean>(false);
  const TOKEN = localStorage.getItem('jwt') || '';
  const [isMoneyPossible, setIsMoneyPossible] = useState<boolean>(true);
  const [isItemPossible, setIsItemPossible] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  // const money = useRecoilValue(Money);
  console.log('shopalert:', props);
  const [newItems, setNewItems] = useState<number[]>([]);

  useEffect(() => {
    const nitems = [];
    for (let i = 0; i < count; i++) {
      nitems.push(item);
    }
    setNewItems(nitems);
  }, [count, item]);

  function send(event: any) {
    if (isMoneyPossible && isItemPossible && count > 0) {
      setIsBuy(true);
      axios({
        url: `${BASE_URL}store/buy`,
        method: 'post',
        data: data,
        headers: {
          Authorization: TOKEN,
        },
      }).then((res) => {
        console.log(res);
        setIsBuy(false);
        setUserMoney(res.data.money);
        setUserItems((items) => [...items, ...newItems]);

        setIsSuccess(true);
      });
    }
  }
  useEffect(() => {
    if (isSuccess === true) {
      setTimeout(() => {
        setIsSuccess(false);
        onClose(false);
      }, 2000);
    }
  }, [isSuccess]);

  function changeCount(event: any) {
    setCount(parseInt(event.target.value));
  }

  useEffect(() => {
    setData({
      itemId: item,
      count: count,
      userId: userId,
    });
    if (money < cost * count) {
      setIsMoneyPossible(false);
    } else {
      setIsMoneyPossible(true);
    }

    if (items.length + count > 24) {
      setIsItemPossible(false);
    } else {
      setIsItemPossible(true);
    }
  }, [count]);

  function up() {
    setCount(count + 1);
  }
  function down() {
    if (count > 0) {
      setCount(count - 1);
    }
  }
  useEffect(() => {
    console.log(count);
  }, [count]);

  return (
    <ItemAlert className="alert">
      {isBuy ? <span>?????????</span> : null}
      {isSuccess ? (
        <SuccessAlert>?????? ??????!</SuccessAlert>
      ) : (
        <Fragment>
          <span>?????? {cost}???????????????.</span>
          <span>{item}?????????????????????????</span>

          <NumberContainer>
            <NextNumber onClick={() => up()}></NextNumber>
            <PrevNumber onClick={() => down()}></PrevNumber>
            <NumberBox>
              <span>{count}</span>
            </NumberBox>
          </NumberContainer>

          {/* <input
            type="number"
            value={count}
            onChange={changeCount}
            min="0"
          ></input> */}
          <ButtonDiv>
            <Button onClick={send}>??????!</Button>
            <Button
              onClick={() => {
                onClose(false);
              }}
            >
              ??????
            </Button>
          </ButtonDiv>
        </Fragment>
      )}

      {isItemPossible && isMoneyPossible ? null : isItemPossible ? (
        <TextSpan>?????? ???????????????.</TextSpan>
      ) : isMoneyPossible ? (
        <TextSpan>??????????????? ???????????????.</TextSpan>
      ) : (
        <TextSpan>?????? ??????, ??????????????? ??????</TextSpan>
      )}
    </ItemAlert>
  );
}
