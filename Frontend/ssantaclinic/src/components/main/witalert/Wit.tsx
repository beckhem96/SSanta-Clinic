import React, { useState } from 'react';
import { Div } from './styles';
import WitsModal from '../../game/wit/WitsModal';

export function WitAlert() {
  const [isHelp, setisHelp] = useState<boolean>(false);
  function help() {
    setisHelp(true);
  }
  if (!isHelp) {
    return (
      <Div className="witAlert">
        도와 주세요
        <button onClick={help}>ㅇㅋ</button>
      </Div>
    );
  } else {
    return <WitsModal onClose={setisHelp}></WitsModal>;
  }
}
