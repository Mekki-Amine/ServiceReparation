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
public class CartItemDTO {
    private Long id;
    private Long publicationId;
    private String publicationTitle;
    private String publicationDescription;
    private Double publicationPrice;
    private String publicationFileUrl;
    private Integer quantity;
    private LocalDateTime createdAt;
}

