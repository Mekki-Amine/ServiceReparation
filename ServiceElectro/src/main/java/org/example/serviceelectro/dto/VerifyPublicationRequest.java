package org.example.serviceelectro.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPublicationRequest {
    @NotNull(message = "L'ID de l'administrateur est requis")
    private Long adminId;
}