import axios from 'axios';
import React, { useState, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './index.module.css';
import {
  FriendModalContainer,
  FriendModalBottomContainer,
  FriendModalTopContainer,
  FriendModalCloseButton,
  FriendSearchInput,
  FollowerContainer,
  FollowingContainer,
  FollowerText,
  FollowingText,
  FollowListContainer,
  FollowNickName,
  FollowEmoji,
  PeopleContainer,
  SearchListContainer,
} from './styles';

export default function FriendModal(props: any) {
  // 크리스마스 관련 이모지 중 랜덤 이모지 선택
  const christmasEmojiList = [
    '🎄',
    '🎅',
    '🎁',
    '🎉',
    '🎊',
    '🎈',
    '🎏',
    '🎇',
    '🎆',
    '🎐',
    '🎑',
    '🎀',
  ];

  const [isModal, setIsModal] = [props.isModal, props.setIsModal];
  // const [friendList, setFriendList] = [props.friendList, props.setFriendList];
  const [followingList, setFollowingList] = [
    props.followingList,
    props.setFollowingList,
  ];
  const [followerList, setFollowerList] = [
    props.followerList,
    props.setFollowerList,
  ];
  // 친구 검색(api/user/search)
  const ACCESS_TOKEN = localStorage.getItem('jwt');
  const [searchList, setSearchList] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [isSearch, setIsSearch] = useState(false);

  const handleSearchInput = (e: any) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    axios
      .post(
        `http://localhost:8080/api/user/search`,
        { nickName: searchInput },
        {
          headers: {
            Authorization: ACCESS_TOKEN,
          },
        },
      )
      .then((res) => {
        console.log(res.data);
        // 해당 유저의 마이룸으로 이동
      })
      .catch((err) => {
        console.log(err.response);
        alert('해당하는 유저가 없습니다.');
      });
  };

  function onClickClose() {
    setIsModal(false);
  }

  return (
    <div className={isModal ? styles['modal'] : styles['close']}>
      <section>
        <FriendModalContainer>
          {/* 검색 결과 */}
          {/* 팔로잉 목록 */}
          <Fragment>
            <FriendModalTopContainer>
              <FriendSearchInput
                type="text"
                placeholder="🎅 닉네임으로 친구 찾기"
                onChange={handleSearchInput}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                    // 검색 후 input 초기화
                    setSearchInput('');
                    // 검색 후 input focus
                    e.target.focus();
                    // 검색 후 input value 초기화
                    e.target.value = '';
                  }
                }}
              />
              <FriendModalCloseButton type="button" onClick={onClickClose}>
                X
              </FriendModalCloseButton>
            </FriendModalTopContainer>
            <FriendModalBottomContainer>
              <FollowerContainer>
                <FollowerText>팔로워</FollowerText>
                {followerList.map((follower: any) => (
                  <FollowListContainer key={follower.userId}>
                    <FollowEmoji>
                      {
                        christmasEmojiList[
                          Math.floor(Math.random() * christmasEmojiList.length)
                        ]
                      }
                    </FollowEmoji>
                    <FollowNickName>{follower.nickName}</FollowNickName>
                  </FollowListContainer>
                ))}
              </FollowerContainer>
              <FollowingContainer>
                <FollowingText>팔로잉</FollowingText>
                <PeopleContainer>
                  {followingList.map((following: any) => (
                    <FollowListContainer key={following.userId}>
                      <FollowEmoji>
                        {
                          christmasEmojiList[
                            Math.floor(
                              Math.random() * christmasEmojiList.length,
                            )
                          ]
                        }
                      </FollowEmoji>
                      <FollowNickName>{following.nickName}</FollowNickName>
                    </FollowListContainer>
                  ))}
                </PeopleContainer>
              </FollowingContainer>
            </FriendModalBottomContainer>
          </Fragment>
        </FriendModalContainer>
      </section>
    </div>
  );
}
