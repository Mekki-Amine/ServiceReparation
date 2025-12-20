package org.example.serviceelectro.controler;

import org.example.serviceelectro.dto.NotificationDTO;
import org.example.serviceelectro.entities.Notification;
import org.example.serviceelectro.mapper.NotificationMapper;
import org.example.serviceelectro.servicees.INotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NotificationController {

    @Autowired
    private INotification notificationService;

    @Autowired
    private NotificationMapper notificationMapper;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getUserNotifications(userId);
            if (notifications == null) {
                return ResponseEntity.ok(List.of());
            }
            List<NotificationDTO> dtos = notifications.stream()
                    .map(notificationMapper::toDTO)
                    .filter(dto -> dto != null) // Filtrer les DTOs null
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des notifications: " + e.getMessage());
            e.printStackTrace();
            // Retourner une liste vide au lieu d'une erreur 500
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/user/{userId}/unread")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(@PathVariable Long userId) {
        try {
            List<Notification> notifications = notificationService.getUnreadNotifications(userId);
            if (notifications == null) {
                return ResponseEntity.ok(List.of());
            }
            List<NotificationDTO> dtos = notifications.stream()
                    .map(notificationMapper::toDTO)
                    .filter(dto -> dto != null) // Filtrer les DTOs null
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération des notifications non lues: " + e.getMessage());
            e.printStackTrace();
            // Retourner une liste vide au lieu d'une erreur 500
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        try {
            Long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(count != null ? count : 0L);
        } catch (Exception e) {
            System.err.println("Erreur lors de la récupération du nombre de notifications: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(0L); // Retourner 0 en cas d'erreur plutôt qu'une erreur 500
        }
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.markAsRead(id);
        return ResponseEntity.ok(notificationMapper.toDTO(notification));
    }

    @PutMapping("/user/{userId}/read-all")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}

