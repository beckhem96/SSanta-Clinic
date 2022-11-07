package com.ssafy.ssantaClinic.api.response;

import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;
import java.util.List;

public class StoreResponse {

    @Data
    @Builder
    public static class StoreItemListResponse {
        private int itemId;
        private String itemName;
        private int price;
    }
    @Data
    @Builder
    public static class BuyItemResponse {
        private int money;
    }

    @Data
    @Builder
    public static class UserItemListResponse {
        private List<Integer> itemList;
    }
}
