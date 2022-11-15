import React, { useEffect } from 'react';
import { WriteLetter } from '../../components/letter/WriteLetter';
import { Wrapper, CanvasContainer, LetterPageContainer } from './styles';
import { LetterWriteModel } from '../../three/LetterWrite';
import { Button } from './styles';
import { motion } from 'framer-motion';
export const WriteLetterPage = (props: any) => {
  const { onBack, goList } = props;
  useEffect(() => {
    console.log(onBack, 'ghkrd;s');
    const letterCanvas = new LetterWriteModel();
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
      <LetterPageContainer id="letter-container">
        <WriteLetter />
        <Button
          as={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          id="write-back-button"
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
