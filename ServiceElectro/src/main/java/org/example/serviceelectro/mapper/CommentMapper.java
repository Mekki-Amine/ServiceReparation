package org.example.serviceelectro.mapper;

import lombok.Builder;
import lombok.Data;
import org.example.serviceelectro.dto.CommentDTO;
import org.example.serviceelectro.entities.Comment;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.springframework.stereotype.Component;

@Component
@Data
public class CommentMapper {

    public CommentDTO toDTO(Comment comment) {
        if (comment == null) return null;

        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setPublicationId(comment.getPublication() != null ? comment.getPublication().getId() : null);
        dto.setUtilisateurId(comment.getUtilisateur() != null ? comment.getUtilisateur().getId() : null);

        return dto;
    }


    public Comment toEntity(CommentDTO dto, Publication publication, Utilisateur utilisateur) {
        if (dto == null) return null;

        Comment comment = new Comment();
        comment.setId(dto.getId());
        comment.setContent(dto.getContent());
        comment.setPublication(publication);
        comment.setUtilisateur(utilisateur);

        return comment;
    }
}


