package org.example.serviceelectro.controler;

import org.example.serviceelectro.dto.PublicationDTO;
import org.example.serviceelectro.dto.UtilisateurDTO;
import org.example.serviceelectro.dto.VerifyPublicationRequest;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.mapper.PublicationMapper;
import org.example.serviceelectro.mapper.UtilisateurMapper;
import org.example.serviceelectro.servicees.PubImpl;
import org.example.serviceelectro.servicees.UserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "https://electro-lnoc.vercel.app/")
public class AdminController {

    @Autowired
    private UserImpl userService;

    @Autowired
    private PubImpl publicationService;

    @Autowired
    private UtilisateurMapper utilisateurMapper;

    @Autowired
    private PublicationMapper publicationMapper;

    // User Management
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilisateurDTO>> getAllUsers() {
        List<UtilisateurDTO> users = userService.getAllUtilisateurs().stream()
                .map(utilisateur -> {
                    UtilisateurDTO dto = utilisateurMapper.toDTO(utilisateur);
                    // Include password hash for admin viewing
                    dto.setPassword(utilisateur.getPassword());
                    return dto;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDTO> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(utilisateur -> {
                    UtilisateurDTO dto = utilisateurMapper.toDTO(utilisateur);
                    // Include password hash for admin viewing
                    dto.setPassword(utilisateur.getPassword());
                    return dto;
                })
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/users/{id}/verify-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDTO> verifyUserEmail(@PathVariable Long id) {
        Utilisateur utilisateur = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        utilisateur.setEmailVerified(true);
        Utilisateur updatedUser = userService.updateUser(utilisateur);
        
        UtilisateurDTO dto = utilisateurMapper.toDTO(updatedUser);
        dto.setPassword(updatedUser.getPassword());
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/users/{id}/unverify-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UtilisateurDTO> unverifyUserEmail(@PathVariable Long id) {
        Utilisateur utilisateur = userService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        
        utilisateur.setEmailVerified(false);
        Utilisateur updatedUser = userService.updateUser(utilisateur);
        
        UtilisateurDTO dto = utilisateurMapper.toDTO(updatedUser);
        dto.setPassword(updatedUser.getPassword());
        return ResponseEntity.ok(dto);
    }

    // Publication Management
    @GetMapping("/publications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PublicationDTO>> getAllPublications() {
        List<PublicationDTO> publications = publicationService.getAllPublicationsIncludingUnverified().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @GetMapping("/publications/unverified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PublicationDTO>> getUnverifiedPublications() {
        List<PublicationDTO> publications = publicationService.findUnverifiedPublications().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @PostMapping("/publications/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> verifyPublication(
            @PathVariable Long id,
            @RequestBody(required = false) VerifyPublicationRequest request) {
        Long adminId = (request != null && request.getAdminId() != null)
                ? request.getAdminId()
                : null;

        if (adminId == null) {
            throw new IllegalArgumentException("L'ID de l'administrateur est requis");
        }

        Publication verifiedPublication = publicationService.verifyPublication(id, adminId);
        return ResponseEntity.ok(publicationMapper.toDTO(verifiedPublication));
    }

    @PostMapping("/publications/{id}/unverify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> unverifyPublication(@PathVariable Long id) {
        Publication unverifiedPublication = publicationService.unverifyPublication(id);
        return ResponseEntity.ok(publicationMapper.toDTO(unverifiedPublication));
    }

    @PutMapping("/publications/{id}/catalog")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> setPublicationInCatalog(
            @PathVariable Long id,
            @RequestBody SetInCatalogRequest request) {
        if (request == null || request.getInCatalog() == null) {
            throw new IllegalArgumentException("Le paramètre inCatalog est requis");
        }
        
        Publication updatedPublication = publicationService.setPublicationInCatalog(id, request.getInCatalog());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @PutMapping("/publications/{id}/publications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> setPublicationInPublications(
            @PathVariable Long id,
            @RequestBody SetInPublicationsRequest request) {
        if (request == null || request.getInPublications() == null) {
            throw new IllegalArgumentException("Le paramètre inPublications est requis");
        }
        
        Publication updatedPublication = publicationService.setPublicationInPublications(id, request.getInPublications());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @PutMapping("/publications/{id}/title")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> updatePublicationTitle(
            @PathVariable Long id,
            @RequestBody UpdateTitleRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre ne peut pas être vide");
        }
        
        Publication updatedPublication = publicationService.updatePublicationTitle(id, request.getTitle());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @PutMapping("/publications/{id}/description")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> updatePublicationDescription(
            @PathVariable Long id,
            @RequestBody UpdateDescriptionRequest request) {
        if (request == null || request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("La description ne peut pas être vide");
        }
        
        Publication updatedPublication = publicationService.updatePublicationDescription(id, request.getDescription());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @DeleteMapping("/publications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        publicationService.deletePublication(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/publications/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PublicationDTO>> getPublicationsByStatus(@PathVariable String status) {
        List<PublicationDTO> publications = publicationService.findByStatus(status).stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @PutMapping("/publications/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> updatePublicationStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request) {
        if (request == null || request.getStatus() == null || request.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Le statut est requis");
        }
        
        Publication updatedPublication = publicationService.updatePublicationStatus(id, request.getStatus());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @PutMapping("/publications/{id}/price")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> updatePublicationPrice(
            @PathVariable Long id,
            @RequestBody UpdatePriceRequest request) {
        if (request == null || request.getPrice() == null || request.getPrice() <= 0) {
            throw new IllegalArgumentException("Le prix doit être positif");
        }
        
        Publication updatedPublication = publicationService.updatePublicationPrice(id, request.getPrice());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    @PutMapping("/publications/{id}/type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PublicationDTO> updatePublicationType(
            @PathVariable Long id,
            @RequestBody UpdateTypeRequest request) {
        if (request == null || request.getType() == null || request.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Le type ne peut pas être vide");
        }
        
        Publication updatedPublication = publicationService.updatePublicationType(id, request.getType());
        return ResponseEntity.ok(publicationMapper.toDTO(updatedPublication));
    }

    // Classe interne pour la requête de mise à jour du statut
    public static class UpdateStatusRequest {
        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    // Classe interne pour la requête de mise à jour du prix
    public static class UpdatePriceRequest {
        private Double price;

        public Double getPrice() {
            return price;
        }

        public void setPrice(Double price) {
            this.price = price;
        }
    }

    // Classe interne pour la requête de mise à jour du type
    public static class UpdateTypeRequest {
        private String type;

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }
    }

    // Classe interne pour la requête de mise à jour du catalogue
    public static class SetInCatalogRequest {
        private Boolean inCatalog;

        public Boolean getInCatalog() {
            return inCatalog;
        }

        public void setInCatalog(Boolean inCatalog) {
            this.inCatalog = inCatalog;
        }
    }

    // Classe interne pour la requête de mise à jour des publications
    public static class SetInPublicationsRequest {
        private Boolean inPublications;

        public Boolean getInPublications() {
            return inPublications;
        }

        public void setInPublications(Boolean inPublications) {
            this.inPublications = inPublications;
        }
    }

    // Classe interne pour la requête de mise à jour du titre
    public static class UpdateTitleRequest {
        private String title;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }
    }

    // Classe interne pour la requête de mise à jour de la description
    public static class UpdateDescriptionRequest {
        private String description;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }
}

