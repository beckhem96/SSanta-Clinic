import React, { useState } from 'react';
import {
  BoxDetailContainer,
  CloseButton,
  BoxDetailTop,
  BoxDetailMiddle,
  BoxDetailBottom,
  SenderText,
  ContentText,
  PlayButton,
  ImageButton,
  ButtonsDiv,
} from './styles';
import { PictureModal } from '../pictureModal/index';
import { API_BASE_URL } from '../../../apis/url';
import axios from 'axios';

type BoxDetailProps = {
  setBoxDetailOpen: React.Dispatch<React.SetStateAction<boolean>>;
  boxDetailOpen: boolean;
  boxDetail: any;
  boxId: number;
};

export function BoxDetail(props: BoxDetailProps) {
  const ACCESS_TOKEN = localStorage.getItem('jwt') || '';
  const BASE_URL = API_BASE_URL;

  // 오디오 재생(calendar/play?boxId=${props.boxId})
  const playAudio = () => {
    axios
      .get(BASE_URL + `calendar/play?boxId=${props.boxId}`, {
        headers: {
          Authorization: ACCESS_TOKEN,
        },
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const closeBoxDetailModal = () => {
    props.setBoxDetailOpen(false);
  };

  // 사진 모달
  const [pictureModalOpen, setPictureModalOpen] = useState(false);
  const openPictureModal = () => {
    setPictureModalOpen(true);
  };

  if (!props.boxDetailOpen) {
    return null;
  } else {
    return (
      <BoxDetailContainer>
        <PictureModal
          pictureModalOpen={pictureModalOpen}
          images={props.boxDetail.imges}
          setPictureModalOpen={setPictureModalOpen}
        ></PictureModal>
        <BoxDetailTop>
          <CloseButton onClick={closeBoxDetailModal}>x</CloseButton>
        </BoxDetailTop>
        <BoxDetailMiddle>
          <ButtonsDiv>
            <ImageButton onClick={openPictureModal}>🖼️</ImageButton>
            <PlayButton
              onClick={() => {
                playAudio();
              }}
            >
              📟
            </PlayButton>
          </ButtonsDiv>
          <ContentText>{props.boxDetail.content}</ContentText>
        </BoxDetailMiddle>
        <BoxDetailBottom>
          <SenderText>From. {props.boxDetail.sender}</SenderText>
        </BoxDetailBottom>
      </BoxDetailContainer>
    );
  }
}
