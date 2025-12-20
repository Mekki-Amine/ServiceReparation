package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUser_IdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    Long countByUser_IdAndIsReadFalse(@Param("userId") Long userId);
    
    @Query("SELECT n FROM Notification n WHERE n.publication IS NOT NULL AND n.publication.id = :publicationId")
    List<Notification> findByPublication_Id(@Param("publicationId") Long publicationId);
}

