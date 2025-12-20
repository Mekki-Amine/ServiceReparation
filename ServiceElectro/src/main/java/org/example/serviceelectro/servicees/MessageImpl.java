package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Message;
import org.example.serviceelectro.entities.Notification;
import org.example.serviceelectro.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@Transactional
public class MessageImpl implements Imessage {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired(required = false)
    private INotification notificationService;

    @Override
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    @Override
    public Message saveMessage(Message message) {
        try {
            if (message.getSender() == null) {
                throw new IllegalArgumentException("L'expéditeur est requis pour créer un message");
            }
            if (message.getReceiver() == null) {
                throw new IllegalArgumentException("Le destinataire est requis pour créer un message");
            }
            
            // Validation : Le message doit avoir au moins un contenu, un fichier ou une localisation
            boolean hasContent = message.getContent() != null && !message.getContent().trim().isEmpty();
            boolean hasFile = message.getFileUrl() != null && !message.getFileUrl().trim().isEmpty();
            boolean hasLocation = message.getLatitude() != null && message.getLongitude() != null;
            
            if (!hasContent && !hasFile && !hasLocation) {
                throw new IllegalArgumentException("Le message doit contenir du texte, un fichier ou une localisation");
            }
            
            String contentPreview = hasContent && message.getContent().length() > 50 
                ? message.getContent().substring(0, 50) + "..." 
                : (hasContent ? message.getContent() : "[Message avec fichier/localisation]");
            System.out.println("💾 Saving message: " + contentPreview);
            System.out.println("   Sender ID: " + (message.getSender() != null ? message.getSender().getId() : "null"));
            System.out.println("   Receiver ID: " + (message.getReceiver() != null ? message.getReceiver().getId() : "null"));
            
            Message saved = messageRepository.save(message);
            System.out.println("✅ Message saved with ID: " + saved.getId());
            
            // Créer une notification pour le destinataire
            if (saved.getReceiver() != null) {
                if (notificationService == null) {
                    System.out.println("⚠️ NotificationService is null - notifications will not be created");
                } else {
                    try {
                        String senderName = saved.getSender().getRealUsername() != null 
                            ? saved.getSender().getRealUsername() 
                            : saved.getSender().getEmail();
                        String messagePreview = saved.getContent() != null && saved.getContent().length() > 50 
                            ? saved.getContent().substring(0, 50) + "..." 
                            : (saved.getContent() != null ? saved.getContent() : "[Message avec fichier/localisation]");
                        String notificationMessage = String.format("Nouveau message de %s: %s", senderName, messagePreview);
                        
                        System.out.println("🔔 Creating notification for receiver ID: " + saved.getReceiver().getId());
                        Notification notification = notificationService.createNotification(
                            saved.getReceiver().getId(),
                            notificationMessage,
                            "NEW_MESSAGE",
                            null // Pas de publication associée
                        );
                        System.out.println("✅ Notification created successfully with ID: " + notification.getId());
                    } catch (Exception e) {
                        // Ne pas faire échouer l'envoi du message si la notification échoue
                        System.err.println("❌ Erreur lors de la création de la notification de message: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            } else {
                System.out.println("⚠️ Receiver is null - cannot create notification");
            }
            
            return saved;
        } catch (Exception e) {
            System.out.println("❌ Error saving message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public Optional<Message> findById(Long id) {
        return messageRepository.findById(id);
    }

    @Override
    public void deleteMessage(Long id) {
        Optional<Message> messageOpt = messageRepository.findById(id);
        if (messageOpt.isEmpty()) {
            throw new IllegalArgumentException("Message non trouvé avec l'ID: " + id);
        }
        
        // Seul l'admin peut supprimer les messages (vérifié au niveau du contrôleur avec @PreAuthorize)
        messageRepository.deleteById(id);
    }
    
    @Override
    public void deleteMessages(List<Long> messageIds) {
        for (Long messageId : messageIds) {
            deleteMessage(messageId);
        }
    }

    @Override
    public List<Message> findBySenderId(Long senderId) {
        return messageRepository.findBySenderIdOrderByCreatedAtDesc(senderId);
    }

    @Override
    public List<Message> findByReceiverId(Long receiverId) {
        return messageRepository.findByReceiverIdOrderByCreatedAtDesc(receiverId);
    }

    @Override
    public List<Message> getConversation(Long userId1, Long userId2) {
        try {
            // Récupérer les messages dans les deux sens
            List<Message> messages1 = messageRepository.findBySenderIdAndReceiverIdOrderByCreatedAtAsc(userId1, userId2);
            List<Message> messages2 = messageRepository.findBySenderIdAndReceiverIdOrderByCreatedAtAsc(userId2, userId1);
            
            // Combiner et trier par date
            return Stream.concat(messages1.stream(), messages2.stream())
                    .sorted((m1, m2) -> {
                        if (m1.getCreatedAt() == null && m2.getCreatedAt() == null) return 0;
                        if (m1.getCreatedAt() == null) return 1;
                        if (m2.getCreatedAt() == null) return -1;
                        return m1.getCreatedAt().compareTo(m2.getCreatedAt());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("❌ Error in getConversation: " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Retourner une liste vide en cas d'erreur
        }
    }

    @Override
    public void markAsRead(Long messageId) {
        Optional<Message> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            Message message = messageOpt.get();
            message.setIsRead(true);
            messageRepository.save(message);
        }
    }

    @Override
    public void markAllAsRead(Long receiverId) {
        List<Message> unreadMessages = messageRepository.findByReceiverIdAndIsReadFalse(receiverId);
        for (Message message : unreadMessages) {
            message.setIsRead(true);
        }
        messageRepository.saveAll(unreadMessages);
    }

    @Override
    public long countUnreadMessages(Long receiverId) {
        return messageRepository.countByReceiverIdAndIsReadFalse(receiverId);
    }
}

