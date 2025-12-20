package org.example.serviceelectro.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;

    private String content;

    @NotNull(message = "L'ID de l'expéditeur est requis")
    private Long senderId;
    private String senderUsername;
    private String senderEmail;

    @NotNull(message = "L'ID du destinataire est requis")
    private Long receiverId;
    private String receiverUsername;
    private String receiverEmail;

    private Boolean isRead;
    
    private String fileUrl;
    private String fileName;
    private String fileType;
    
    private Double latitude;
    private Double longitude;
    private String locationName;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


