package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Comment;
import org.example.serviceelectro.entities.Publication;

import java.util.List;
import java.util.Optional;

public interface Icomment {
    List<Comment> getAllComments();
    Comment saveComment(Comment comment);
    Optional<Comment> findById(Long id);
    void deleteComment(Long id);
    List<Comment> findByPublicationId(Long publicationId);
}
