package org.example.serviceelectro.servicees;

import org.example.serviceelectro.entities.Recommendation;
import org.example.serviceelectro.entities.Utilisateur;
import org.example.serviceelectro.repository.RecommendationRepository;
import org.example.serviceelectro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RecommendationImpl implements IRecommendation {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Recommendation saveRecommendation(Long userId, Integer rating) {
        if (rating < 0 || rating > 10) {
            throw new IllegalArgumentException("La note doit être entre 0 et 10");
        }

        Optional<Utilisateur> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Utilisateur non trouvé");
        }

        Utilisateur user = userOpt.get();
        // Empêcher les administrateurs de créer des recommandations
        if ("ADMIN".equals(user.getRole())) {
            throw new IllegalArgumentException("Les administrateurs ne peuvent pas soumettre de recommandations");
        }

        // Vérifier si l'utilisateur a déjà une recommandation
        Optional<Recommendation> existingOpt = recommendationRepository.findByUser_Id(userId);
        
        if (existingOpt.isPresent()) {
            // Mettre à jour la recommandation existante
            Recommendation existing = existingOpt.get();
            existing.setRating(rating);
            return recommendationRepository.save(existing);
        } else {
            // Créer une nouvelle recommandation
            Recommendation recommendation = Recommendation.builder()
                    .user(user)
                    .rating(rating)
                    .build();
            return recommendationRepository.save(recommendation);
        }
    }

    @Override
    public Recommendation getUserRecommendation(Long userId) {
        return recommendationRepository.findByUser_Id(userId).orElse(null);
    }

    @Override
    public Double getAverageRating() {
        Double avg = recommendationRepository.getAverageRating();
        return avg != null ? avg : 0.0;
    }

    @Override
    public Long getTotalRecommendations() {
        return recommendationRepository.getTotalRecommendations();
    }

    @Override
    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public void deleteRecommendation(Long recommendationId) {
        if (!recommendationRepository.existsById(recommendationId)) {
            throw new IllegalArgumentException("Recommandation non trouvée");
        }
        recommendationRepository.deleteById(recommendationId);
    }
}

