package org.example.serviceelectro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationTableInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Vérifier si la table existe déjà
            String checkTableQuery = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = 'notification'";
            
            Integer tableCount = jdbcTemplate.queryForObject(checkTableQuery, Integer.class);
            
            if (tableCount == null || tableCount == 0) {
                System.out.println("========================================");
                System.out.println("📋 Table 'notification' n'existe pas. Création en cours...");
                
                // Créer la table
                String createTableSQL = "CREATE TABLE IF NOT EXISTS notification (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "user_id BIGINT NOT NULL, " +
                        "message VARCHAR(500) NOT NULL, " +
                        "is_read BOOLEAN NOT NULL DEFAULT FALSE, " +
                        "notification_type VARCHAR(50), " +
                        "publication_id BIGINT, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE SET NULL, " +
                        "INDEX idx_user_id (user_id), " +
                        "INDEX idx_is_read (is_read), " +
                        "INDEX idx_created_at (created_at)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                
                jdbcTemplate.execute(createTableSQL);
                
                System.out.println("✅ Table 'notification' créée avec succès!");
                System.out.println("========================================");
            } else {
                System.out.println("✅ Table 'notification' existe déjà.");
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation de la table 'notification': " + e.getMessage());
            e.printStackTrace();
            // Ne pas bloquer le démarrage de l'application si la table existe déjà
            // ou si c'est une autre erreur non critique
            if (!e.getMessage().contains("already exists") && 
                !e.getMessage().contains("Duplicate")) {
                System.err.println("⚠️  Veuillez créer manuellement la table 'notification' en exécutant le script SQL.");
            }
        }
    }
}

