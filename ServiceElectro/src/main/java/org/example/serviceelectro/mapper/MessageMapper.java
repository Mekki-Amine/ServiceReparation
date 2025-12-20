package org.example.serviceelectro.mapper;

import org.example.serviceelectro.dto.MessageDTO;
import org.example.serviceelectro.entities.Message;
import org.example.serviceelectro.entities.Utilisateur;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageDTO toDTO(Message message) {
        if (message == null) {
            return null;
        }

        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setIsRead(message.getIsRead());
        dto.setFileUrl(message.getFileUrl());
        dto.setFileName(message.getFileName());
        dto.setFileType(message.getFileType());
        dto.setLatitude(message.getLatitude());
        dto.setLongitude(message.getLongitude());
        dto.setLocationName(message.getLocationName());
        dto.setCreatedAt(message.getCreatedAt());
        dto.setUpdatedAt(message.getUpdatedAt());

        if (message.getSender() != null) {
            try {
                Utilisateur sender = message.getSender();
                dto.setSenderId(sender.getId());
                String realUsername = sender.getRealUsername();
                dto.setSenderUsername(realUsername != null ? realUsername : sender.getEmail());
                dto.setSenderEmail(sender.getEmail());
            } catch (Exception e) {
                System.out.println("❌ Error mapping sender: " + e.getMessage());
                e.printStackTrace();
            }
        }

        if (message.getReceiver() != null) {
            try {
                Utilisateur receiver = message.getReceiver();
                dto.setReceiverId(receiver.getId());
                String realUsername = receiver.getRealUsername();
                dto.setReceiverUsername(realUsername != null ? realUsername : receiver.getEmail());
                dto.setReceiverEmail(receiver.getEmail());
            } catch (Exception e) {
                System.out.println("❌ Error mapping receiver: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return dto;
    }

    public Message toEntity(MessageDTO dto, Utilisateur sender, Utilisateur receiver) {
        if (dto == null) {
            System.out.println("❌ DTO is null");
            return null;
        }
        if (sender == null) {
            System.out.println("❌ Sender is null");
            throw new IllegalArgumentException("Sender cannot be null");
        }
        if (receiver == null) {
            System.out.println("❌ Receiver is null");
            throw new IllegalArgumentException("Receiver cannot be null");
        }

        try {
            // Utiliser le constructeur au lieu du builder pour éviter les problèmes avec @CreatedDate
            Message message = new Message();
            message.setId(dto.getId());
            message.setContent(dto.getContent() != null && !dto.getContent().trim().isEmpty() ? dto.getContent().trim() : null);
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setIsRead(dto.getIsRead() != null ? dto.getIsRead() : false);
            message.setFileUrl(dto.getFileUrl());
            message.setFileName(dto.getFileName());
            message.setFileType(dto.getFileType());
            message.setLatitude(dto.getLatitude());
            message.setLongitude(dto.getLongitude());
            message.setLocationName(dto.getLocationName());
            // Ne pas définir createdAt et updatedAt - ils seront générés automatiquement par @CreatedDate
            
            System.out.println("✅ Message entity created: content=" + message.getContent() + 
                             ", senderId=" + sender.getId() + 
                             ", receiverId=" + receiver.getId());
            return message;
        } catch (Exception e) {
            System.out.println("❌ Error creating message entity: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

