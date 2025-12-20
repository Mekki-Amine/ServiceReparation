package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Notification;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.repository.NotificationRepository;
import org.example.serviceelectro.repository.PublicationRepository;
import org.example.serviceelectro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationImpl implements INotification {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Override
    public Notification createNotification(Long userId, String message, String type, Long publicationId) {
        Optional<Utilisateur> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé avec l'ID: " + userId);
        }

        Notification notification = Notification.builder()
                .user(userOpt.get())
                .message(message)
                .type(type)
                .isRead(false)
                .build();

        if (publicationId != null) {
            Optional<Publication> publicationOpt = publicationRepository.findById(publicationId);
            publicationOpt.ifPresent(notification::setPublication);
        }

        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(Long userId) {
        try {
            return notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des notifications pour l'utilisateur " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Retourner une liste vide en cas d'erreur
        }
    }

    @Override
    public List<Notification> getUnreadNotifications(Long userId) {
        try {
            return notificationRepository.findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des notifications non lues pour l'utilisateur " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return List.of(); // Retourner une liste vide en cas d'erreur
        }
    }

    @Override
    public Long getUnreadCount(Long userId) {
        try {
            Long count = notificationRepository.countByUser_IdAndIsReadFalse(userId);
            return count != null ? count : 0L;
        } catch (Exception e) {
            System.err.println("Erreur lors du comptage des notifications pour l'utilisateur " + userId + ": " + e.getMessage());
            e.printStackTrace();
            return 0L; // Retourner 0 en cas d'erreur
        }
    }

    @Override
    public Notification markAsRead(Long notificationId) {
        Optional<Notification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new IllegalArgumentException("Notification non trouvée avec l'ID: " + notificationId);
        }

        Notification notification = notificationOpt.get();
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }
}

