package org.example.serviceelectro.controler;

import org.example.serviceelectro.dto.RecommendationDTO;
import org.example.serviceelectro.entities.Recommendation;
import org.example.serviceelectro.mapper.RecommendationMapper;
import org.example.serviceelectro.servicees.IRecommendation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class RecommendationController {

    @Autowired
    private IRecommendation recommendationService;

    @Autowired
    private RecommendationMapper recommendationMapper;

    @PostMapping("/user/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<RecommendationDTO> saveRecommendation(
            @PathVariable Long userId,
            @RequestBody RecommendationRequest request) {
        try {
            if (request.getRating() < 0 || request.getRating() > 10) {
                return ResponseEntity.badRequest().build();
            }
            
            Recommendation recommendation = recommendationService.saveRecommendation(userId, request.getRating());
            return ResponseEntity.ok(recommendationMapper.toDTO(recommendation));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<RecommendationDTO> getUserRecommendation(@PathVariable Long userId) {
        Recommendation recommendation = recommendationService.getUserRecommendation(userId);
        if (recommendation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(recommendationMapper.toDTO(recommendation));
    }

    @GetMapping("/stats")
    public ResponseEntity<RecommendationStats> getStats() {
        Double averageRating = recommendationService.getAverageRating();
        Long totalRecommendations = recommendationService.getTotalRecommendations();
        
        RecommendationStats stats = new RecommendationStats();
        stats.setAverageRating(averageRating);
        stats.setTotalRecommendations(totalRecommendations);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getAllRecommendations() {
        try {
            List<Recommendation> recommendations = recommendationService.getAllRecommendations();
            List<RecommendationDTO> recommendationDTOs = recommendations.stream()
                    .map(recommendationMapper::toDTO)
                    .filter(dto -> dto != null) // Filtrer les DTOs null
                    .collect(Collectors.toList());
            return ResponseEntity.ok(recommendationDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @DeleteMapping("/{recommendationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRecommendation(@PathVariable Long recommendationId) {
        try {
            recommendationService.deleteRecommendation(recommendationId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    // Classes internes pour les requêtes
    public static class RecommendationRequest {
        private Integer rating;

        public Integer getRating() {
            return rating;
        }

        public void setRating(Integer rating) {
            this.rating = rating;
        }
    }

    public static class RecommendationStats {
        private Double averageRating;
        private Long totalRecommendations;

        public Double getAverageRating() {
            return averageRating;
        }

        public void setAverageRating(Double averageRating) {
            this.averageRating = averageRating;
        }

        public Long getTotalRecommendations() {
            return totalRecommendations;
        }

        public void setTotalRecommendations(Long totalRecommendations) {
            this.totalRecommendations = totalRecommendations;
        }
    }
}

