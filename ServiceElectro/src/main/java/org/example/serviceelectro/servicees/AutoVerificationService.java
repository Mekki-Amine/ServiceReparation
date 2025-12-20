package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Publication;
import org.example.serviceelectro.repository.PublicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service pour la vérification automatique des publications
 * Peut être configuré pour vérifier automatiquement certaines publications
 * selon des critères définis (ex: utilisateurs vérifiés, certains types, etc.)
 */
@Service
public class AutoVerificationService {

    @Autowired
    private PublicationRepository publicationRepository;

    /**
     * Vérifie automatiquement une publication selon des critères prédéfinis
     * Exemple: vérification automatique pour certains types de publications
     * ou pour des utilisateurs avec un certain statut
     */
    @Async
    public void autoVerifyPublication(Publication publication) {
        // Critères pour la vérification automatique
        // Vous pouvez personnaliser ces critères selon vos besoins
        
        boolean shouldAutoVerify = false;
        
        // Exemple 1: Vérification automatique pour certains types
        if ("REPARATION_SIMPLE".equals(publication.getType()) || 
            "CONSULTATION".equals(publication.getType())) {
            shouldAutoVerify = true;
        }
        
        // Exemple 2: Vérification automatique si le prix est inférieur à un certain montant
        if (publication.getPrice() != null && publication.getPrice() < 100.0) {
            shouldAutoVerify = true;
        }
        
        // Exemple 3: Vérification automatique pour les utilisateurs avec un certain rôle
        if (publication.getUtilisateur() != null && 
            "PREMIUM_USER".equals(publication.getUtilisateur().getRole())) {
            shouldAutoVerify = true;
        }
        
        if (shouldAutoVerify) {
            publication.setVerified(true);
            publication.setVerifiedBy(null); // null = vérification automatique
            publication.setVerifiedAt(LocalDateTime.now());
            publicationRepository.save(publication);
        }
    }

    /**
     * Tâche planifiée pour vérifier automatiquement les publications en attente
     * S'exécute toutes les heures (peut être configuré)
     */
    @Scheduled(fixedRate = 3600000) // Toutes les heures
    public void processPendingPublications() {
        List<Publication> unverifiedPublications = publicationRepository.findByVerifiedFalse();
        
        for (Publication publication : unverifiedPublications) {
            // Vérifier si la publication est en attente depuis plus de 24h
            if (publication.getCreatedAt() != null && 
                publication.getCreatedAt().isBefore(LocalDateTime.now().minusHours(24))) {
                // Après 24h, vérification automatique (ou vous pouvez appliquer d'autres règles)
                autoVerifyPublication(publication);
            }
        }
    }
}

