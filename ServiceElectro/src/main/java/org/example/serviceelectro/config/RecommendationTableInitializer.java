package org.example.serviceelectro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class RecommendationTableInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            String checkTableQuery = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = 'recommendation'";

            Integer tableCount = jdbcTemplate.queryForObject(checkTableQuery, Integer.class);

            if (tableCount == null || tableCount == 0) {
                System.out.println("========================================");
                System.out.println("📋 Table 'recommendation' n'existe pas. Création en cours...");

                String createTableSQL = "CREATE TABLE IF NOT EXISTS recommendation (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "user_id BIGINT NOT NULL, " +
                        "rating INT NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 10), " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE, " +
                        "UNIQUE KEY unique_user_recommendation (user_id), " +
                        "INDEX idx_user_id (user_id), " +
                        "INDEX idx_rating (rating)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

                jdbcTemplate.execute(createTableSQL);

                System.out.println("✅ Table 'recommendation' créée avec succès!");
                System.out.println("========================================");
            } else {
                System.out.println("✅ Table 'recommendation' existe déjà.");
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation de la table 'recommendation': " + e.getMessage());
            e.printStackTrace();
            if (!e.getMessage().contains("already exists") &&
                !e.getMessage().contains("Duplicate")) {
                System.err.println("⚠️  Veuillez créer manuellement la table 'recommendation' en exécutant le script SQL.");
            }
        }
    }
}

