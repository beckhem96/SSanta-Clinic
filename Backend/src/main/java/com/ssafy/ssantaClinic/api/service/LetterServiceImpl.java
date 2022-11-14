package com.ssafy.ssantaClinic.api.service;

import com.ssafy.ssantaClinic.api.request.SendLetterRequest;
import com.ssafy.ssantaClinic.api.response.LetterResponse;
import com.ssafy.ssantaClinic.common.auth.util.JwtUtil;
import com.ssafy.ssantaClinic.common.exception.CustomException;
import com.ssafy.ssantaClinic.common.exception.ErrorCode;
import com.ssafy.ssantaClinic.db.entity.*;
import com.ssafy.ssantaClinic.db.entity.columnEnum.Emotion;
import com.ssafy.ssantaClinic.db.entity.columnEnum.LetterType;
import com.ssafy.ssantaClinic.db.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class LetterServiceImpl implements LetterService {
    private final SendLetterRepository sendLetterRepository;
    private final ReplyLetterRepository replyLetterRepository;
    private final UserRepository userRepository;
    private final SantaLetterRepository santaLetterRepository;
    private final QuoteRepository quoteRepository;
    private final Random randomizer = new Random();

    @Override
    @Transactional
    public SendLetter save(SendLetterRequest letterRequest) {
        SendLetter letter = SendLetter.builder()
                .user(userRepository.getUserByUserId(JwtUtil.getCurrentUserId()).get())
                .title(letterRequest.getTitle())
                .message(letterRequest.getMessage())
                .type(letterRequest.getType())
                .build();
        sendLetterRepository.save(letter);
        return letter;
    }

    @Override
    @Transactional
    public void makeReplyLetter(int userId, SendLetter sendLetter, Emotion emotion, LetterType type) {
        User user = userRepository.getUserByUserId(userId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_USER_INFO));
        ReplyLetter.ReplyLetterBuilder replyLetter = ReplyLetter.builder();

        List<SantaLetter> santaLetterList = santaLetterRepository.findAllByType(type);
        SantaLetter santaLetter = santaLetterList.get(randomizer.nextInt(santaLetterList.size())); // type에 맞는 것 중 랜덤으로 선택

        replyLetter
                .title(santaLetter.getTitle())
                .isRead(false)
                .isReceived(LocalDateTime.now().plusHours(randomizer.nextInt(2) + 1))// 1~3시간 후에 받을 수 있도록 설정
                .user(user)
                .sendLetter(sendLetter);

        String nickName = user.getNickName();
        // 부정적으로 판정되면 편지 + 명언 아닐경우 그냥 편지만
        if(emotion.equals(Emotion.Negative)){
            List<Quote> quoteList = quoteRepository.findAll();
            Quote quote = quoteList.get(randomizer.nextInt(quoteList.size()));
            replyLetter.message(santaLetter.getContent().replaceAll("OO", nickName) + "\n\n" + quote.getQuote() + " - "+ quote.getSource());
        }else{
            replyLetter.message(santaLetter.getContent().replaceAll("OO", nickName));
        }
        replyLetterRepository.save(replyLetter.build());
    }

    @Override
    @Transactional
    public List<LetterResponse.SendLetterResponse> getSendLetterList(int userId) {
        return sendLetterRepository.findAllByUser_UserId(userId).stream().map(SendLetter::toSendLetterResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<LetterResponse.ReplyLetterResponse> getReplyLetterList(int userId) {
        List<ReplyLetter> replyLetterList = replyLetterRepository.findAllByUser_UserId(userId);
        // 시간을 확인해서 받을 수 있는 편지인지 확인
        return replyLetterList.stream().filter(replyLetter -> replyLetter.getIsReceived().isBefore(LocalDateTime.now())).map(ReplyLetter::toReplyLetterResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LetterResponse.LetterListResponse getLetterList(int userId) {
        List<LetterResponse.SendLetterResponse> sendLetterList = getSendLetterList(userId);
        List<LetterResponse.ReplyLetterResponse> replyLetterList = getReplyLetterList(userId);

        return LetterResponse.LetterListResponse.builder()
                .sendLetterCount(sendLetterList.size())
                .replyLetterCount(replyLetterList.size())
                .send(sendLetterList)
                .reply(replyLetterList).build();
    }

    @Override
    @Transactional
    public LetterResponse.SendLetterResponse getSendLetter(int letterId) {
        SendLetter letter = sendLetterRepository.findById(letterId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_SEND_LETTER));
        return letter.toSendLetterResponse();
    }

    @Override
    @Transactional
    public LetterResponse.ReplyLetterResponse getReplyLetter(int letterId) {
        ReplyLetter letter = replyLetterRepository.findById(letterId).orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND_REPLY_LETTER));
        if(letter.getIsReceived().isAfter(LocalDateTime.now())){
            throw new CustomException(ErrorCode.NOT_FOUND_REPLY_LETTER);
        }
        letter.read();
        return letter.toReplyLetterResponse();
    }

}
