package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.repository.PublicationRepository;
import org.example.serviceelectro.repository.CommentRepository;
import org.example.serviceelectro.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PubImpl implements Ipub {
    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired(required = false)
    private CommentRepository commentRepository;

    @Autowired(required = false)
    private NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    private AutoVerificationService autoVerificationService;

    @Autowired(required = false)
    private INotification notificationService;


    @Override
    public List<Publication> getAllPublications() {
        // Retourne uniquement les publications vérifiées ET dans le catalogue pour /shop
        // Utiliser JOIN FETCH pour charger l'utilisateur
        try {
            List<Publication> publications = publicationRepository.findByVerifiedTrueAndInCatalogTrueWithUser();
            System.out.println("=== SERVICE - Publications chargées avec utilisateur ===");
            if (!publications.isEmpty()) {
                Publication first = publications.get(0);
                System.out.println("Première publication ID: " + first.getId());
                System.out.println("Utilisateur: " + (first.getUtilisateur() != null ? first.getUtilisateur().getId() : "NULL"));
                if (first.getUtilisateur() != null) {
                    System.out.println("Username: " + first.getUtilisateur().getRealUsername());
                    System.out.println("Email: " + first.getUtilisateur().getEmail());
                    System.out.println("Profile Photo: " + first.getUtilisateur().getProfilePhoto());
                }
            }
            return publications;
        } catch (Exception e) {
            System.err.println("Erreur lors du chargement avec JOIN FETCH: " + e.getMessage());
            e.printStackTrace();
            // Fallback vers la méthode sans JOIN FETCH
            return publicationRepository.findByVerifiedTrueAndInCatalogTrue();
        }
    }

    public List<Publication> getPublicationsForPublicationsPage() {
        // Retourne les publications vérifiées ET dans les publications pour /publications
        return publicationRepository.findByVerifiedTrueAndInPublicationsTrue();
    }

    public List<Publication> getAllPublicationsIncludingUnverified() {
        // Retourne toutes les publications (pour les admins)
        return publicationRepository.findAll();
    }

    @Override
    public Publication savePublication(Publication publication) {
        // L'utilisateur est maintenant optionnel - les publications peuvent être créées sans utilisateur
        // IMPORTANT: Toutes les nouvelles publications sont non vérifiées par défaut
        // Si c'est une nouvelle publication (pas d'ID), forcer verified à false
        if (publication.getId() == null) {
            publication.setVerified(false);
        } else if (publication.getVerified() == null) {
            // Pour les publications existantes, si verified est null, le mettre à false
            publication.setVerified(false);
        }
        
        // Debug: vérifier le statut avant sauvegarde
        System.out.println("=== SERVICE - Avant sauvegarde ===");
        System.out.println("Statut de la publication: " + publication.getStatus());
        
        Publication savedPublication = publicationRepository.save(publication);
        
        // Debug: vérifier le statut après sauvegarde
        System.out.println("=== SERVICE - Après sauvegarde ===");
        System.out.println("Statut sauvegardé: " + savedPublication.getStatus());
        System.out.println("Vérifiée: " + savedPublication.getVerified());
        
        // IMPORTANT: Les publications sont créées non vérifiées par défaut
        // La vérification doit être faite manuellement par un administrateur
        // Désactivation de la vérification automatique lors de la création
        
        return savedPublication;
    }

    @Override
    public Publication getPublicationId(int id) {
        return null;
    }

    public Optional<Publication> findById(Long id) {
        return publicationRepository.findById(id);
    }

    public void deletePublication(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("L'ID de la publication ne peut pas être null");
        }
        
        Optional<Publication> publicationOpt = publicationRepository.findById(id);
        if (publicationOpt.isEmpty()) {
            throw new IllegalArgumentException("Publication non trouvée avec l'ID: " + id);
        }
        
        Publication publication = publicationOpt.get();
        
        // Supprimer manuellement les commentaires et notifications via SQL direct pour éviter les problèmes de contraintes FK
        if (jdbcTemplate != null) {
            try {
                // Supprimer les commentaires via SQL direct
                int commentsDeleted = jdbcTemplate.update("DELETE FROM comment WHERE publication_id = ?", id);
                if (commentsDeleted > 0) {
                    System.out.println("✅ " + commentsDeleted + " commentaire(s) supprimé(s) via SQL");
                }
                
                // Supprimer les notifications via SQL direct
                int notificationsDeleted = jdbcTemplate.update("DELETE FROM notification WHERE publication_id = ?", id);
                if (notificationsDeleted > 0) {
                    System.out.println("✅ " + notificationsDeleted + " notification(s) supprimée(s) via SQL");
                }
            } catch (Exception e) {
                System.err.println("❌ Erreur lors de la suppression via SQL: " + e.getMessage());
                e.printStackTrace();
                // Essayer quand même de continuer avec les repositories JPA
                System.err.println("⚠️ Tentative de suppression via repositories JPA...");
                
                // Fallback: Supprimer via repositories JPA
                if (commentRepository != null) {
                    try {
                        List<org.example.serviceelectro.entities.Comment> comments = commentRepository.findByPublicationId(id);
                        if (!comments.isEmpty()) {
                            commentRepository.deleteAll(comments);
                        }
                    } catch (Exception e2) {
                        System.err.println("⚠️ Erreur lors de la suppression des commentaires via JPA: " + e2.getMessage());
                    }
                }
                
                if (notificationRepository != null) {
                    try {
                        List<org.example.serviceelectro.entities.Notification> notifications = notificationRepository.findByPublication_Id(id);
                        if (!notifications.isEmpty()) {
                            notificationRepository.deleteAll(notifications);
                        }
                    } catch (Exception e2) {
                        System.err.println("⚠️ Erreur lors de la suppression des notifications via JPA: " + e2.getMessage());
                    }
                }
            }
        } else {
            // Si JdbcTemplate n'est pas disponible, utiliser les repositories JPA
            if (commentRepository != null) {
                try {
                    List<org.example.serviceelectro.entities.Comment> comments = commentRepository.findByPublicationId(id);
                    if (!comments.isEmpty()) {
                        commentRepository.deleteAll(comments);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur lors de la suppression des commentaires: " + e.getMessage());
                }
            }
            
            if (notificationRepository != null) {
                try {
                    List<org.example.serviceelectro.entities.Notification> notifications = notificationRepository.findByPublication_Id(id);
                    if (!notifications.isEmpty()) {
                        notificationRepository.deleteAll(notifications);
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur lors de la suppression des notifications: " + e.getMessage());
                }
            }
        }
        
        // Supprimer la publication (utiliser delete() au lieu de deleteById() pour mieux gérer les relations)
        // Laisser les exceptions se propager pour que le GlobalExceptionHandler les gère
        publicationRepository.delete(publication);
    }

    public List<Publication> findByUtilisateurId(Long utilisateurId) {
        return publicationRepository.findByUtilisateurId(utilisateurId);
    }

    public List<Publication> findUnverifiedPublications() {
        return publicationRepository.findByVerifiedFalse();
    }

    public Publication verifyPublication(Long publicationId, Long adminId) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (publication.getVerified()) {
            throw new IllegalArgumentException("Cette publication est déjà vérifiée");
        }

        publication.setVerified(true);
        publication.setVerifiedBy(adminId);
        publication.setVerifiedAt(LocalDateTime.now());

        Publication savedPublication = publicationRepository.save(publication);

        // Créer une notification pour l'utilisateur propriétaire de la publication
        if (notificationService != null && savedPublication.getUtilisateur() != null) {
            try {
                String message = String.format("Votre publication \"%s\" a été approuvée et est maintenant visible sur le site.", 
                    savedPublication.getTitle());
                notificationService.createNotification(
                    savedPublication.getUtilisateur().getId(),
                    message,
                    "PUBLICATION_APPROVED",
                    savedPublication.getId()
                );
            } catch (Exception e) {
                // Ne pas faire échouer la vérification si la notification échoue
                System.err.println("Erreur lors de la création de la notification: " + e.getMessage());
            }
        }

        return savedPublication;
    }

    public Publication setPublicationInCatalog(Long publicationId, Boolean inCatalog) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        // Si la publication n'est pas vérifiée, la vérifier d'abord
        if (!publication.getVerified()) {
            publication.setVerified(true);
            publication.setVerifiedBy(null); // Vérification automatique
            publication.setVerifiedAt(LocalDateTime.now());
        }

        boolean wasInCatalog = publication.getInCatalog() != null && publication.getInCatalog();
        publication.setInCatalog(inCatalog);
        Publication savedPublication = publicationRepository.save(publication);

        // Créer une notification si la publication est mise au catalogue (changement d'état de false à true)
        if (notificationService != null && savedPublication.getUtilisateur() != null && inCatalog && !wasInCatalog) {
            try {
                String message = String.format("Votre publication \"%s\" a été ajoutée au catalogue et est maintenant visible sur la page du catalogue.", 
                    savedPublication.getTitle());
                notificationService.createNotification(
                    savedPublication.getUtilisateur().getId(),
                    message,
                    "PUBLICATION_IN_CATALOG",
                    savedPublication.getId()
                );
            } catch (Exception e) {
                System.err.println("Erreur lors de la création de la notification: " + e.getMessage());
            }
        }

        return savedPublication;
    }

    public Publication setPublicationInPublications(Long publicationId, Boolean inPublications) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        // Si la publication n'est pas vérifiée, la vérifier d'abord
        if (!publication.getVerified()) {
            publication.setVerified(true);
            publication.setVerifiedBy(null); // Vérification automatique
            publication.setVerifiedAt(LocalDateTime.now());
        }

        boolean wasInPublications = publication.getInPublications() != null && publication.getInPublications();
        publication.setInPublications(inPublications);
        Publication savedPublication = publicationRepository.save(publication);

        // Créer une notification si la publication est mise dans les publications (changement d'état de false à true)
        if (notificationService != null && savedPublication.getUtilisateur() != null && inPublications && !wasInPublications) {
            try {
                String message = String.format("Votre publication \"%s\" a été ajoutée à la page des publications et est maintenant visible sur la page /publications.", 
                    savedPublication.getTitle());
                notificationService.createNotification(
                    savedPublication.getUtilisateur().getId(),
                    message,
                    "PUBLICATION_IN_PUBLICATIONS",
                    savedPublication.getId()
                );
            } catch (Exception e) {
                System.err.println("Erreur lors de la création de la notification: " + e.getMessage());
            }
        }

        return savedPublication;
    }

    public Publication unverifyPublication(Long publicationId) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        publication.setVerified(false);
        publication.setVerifiedBy(null);
        publication.setVerifiedAt(null);

        return publicationRepository.save(publication);
    }

    public Publication updatePublicationStatus(Long publicationId, String status) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Le statut ne peut pas être vide");
        }

        publication.setStatus(status.trim());
        return publicationRepository.save(publication);
    }

    public Publication updatePublicationPrice(Long publicationId, Double price) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (price == null || price <= 0) {
            throw new IllegalArgumentException("Le prix doit être positif");
        }

        publication.setPrice(price);
        return publicationRepository.save(publication);
    }

    public Publication updatePublicationType(Long publicationId, String type) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (type == null || type.trim().isEmpty()) {
            throw new IllegalArgumentException("Le type ne peut pas être vide");
        }

        publication.setType(type.trim());
        return publicationRepository.save(publication);
    }

    public Publication updatePublicationTitle(Long publicationId, String title) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre ne peut pas être vide");
        }

        publication.setTitle(title.trim());
        return publicationRepository.save(publication);
    }

    public Publication updatePublicationDescription(Long publicationId, String description) {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new IllegalArgumentException("Publication non trouvée"));

        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("La description ne peut pas être vide");
        }

        publication.setDescription(description.trim());
        return publicationRepository.save(publication);
    }

    public List<Publication> findByStatus(String status) {
        return publicationRepository.findByStatus(status);
    }
}
