package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Publication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {

    // WRONG - Remove this:
    // Publication getPublicationId(int id);

    // CORRECT - Use one of these instead:
    // Option 1: Already provided by JpaRepository
    // Optional<Publication> findById(Long id);

    // Option 2: If you need a custom method with int parameter:
    Publication findByIdEquals(Long id);

    // Other methods
    List<Publication> findByUtilisateurId(Long utilisateurId);
    List<Publication> findByVerifiedTrue();
    List<Publication> findByVerifiedFalse();
    List<Publication> findByStatus(String status);
    
    // Requête avec LEFT JOIN FETCH pour charger l'utilisateur (inclut même les publications sans utilisateur)
    @Query("SELECT DISTINCT p FROM Publication p LEFT JOIN FETCH p.utilisateur WHERE p.verified = true AND p.inCatalog = true")
    List<Publication> findByVerifiedTrueAndInCatalogTrueWithUser(); // Pour le catalogue (/shop)
    
    @Query("SELECT DISTINCT p FROM Publication p LEFT JOIN FETCH p.utilisateur WHERE p.verified = true AND p.inPublications = true")
    List<Publication> findByVerifiedTrueAndInPublicationsTrueWithUser(); // Pour les publications (/publications)
    
    // Méthodes de fallback sans JOIN FETCH (si utilisateur est null)
    List<Publication> findByVerifiedTrueAndInCatalogTrue(); // Pour le catalogue (/shop)
    List<Publication> findByVerifiedTrueAndInPublicationsTrue(); // Pour les publications (/publications)
}