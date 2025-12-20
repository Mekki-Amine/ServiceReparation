package org.example.serviceelectro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecommendationDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userEmail;
    private Integer rating; // 0 à 10
    private LocalDateTime createdAt;
}

