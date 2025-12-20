package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Comment;
import org.example.serviceelectro.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CommentImpl implements Icomment {

    @Autowired
    private CommentRepository commentRepository;

    @Override
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    @Override
    public Comment saveComment(Comment comment) {
        if (comment.getPublication() == null) {
            throw new IllegalArgumentException("La publication est requise pour créer un commentaire");
        }
        if (comment.getUtilisateur() == null) {
            throw new IllegalArgumentException("L'utilisateur est requis pour créer un commentaire");
        }
        return commentRepository.save(comment);
    }

    @Override
    public Optional<Comment> findById(Long id) {
        return commentRepository.findById(id);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public List<Comment> findByPublicationId(Long publicationId) {
        return commentRepository.findByPublicationId(publicationId);
    }
}


