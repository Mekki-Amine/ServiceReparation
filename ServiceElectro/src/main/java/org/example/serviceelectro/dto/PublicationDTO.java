package org.example.serviceelectro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationDTO {
    private Long id;

    @NotBlank(message = "Le titre est requis")
    private String title;

    @NotBlank(message = "La description est requise")
    private String description;

    @NotBlank(message = "Le type est requis")
    private String type;

    @NotNull(message = "Le prix est requis")
    @Positive(message = "Le prix doit être positif")
    private Double price;

    private String status;

    private Boolean verified;
    private Boolean inCatalog;
    private Boolean inPublications;
    private Long verifiedBy;
    private LocalDateTime verifiedAt;

    private String fileUrl;
    private String fileName;
    private String fileType;
    private Long fileSize;

    private Long utilisateurId;
    private String utilisateurUsername;
    private String utilisateurEmail;
    private String utilisateurProfilePhoto;
}