import React, { useState } from 'react';

import Timer from './Timer';
import './game.css';

const array: number[] = [];
for (let i = 1; i <= 25; i++) {
  array.push(i);
}
const shuffleArray = (array: number[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function WitsModal(props: any) {
  const { onClose } = props;
  const [numbers, setNumbers] = useState(array);
  const [gameFlag, setGameFlag] = useState(false);
  const [current, setCurrent] = useState(1);

  const handleClick = (num: number) => {
    if (num === current) {
      if (num === 50) {
        console.log('Success');
        //게임 끝 구현
      }
      const index = numbers.indexOf(num);
      setNumbers((numbers) => [
        ...numbers.slice(0, index),
        num < 26 ? num + 25 : 0,
        ...numbers.slice(index + 1),
      ]);
      setCurrent((current) => current + 1);
    }
    if (num === current && gameFlag) {
      if (num === 50) {
        endGame();
      }
    }
  };

  const startGame = () => {
    setNumbers(shuffleArray(array));
    setCurrent(1);
    setGameFlag(true);
  };
  const endGame = () => {
    setGameFlag(false);
  };
  // console.log(typeof handleClick);
  return (
    <div className="game-container">
      <button
        className="outbtn"
        onClick={() => {
          onClose(false);
        }}
      >
        나가기
      </button>
      <div className="wit-content">
        <div className="board-container">
          {numbers.map((num: number, index: number) => (
            <div
              key={index}
              className="cell-container"
              onClick={() => handleClick(num)}
            >
              {num !== 0 ? num : null}
            </div>
          ))}
        </div>
      </div>
      {gameFlag ? <Timer></Timer> : <button onClick={startGame}>start</button>}
    </div>
  );
}
