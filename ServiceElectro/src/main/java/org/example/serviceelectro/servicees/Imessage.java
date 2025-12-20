package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Message;

import java.util.List;
import java.util.Optional;

public interface Imessage {
    List<Message> getAllMessages();
    Message saveMessage(Message message);
    Optional<Message> findById(Long id);
    void deleteMessage(Long id);
    void deleteMessages(List<Long> messageIds);
    List<Message> findBySenderId(Long senderId);
    List<Message> findByReceiverId(Long receiverId);
    List<Message> getConversation(Long userId1, Long userId2);
    void markAsRead(Long messageId);
    void markAllAsRead(Long receiverId);
    long countUnreadMessages(Long receiverId);
}


