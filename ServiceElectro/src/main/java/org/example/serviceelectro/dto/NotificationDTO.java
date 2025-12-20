package org.example.serviceelectro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String message;
    private Boolean isRead;
    private String type;
    private Long publicationId;
    private String publicationTitle;
    private LocalDateTime createdAt;
}

