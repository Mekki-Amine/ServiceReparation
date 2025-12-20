package org.example.serviceelectro.mapper;

import org.example.serviceelectro.dto.PublicationDTO;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.springframework.stereotype.Component;

@Component
public class PublicationMapper {

    public PublicationDTO toDTO(Publication publication) {
        if (publication == null) {
            return null;
        }
        PublicationDTO dto = new PublicationDTO();
        dto.setId(publication.getId());
        dto.setTitle(publication.getTitle());
        dto.setDescription(publication.getDescription());
        dto.setType(publication.getType());
        dto.setPrice(publication.getPrice());
        dto.setStatus(publication.getStatus());
        dto.setVerified(publication.getVerified());
        dto.setInCatalog(publication.getInCatalog() != null ? publication.getInCatalog() : false);
        dto.setInPublications(publication.getInPublications() != null ? publication.getInPublications() : false);
        dto.setVerifiedBy(publication.getVerifiedBy());
        dto.setVerifiedAt(publication.getVerifiedAt());
        dto.setFileUrl(publication.getFileUrl());
        dto.setFileName(publication.getFileName());
        dto.setFileType(publication.getFileType());
        dto.setFileSize(publication.getFileSize());
        if (publication.getUtilisateur() != null) {
            Utilisateur utilisateur = publication.getUtilisateur();
            dto.setUtilisateurId(utilisateur.getId());
            String realUsername = utilisateur.getRealUsername();
            // Utiliser le username s'il existe, sinon utiliser l'email comme fallback
            dto.setUtilisateurUsername(realUsername != null && !realUsername.trim().isEmpty() 
                ? realUsername 
                : utilisateur.getEmail());
            dto.setUtilisateurEmail(utilisateur.getEmail());
            dto.setUtilisateurProfilePhoto(utilisateur.getProfilePhoto());
            
            // Log pour déboguer
            System.out.println("=== MAPPER - Publication ID: " + publication.getId() + " ===");
            System.out.println("Utilisateur ID: " + utilisateur.getId());
            System.out.println("Real Username: " + realUsername);
            System.out.println("Email: " + utilisateur.getEmail());
            System.out.println("Profile Photo: " + utilisateur.getProfilePhoto());
            System.out.println("DTO Username: " + dto.getUtilisateurUsername());
        } else {
            dto.setUtilisateurId(null);
            dto.setUtilisateurUsername(null);
            dto.setUtilisateurEmail(null);
            dto.setUtilisateurProfilePhoto(null);
            System.out.println("=== MAPPER - Publication ID: " + publication.getId() + " - PAS D'UTILISATEUR ===");
        }
        return dto;
    }

    public Publication toEntity(PublicationDTO dto, Utilisateur utilisateur) {
        if (dto == null) {
            return null;
        }
        Publication publication = new Publication();
        publication.setId(dto.getId());
        publication.setTitle(dto.getTitle());
        publication.setDescription(dto.getDescription());
        publication.setType(dto.getType());
        publication.setPrice(dto.getPrice());
        String status = dto.getStatus() != null ? dto.getStatus() : "non traité";
        publication.setStatus(status);
        System.out.println("=== MAPPER ===");
        System.out.println("Statut DTO: " + dto.getStatus());
        System.out.println("Statut final dans entité: " + status);
        // Toujours définir verified à false pour les nouvelles publications
        // Seul un admin peut vérifier une publication
        publication.setVerified(false);
        publication.setInCatalog(dto.getInCatalog() != null ? dto.getInCatalog() : false);
        publication.setInPublications(dto.getInPublications() != null ? dto.getInPublications() : false);
        publication.setVerifiedBy(dto.getVerifiedBy());
        publication.setVerifiedAt(dto.getVerifiedAt());
        publication.setFileUrl(dto.getFileUrl());
        publication.setFileName(dto.getFileName());
        publication.setFileType(dto.getFileType());
        publication.setFileSize(dto.getFileSize());
        publication.setUtilisateur(utilisateur);
        return publication;
    }
}