package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPublicationId(Long publicationId);
    List<Comment> findByUtilisateurId(Long utilisateurId);
}