package org.example.serviceelectro.repository;

import org.example.serviceelectro.entities.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    Optional<Recommendation> findByUser_Id(Long userId);
    
    @Query("SELECT AVG(r.rating) FROM Recommendation r")
    Double getAverageRating();
    
    @Query("SELECT COUNT(r) FROM Recommendation r")
    Long getTotalRecommendations();
    
    List<Recommendation> findAllByOrderByCreatedAtDesc();
}

