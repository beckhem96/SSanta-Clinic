import React, { useEffect } from 'react';
import {
  Wrapper,
  CanvasContainer,
  LetterPageContainer,
  Button,
} from './styles';
import { ReceiveLetter } from '../../components/letter/ReceiveLetter';
import { LetterReceiveModel } from '../../three/LetterReceive';
export const ReceiveLetterPage = (props: any) => {
  const { onBack, goList } = props;
  useEffect(() => {
    const letterCanvas = new LetterReceiveModel();
    console.log('useeffect');
    const requestId1 = requestAnimationFrame(
      letterCanvas.render.bind(letterCanvas),
    );

    return () => {
      cancelAnimationFrame(requestId1);
    };
  }, []);
  return (
    <Wrapper>
      <LetterPageContainer id="letter-receive-page-container">
        <ReceiveLetter />
        <Button
          id="receive-back-button"
          onClick={() => {
            onBack(false);
            goList(true);
          }}
        >
          뒤로가기
        </Button>
      </LetterPageContainer>
      <CanvasContainer id="letter-canvas"></CanvasContainer>
    </Wrapper>
  );
};
