package org.example.serviceelectro.controler;

import jakarta.validation.Valid;
import org.example.serviceelectro.dto.CommentDTO;
import org.example.serviceelectro.entities.Comment;
import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.mapper.CommentMapper;
import org.example.serviceelectro.servicees.CommentImpl;
import org.example.serviceelectro.servicees.PubImpl;
import org.example.serviceelectro.servicees.UserImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class CommentController {

    @Autowired
    private CommentImpl commentService;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private PubImpl publicationService;

    @Autowired
    private UserImpl userService;

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        List<CommentDTO> comments = commentService.getAllComments().stream()
                .map(commentMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/publication/{publicationId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPublication(@PathVariable Long publicationId) {
        List<CommentDTO> comments = commentService.findByPublicationId(publicationId).stream()
                .map(commentMapper::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        Publication publication = publicationService.findById(commentDTO.getPublicationId())
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        Utilisateur utilisateur = null;
        if (commentDTO.getUtilisateurId() != null) {
            utilisateur = userService.findById(commentDTO.getUtilisateurId())
                    .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouvé"));
        }

        Comment comment = commentMapper.toEntity(commentDTO, publication, utilisateur);
        Comment savedComment = commentService.saveComment(comment);
        return new ResponseEntity<>(commentMapper.toDTO(savedComment), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}


