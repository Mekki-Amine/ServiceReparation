package org.example.serviceelectro.mapper;

import org.example.serviceelectro.dto.NotificationDTO;
import org.example.serviceelectro.entities.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDTO toDTO(Notification notification) {
        if (notification == null) {
            return null;
        }

        try {
            NotificationDTO dto = new NotificationDTO();
            dto.setId(notification.getId());
            dto.setMessage(notification.getMessage());
            dto.setIsRead(notification.getIsRead());
            dto.setType(notification.getType());
            dto.setCreatedAt(notification.getCreatedAt());

            if (notification.getUser() != null) {
                dto.setUserId(notification.getUser().getId());
            }

            if (notification.getPublication() != null) {
                dto.setPublicationId(notification.getPublication().getId());
                dto.setPublicationTitle(notification.getPublication().getTitle());
            }

            return dto;
        } catch (Exception e) {
            System.err.println("Erreur lors du mapping de la notification: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Erreur lors du mapping de la notification", e);
        }
    }
}

