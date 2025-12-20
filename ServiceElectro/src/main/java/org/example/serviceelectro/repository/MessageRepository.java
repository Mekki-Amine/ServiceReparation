package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    List<Message> findByReceiverIdOrderByCreatedAtDesc(Long receiverId);
    List<Message> findBySenderIdAndReceiverIdOrderByCreatedAtAsc(Long senderId, Long receiverId);
    List<Message> findByReceiverIdAndIsReadFalse(Long receiverId);
    long countByReceiverIdAndIsReadFalse(Long receiverId);
}


