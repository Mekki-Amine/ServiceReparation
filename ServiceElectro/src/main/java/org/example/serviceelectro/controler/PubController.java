package org.example.serviceelectro.controler;

import lombok.Builder;
import org.example.serviceelectro.dto.PublicationDTO;
import org.example.serviceelectro.dto.VerifyPublicationRequest;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.mapper.PublicationMapper;
import org.example.serviceelectro.servicees.PubImpl;
import org.example.serviceelectro.servicees.UserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.example.serviceelectro.config.FileStorageProperties;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Builder
@RestController
@RequestMapping("/api/pub")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class PubController {

    @Autowired
    private PubImpl publicationService;

    @Autowired
    private PublicationMapper publicationMapper;

    @Autowired
    private UserImpl userService;

    @Autowired
    private FileStorageProperties fileStorageProperties;

    @GetMapping
    public ResponseEntity<List<PublicationDTO>> getAllPublications() {
        // Retourne les publications du catalogue (vérifiées ET inCatalog = true)
        List<PublicationDTO> publications = publicationService.getAllPublications().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        
        // Log pour déboguer les données utilisateur
        System.out.println("=== CONTROLLER - Nombre de publications: " + publications.size() + " ===");
        if (!publications.isEmpty()) {
            PublicationDTO firstPub = publications.get(0);
            System.out.println("Première publication ID: " + firstPub.getId());
            System.out.println("Utilisateur ID: " + firstPub.getUtilisateurId());
            System.out.println("Utilisateur Username: " + firstPub.getUtilisateurUsername());
            System.out.println("Utilisateur Email: " + firstPub.getUtilisateurEmail());
            System.out.println("Utilisateur Profile Photo: " + firstPub.getUtilisateurProfilePhoto());
        }
        
        return ResponseEntity.ok(publications);
    }

    @GetMapping("/publications-page")
    public ResponseEntity<List<PublicationDTO>> getPublicationsForPublicationsPage() {
        // Retourne les publications pour la page /publications (vérifiées mais inCatalog = false)
        List<PublicationDTO> publications = publicationService.getPublicationsForPublicationsPage().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationDTO> getPublicationById(@PathVariable Long id) {
        return publicationService.findById(id)
                .map(publicationMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<PublicationDTO> savePublication(@RequestBody PublicationDTO publicationDTO) {
        // Définir les valeurs par défaut AVANT la validation
        if (publicationDTO.getStatus() == null || publicationDTO.getStatus().isEmpty()) {
            publicationDTO.setStatus("DISPONIBLE");
        }
        
        // Utiliser l'ID 1 par défaut si aucun utilisateurId n'est fourni
        Long finalUtilisateurId = publicationDTO.getUtilisateurId() != null ? publicationDTO.getUtilisateurId() : 1L;
        publicationDTO.setUtilisateurId(finalUtilisateurId);
        
        // IMPORTANT: S'assurer que les nouvelles publications sont toujours non vérifiées
        if (publicationDTO.getId() == null) {
            publicationDTO.setVerified(false);
        }
        
        // Validation manuelle des champs requis
        if (publicationDTO.getTitle() == null || publicationDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre est requis");
        }
        if (publicationDTO.getDescription() == null || publicationDTO.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("La description est requise");
        }
        if (publicationDTO.getType() == null || publicationDTO.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Le type est requis");
        }
        if (publicationDTO.getPrice() == null || publicationDTO.getPrice() <= 0) {
            throw new IllegalArgumentException("Le prix est requis et doit être positif");
        }
        
        // Récupérer l'utilisateur (null si n'existe pas)
        Utilisateur utilisateur = userService.findById(finalUtilisateurId)
                .orElse(null);

        Publication publication = publicationMapper.toEntity(publicationDTO, utilisateur);
        Publication savedPublication = publicationService.savePublication(publication);
        return new ResponseEntity<>(publicationMapper.toDTO(savedPublication), HttpStatus.CREATED);
    }

    @PostMapping(value = "/create", consumes = { "application/x-www-form-urlencoded", "multipart/form-data" })
    public ResponseEntity<PublicationDTO> createPublication(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam("price") Double price,
            @RequestParam(value = "utilisateurId", required = false) Long utilisateurId,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            // Utiliser l'ID 1 par défaut si aucun utilisateurId n'est fourni
            Long finalUtilisateurId = utilisateurId != null ? utilisateurId : 1L;
            
            // Récupérer l'utilisateur
            Utilisateur utilisateur = userService.findById(finalUtilisateurId)
                    .orElse(null); // Si l'utilisateur n'existe pas, on continue sans utilisateur

            // Créer le DTO avec les champs essentiels
            PublicationDTO publicationDTO = new PublicationDTO();
            publicationDTO.setTitle(title);
            publicationDTO.setDescription(description);
            publicationDTO.setType(type);
            publicationDTO.setPrice(price);
            publicationDTO.setStatus("non traité");
            publicationDTO.setVerified(false); // Toujours non vérifiée au début
            publicationDTO.setUtilisateurId(finalUtilisateurId);
            
            // Debug: vérifier que le statut est bien défini
            System.out.println("=== CREATION PUBLICATION ===");
            System.out.println("Statut défini dans DTO: " + publicationDTO.getStatus());

            // Handle file upload if present
            if (file != null && !file.isEmpty()) {
                System.out.println("=== FILE UPLOAD ===");
                System.out.println("Original filename: " + file.getOriginalFilename());

                // Validate file size
                if (file.getSize() > fileStorageProperties.getMaxFileSize()) {
                    throw new IllegalArgumentException("Le fichier est trop volumineux");
                }

                // Validate file type
                String contentType = file.getContentType();
                boolean allowed = java.util.Arrays.asList(fileStorageProperties.getAllowedTypes())
                        .contains(contentType);

                if (!allowed) {
                    throw new IllegalArgumentException("Type de fichier non autorisé: " + contentType);
                }

                // Create upload directory
                Path uploadDir = Paths.get(fileStorageProperties.getUploadDir())
                        .toAbsolutePath()
                        .normalize();
                java.nio.file.Files.createDirectories(uploadDir);

                // Generate unique filename with timestamp
                String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
                String storedFileName = System.currentTimeMillis() + "_" + originalFileName;

                // Save file to disk
                Path targetLocation = uploadDir.resolve(storedFileName);
                java.nio.file.Files.copy(file.getInputStream(), targetLocation,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

                System.out.println("Stored filename: " + storedFileName);
                System.out.println("File saved to: " + targetLocation.toString());

                // IMPORTANT: Use storedFileName (with timestamp) for the URL
                publicationDTO.setFileName(originalFileName);  // User-friendly name
                publicationDTO.setFileType(contentType);
                publicationDTO.setFileSize(file.getSize());
                publicationDTO.setFileUrl("/api/pub/files/" + storedFileName);  // Must include timestamp!

                System.out.println("File URL: " + publicationDTO.getFileUrl());
            }

            // Convert DTO to entity and save
            Publication publication = publicationMapper.toEntity(publicationDTO, utilisateur);
            Publication savedPublication = publicationService.savePublication(publication);

            return new ResponseEntity<>(publicationMapper.toDTO(savedPublication), HttpStatus.CREATED);

        } catch (java.io.IOException ex) {
            ex.printStackTrace();
            throw new RuntimeException("Erreur lors de l'enregistrement du fichier: " + ex.getMessage(), ex);
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new RuntimeException("Erreur lors de la création de la publication: " + ex.getMessage(), ex);
        }
    }

    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            System.out.println("=== FILE DOWNLOAD REQUEST ===");
            System.out.println("Requested: " + filename);
            
            // Get upload directory
            Path uploadDir = Paths.get(fileStorageProperties.getUploadDir()).toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(filename).normalize();
            
            System.out.println("Looking for: " + filePath.toString());
            System.out.println("File exists: " + java.nio.file.Files.exists(filePath));

            // Security check
            if (!filePath.startsWith(uploadDir)) {
                System.out.println("ERROR: Security violation - path traversal attempt");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Try to load the file
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                System.out.println("ERROR: File not found or not readable");
                
                // If file not found, try to find it by matching the end of filename
                // This helps with old database entries that might have wrong filenames
                String requestedFilename = filename;
                if (!requestedFilename.contains("_")) {
                    // Filename doesn't have timestamp, try to find matching file
                    System.out.println("Trying to find file with pattern: *_" + requestedFilename);
                    
                    try (java.util.stream.Stream<Path> files = java.nio.file.Files.list(uploadDir)) {
                        java.util.Optional<Path> matchingFile = files
                            .filter(f -> f.getFileName().toString().endsWith("_" + requestedFilename))
                            .findFirst();
                        
                        if (matchingFile.isPresent()) {
                            filePath = matchingFile.get();
                            resource = new UrlResource(filePath.toUri());
                            System.out.println("Found matching file: " + filePath.getFileName());
                        } else {
                            System.out.println("No matching file found");
                            return ResponseEntity.notFound().build();
                        }
                    }
                } else {
                    return ResponseEntity.notFound().build();
                }
            }

            // Determine content type
            String contentType = "application/octet-stream";
            try {
                contentType = java.nio.file.Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
            } catch (Exception e) {
                System.out.println("Could not determine content type");
            }

            System.out.println("Serving file with content type: " + contentType);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, "GET, OPTIONS")
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                    .body(resource);

        } catch (Exception e) {
            System.out.println("ERROR: Exception while serving file");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        publicationService.deletePublication(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PublicationDTO>> getPublicationsByUser(@PathVariable Long userId) {
        List<PublicationDTO> publications = publicationService.findByUtilisateurId(userId).stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    // Endpoints pour l'administration
    @GetMapping("/admin/all")
    public ResponseEntity<List<PublicationDTO>> getAllPublicationsIncludingUnverified() {
        List<PublicationDTO> publications = publicationService.getAllPublicationsIncludingUnverified().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @GetMapping("/admin/unverified")
    public ResponseEntity<List<PublicationDTO>> getUnverifiedPublications() {
        List<PublicationDTO> publications = publicationService.findUnverifiedPublications().stream()
                .map(publicationMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(publications);
    }

    @PostMapping("/admin/verify/{id}")
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

    @PostMapping("/admin/unverify/{id}")
    public ResponseEntity<PublicationDTO> unverifyPublication(@PathVariable Long id) {
        Publication unverifiedPublication = publicationService.unverifyPublication(id);
        return ResponseEntity.ok(publicationMapper.toDTO(unverifiedPublication));
    }
}