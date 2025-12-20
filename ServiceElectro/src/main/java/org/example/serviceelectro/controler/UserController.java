package org.example.serviceelectro.controler;

import jakarta.validation.Valid;
import org.example.serviceelectro.dto.UtilisateurDTO;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.mapper.UtilisateurMapper;
import org.example.serviceelectro.servicees.UserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilis")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class UserController {

    @Autowired
    private UserImpl userService;

    @Autowired
    private UtilisateurMapper utilisateurMapper;

    @PostMapping
    public ResponseEntity<UtilisateurDTO> creatCompte(@Valid @RequestBody UtilisateurDTO utilisateurDTO) {
        Utilisateur utilisateur = utilisateurMapper.toEntity(utilisateurDTO);
        Utilisateur savedUtilisateur = userService.creatCompte(utilisateur);
        UtilisateurDTO responseDTO = utilisateurMapper.toDTO(savedUtilisateur);
        responseDTO.setPassword(null); // Don't return password
        return new ResponseEntity<>(responseDTO, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        List<UtilisateurDTO> utilisateurs = userService.getAllUtilisateurs().stream()
                .map(utilisateurMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(utilisateurs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UtilisateurDTO> getUtilisateurById(@PathVariable Long id) {
        return userService.findById(id)
                .map(utilisateurMapper::toDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Endpoint pour obtenir le profil de l'utilisateur connecté
    @GetMapping("/profile/{id}")
    public ResponseEntity<UtilisateurDTO> getProfile(@PathVariable Long id) {
        return userService.findById(id)
                .map(utilisateurMapper::toDTO)
                .map(dto -> {
                    dto.setPassword(null); // Ne pas retourner le mot de passe
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Endpoint pour mettre à jour le profil
    @PutMapping("/profile/{id}")
    public ResponseEntity<UtilisateurDTO> updateProfile(
            @PathVariable Long id,
            @RequestBody UtilisateurDTO profileDTO) {
        try {
            return userService.findById(id)
                    .map(user -> {
                        if (profileDTO.getPhone() != null) {
                            user.setPhone(profileDTO.getPhone());
                        }
                        if (profileDTO.getAddress() != null) {
                            user.setAddress(profileDTO.getAddress());
                        }
                        if (profileDTO.getUsername() != null) {
                            user.setUsername(profileDTO.getUsername());
                        }
                        Utilisateur updated = userService.updateUser(user);
                        UtilisateurDTO responseDTO = utilisateurMapper.toDTO(updated);
                        responseDTO.setPassword(null);
                        return ResponseEntity.ok(responseDTO);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    // Endpoint pour uploader la photo de profil
    @PostMapping("/profile/{id}/photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Le fichier est vide");
            }
            
            // Vérifier le type de fichier (images uniquement)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Seules les images sont autorisées");
            }
            
            // Créer le répertoire de stockage
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("./uploads/profiles")
                    .toAbsolutePath()
                    .normalize();
            java.nio.file.Files.createDirectories(uploadDir);
            
            // Générer un nom de fichier unique
            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String storedFileName = "profile_" + id + "_" + System.currentTimeMillis() + "_" + originalFileName;
            
            // Sauvegarder le fichier
            java.nio.file.Path targetLocation = uploadDir.resolve(storedFileName);
            java.nio.file.Files.copy(file.getInputStream(), targetLocation,
                    java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            // Mettre à jour l'URL de la photo dans la base de données
            String photoUrl = "/api/utilis/profile/photo/" + storedFileName;
            Utilisateur updated = userService.updateProfilePhoto(id, photoUrl);
            UtilisateurDTO responseDTO = utilisateurMapper.toDTO(updated);
            responseDTO.setPassword(null);
            
            return ResponseEntity.ok(responseDTO);
        } catch (java.io.IOException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'enregistrement de la photo: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur: " + e.getMessage());
        }
    }
    
    // Endpoint pour servir les photos de profil
    @GetMapping("/profile/photo/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfilePhoto(@PathVariable String filename) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("./uploads/profiles")
                    .resolve(filename)
                    .normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(org.springframework.http.MediaType.parseMediaType("application/octet-stream"))
                        .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}