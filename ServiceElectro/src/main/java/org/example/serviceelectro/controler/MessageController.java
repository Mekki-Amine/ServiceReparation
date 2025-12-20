package org.example.serviceelectro.controler;

import org.example.serviceelectro.dto.MessageDTO;
import org.example.serviceelectro.dto.UtilisateurDTO;
import org.example.serviceelectro.entities.Message;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.mapper.MessageMapper;
import org.example.serviceelectro.mapper.UtilisateurMapper;
import org.example.serviceelectro.servicees.MessageImpl;
import org.example.serviceelectro.servicees.UserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MessageController {

    @Autowired
    private MessageImpl messageService;

    @Autowired
    private UserImpl userService;

    @Autowired
    private MessageMapper messageMapper;

    @Autowired
    private UtilisateurMapper utilisateurMapper;

    // Upload de fichier pour un message
    @PostMapping("/upload-file")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Le fichier est vide");
            }

            // Vérifier le type de fichier
            String contentType = file.getContentType();
            if (contentType == null) {
                return ResponseEntity.badRequest().body("Type de fichier non reconnu");
            }

            // Créer le répertoire de stockage
            Path uploadDir = Paths.get("./uploads/messages").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            // Générer un nom de fichier unique
            String originalFileName = org.springframework.util.StringUtils.cleanPath(file.getOriginalFilename());
            String storedFileName = "message_" + System.currentTimeMillis() + "_" + originalFileName;

            // Sauvegarder le fichier
            Path targetLocation = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Retourner l'URL du fichier
            String fileUrl = "/api/messages/files/" + storedFileName;
            return ResponseEntity.ok(new java.util.HashMap<String, String>() {{
                put("fileUrl", fileUrl);
                put("fileName", originalFileName);
                put("fileType", contentType);
            }});
        } catch (Exception e) {
            System.err.println("❌ Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload du fichier: " + e.getMessage());
        }
    }

    // Servir les fichiers des messages
    @GetMapping("/files/{filename:.+}")
    public ResponseEntity<org.springframework.core.io.Resource> getMessageFile(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("./uploads/messages").resolve(filename).normalize();
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

    // Envoyer un message
    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageDTO messageDTO) {
        try {
            System.out.println("========================================");
            System.out.println("📤 RECEIVED MESSAGE REQUEST");
            System.out.println("Content: " + messageDTO.getContent());
            System.out.println("Sender ID: " + messageDTO.getSenderId());
            System.out.println("Receiver ID: " + messageDTO.getReceiverId());
            System.out.println("File URL: " + messageDTO.getFileUrl());
            System.out.println("Location: " + messageDTO.getLatitude() + ", " + messageDTO.getLongitude());
            System.out.println("========================================");
            
            // Validation : Le message doit avoir au moins un contenu, un fichier ou une localisation
            boolean hasContent = messageDTO.getContent() != null && !messageDTO.getContent().trim().isEmpty();
            boolean hasFile = messageDTO.getFileUrl() != null && !messageDTO.getFileUrl().trim().isEmpty();
            boolean hasLocation = messageDTO.getLatitude() != null && messageDTO.getLongitude() != null;
            
            if (!hasContent && !hasFile && !hasLocation) {
                System.out.println("❌ Message must have content, file, or location");
                return ResponseEntity.badRequest().body("Le message doit contenir du texte, un fichier ou une localisation");
            }
            if (messageDTO.getSenderId() == null) {
                System.out.println("❌ Sender ID is null");
                return ResponseEntity.badRequest().body("L'ID de l'expéditeur est requis");
            }
            if (messageDTO.getReceiverId() == null) {
                System.out.println("❌ Receiver ID is null");
                return ResponseEntity.badRequest().body("L'ID du destinataire est requis");
            }

            System.out.println("🔍 Looking for sender (ID: " + messageDTO.getSenderId() + ")...");
            Optional<Utilisateur> senderOpt = userService.findById(messageDTO.getSenderId());
            if (senderOpt.isEmpty()) {
                System.out.println("❌ Sender not found: " + messageDTO.getSenderId());
                return ResponseEntity.badRequest().body("Expéditeur non trouvé");
            }
            System.out.println("✅ Sender found: " + senderOpt.get().getEmail());

            System.out.println("🔍 Looking for receiver (ID: " + messageDTO.getReceiverId() + ")...");
            Optional<Utilisateur> receiverOpt = userService.findById(messageDTO.getReceiverId());
            if (receiverOpt.isEmpty()) {
                System.out.println("❌ Receiver not found: " + messageDTO.getReceiverId());
                return ResponseEntity.badRequest().body("Destinataire non trouvé");
            }
            System.out.println("✅ Receiver found: " + receiverOpt.get().getEmail());

            // Validation : L'administrateur ne peut envoyer des messages qu'aux utilisateurs
            Utilisateur sender = senderOpt.get();
            Utilisateur receiver = receiverOpt.get();
            
            if ("ADMIN".equals(sender.getRole())) {
                // Si l'expéditeur est un ADMIN, le destinataire doit être un USER
                if ("ADMIN".equals(receiver.getRole())) {
                    System.out.println("❌ Admin cannot send messages to another admin");
                    return ResponseEntity.badRequest()
                        .body("L'administrateur ne peut envoyer des messages qu'aux utilisateurs");
                }
                System.out.println("✅ Admin sending message to user - validation passed");
            }
            // Si l'expéditeur est un USER, il peut envoyer à l'ADMIN (pas de restriction)

            System.out.println("🔄 Creating message entity...");
            Message message;
            try {
                message = messageMapper.toEntity(messageDTO, senderOpt.get(), receiverOpt.get());
                System.out.println("✅ Message entity created successfully");
            } catch (Exception e) {
                System.out.println("❌ Error creating message entity: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la création de l'entité message: " + e.getMessage());
            }
            
            System.out.println("💾 Saving message to database...");
            Message savedMessage;
            try {
                savedMessage = messageService.saveMessage(message);
                System.out.println("✅ Message saved successfully with ID: " + savedMessage.getId());
            } catch (Exception e) {
                System.out.println("❌ Error saving message: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la sauvegarde du message: " + e.getMessage());
            }
            
            System.out.println("🔄 Converting to DTO...");
            MessageDTO responseDTO;
            try {
                responseDTO = messageMapper.toDTO(savedMessage);
                System.out.println("✅ DTO created successfully");
            } catch (Exception e) {
                System.out.println("❌ Error converting to DTO: " + e.getMessage());
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la conversion en DTO: " + e.getMessage());
            }
            
            System.out.println("========================================");
            System.out.println("✅ MESSAGE SENT SUCCESSFULLY");
            System.out.println("Message ID: " + responseDTO.getId());
            System.out.println("========================================");
            
            return ResponseEntity.ok(responseDTO);
        } catch (jakarta.validation.ConstraintViolationException e) {
            System.out.println("❌ Validation constraint error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur de validation: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.out.println("❌ Validation error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur de validation: " + e.getMessage());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            System.out.println("❌ Database integrity error: " + e.getMessage());
            Throwable rootCause = e.getRootCause();
            String rootCauseMsg = rootCause != null ? rootCause.getMessage() : "N/A";
            System.out.println("Root cause: " + rootCauseMsg);
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Erreur d'intégrité de la base de données: " + 
                      (rootCause != null ? rootCause.getMessage() : e.getMessage()));
        } catch (org.hibernate.exception.SQLGrammarException e) {
            System.out.println("❌ SQL Grammar error: " + e.getMessage());
            System.out.println("SQL State: " + e.getSQLState());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur SQL: La table 'message' n'existe peut-être pas. Vérifiez la base de données.");
        } catch (Exception e) {
            System.out.println("❌ Unexpected error: " + e.getMessage());
            System.out.println("Error class: " + e.getClass().getName());
            if (e.getCause() != null) {
                System.out.println("Cause: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur inattendue: " + e.getMessage() + 
                      (e.getCause() != null ? " (Cause: " + e.getCause().getMessage() + ")" : ""));
        }
    }

    // Récupérer la conversation entre deux utilisateurs
    @GetMapping("/conversation/{userId1}/{userId2}")
    public ResponseEntity<List<MessageDTO>> getConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {
        try {
            System.out.println("📥 Fetching conversation between user " + userId1 + " and " + userId2);
            List<Message> messages = messageService.getConversation(userId1, userId2);
            System.out.println("✅ Found " + messages.size() + " messages");
            
            List<MessageDTO> messageDTOs = messages.stream()
                    .map(message -> {
                        try {
                            return messageMapper.toDTO(message);
                        } catch (Exception e) {
                            System.out.println("❌ Error mapping message: " + e.getMessage());
                            e.printStackTrace();
                            return null;
                        }
                    })
                    .filter(dto -> dto != null)
                    .collect(Collectors.toList());
            
            System.out.println("✅ Mapped " + messageDTOs.size() + " message DTOs");
            return ResponseEntity.ok(messageDTOs);
        } catch (Exception e) {
            System.out.println("❌ Error in getConversation endpoint: " + e.getMessage());
            e.printStackTrace();
            // Retourner une liste vide en cas d'erreur
            return ResponseEntity.ok(List.of());
        }
    }

    // Récupérer tous les messages d'un utilisateur (envoyés et reçus)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MessageDTO>> getUserMessages(@PathVariable Long userId) {
        List<Message> sentMessages = messageService.findBySenderId(userId);
        List<Message> receivedMessages = messageService.findByReceiverId(userId);
        
        List<Message> allMessages = java.util.stream.Stream.concat(
                sentMessages.stream(),
                receivedMessages.stream()
        ).collect(Collectors.toList());

        List<MessageDTO> messageDTOs = allMessages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    // Récupérer les conversations de l'admin avec tous les utilisateurs
    @GetMapping("/admin/conversations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MessageDTO>> getAdminConversations() {
        // Récupérer tous les messages où l'admin est impliqué
        List<Message> allMessages = messageService.getAllMessages();
        List<MessageDTO> messageDTOs = allMessages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    // Récupérer la conversation entre l'admin et un utilisateur spécifique
    @GetMapping("/admin/conversation/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MessageDTO>> getAdminConversationWithUser(@PathVariable Long userId) {
        // Trouver l'admin (premier utilisateur avec rôle ADMIN)
        Optional<Utilisateur> adminOpt = userService.getAllUtilisateurs().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .findFirst();

        if (adminOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Long adminId = adminOpt.get().getId();
        List<Message> messages = messageService.getConversation(adminId, userId);
        List<MessageDTO> messageDTOs = messages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    // Supprimer un message (seul l'admin peut supprimer)
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long messageId) {
        try {
            messageService.deleteMessage(messageId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Supprimer plusieurs messages (seul l'admin peut supprimer)
    @DeleteMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessages(@RequestBody DeleteMessagesRequest request) {
        try {
            messageService.deleteMessages(request.getMessageIds());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Marquer un message comme lu
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long messageId) {
        messageService.markAsRead(messageId);
        return ResponseEntity.ok().build();
    }

    // Marquer tous les messages comme lus pour un utilisateur
    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        messageService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Compter les messages non lus
    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        long count = messageService.countUnreadMessages(userId);
        return ResponseEntity.ok(count);
    }

    // Obtenir l'ID de l'admin (accessible à tous les utilisateurs authentifiés)
    @GetMapping("/admin-id")
    public ResponseEntity<Long> getAdminId() {
        try {
            System.out.println("🔍 Searching for admin user...");
            Optional<Utilisateur> adminOpt = userService.getAllUtilisateurs().stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .findFirst();

            if (adminOpt.isEmpty()) {
                System.out.println("❌ No admin user found");
                return ResponseEntity.notFound().build();
            }

            Long adminId = adminOpt.get().getId();
            System.out.println("✅ Admin ID found: " + adminId);
            return ResponseEntity.ok(adminId);
        } catch (Exception e) {
            System.out.println("❌ Error finding admin: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Récupérer tous les utilisateurs (non-admin) pour que l'admin puisse leur envoyer des messages
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UtilisateurDTO>> getUsersWithConversations() {
        // Retourner tous les utilisateurs sauf les administrateurs
        List<UtilisateurDTO> users = userService.getAllUtilisateurs().stream()
                .filter(u -> !"ADMIN".equals(u.getRole())) // Exclure les administrateurs
                .map(utilisateurMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    // Classe interne pour la requête de suppression multiple
    public static class DeleteMessagesRequest {
        private List<Long> messageIds;

        public List<Long> getMessageIds() {
            return messageIds;
        }

        public void setMessageIds(List<Long> messageIds) {
            this.messageIds = messageIds;
        }
    }
}
