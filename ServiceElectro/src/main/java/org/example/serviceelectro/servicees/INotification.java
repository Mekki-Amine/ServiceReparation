package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Notification;

import java.util.List;

public interface INotification {
    Notification createNotification(Long userId, String message, String type, Long publicationId);
    List<Notification> getUserNotifications(Long userId);
    List<Notification> getUnreadNotifications(Long userId);
    Long getUnreadCount(Long userId);
    Notification markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}

