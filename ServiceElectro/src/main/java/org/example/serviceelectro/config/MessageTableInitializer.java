package org.example.serviceelectro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class MessageTableInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Vérifier si la table existe déjà
            String checkTableQuery = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = 'message'";
            
            Integer tableCount = jdbcTemplate.queryForObject(checkTableQuery, Integer.class);
            
            if (tableCount == null || tableCount == 0) {
                System.out.println("========================================");
                System.out.println("📋 Table 'message' n'existe pas. Création en cours...");
                
                // Créer la table avec tous les nouveaux champs
                String createTableSQL = "CREATE TABLE IF NOT EXISTS message (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "content VARCHAR(2000), " +
                        "sender_id BIGINT NOT NULL, " +
                        "receiver_id BIGINT NOT NULL, " +
                        "is_read BOOLEAN NOT NULL DEFAULT FALSE, " +
                        "file_url VARCHAR(500), " +
                        "file_name VARCHAR(255), " +
                        "file_type VARCHAR(100), " +
                        "latitude DOUBLE, " +
                        "longitude DOUBLE, " +
                        "location_name VARCHAR(500), " +
                        "created_at TIMESTAMP NULL DEFAULT NULL, " +
                        "updated_at TIMESTAMP NULL DEFAULT NULL, " +
                        "FOREIGN KEY (sender_id) REFERENCES utilisateur(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (receiver_id) REFERENCES utilisateur(id) ON DELETE CASCADE, " +
                        "INDEX idx_sender (sender_id), " +
                        "INDEX idx_receiver (receiver_id), " +
                        "INDEX idx_created_at (created_at)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
                
                jdbcTemplate.execute(createTableSQL);
                
                System.out.println("✅ Table 'message' créée avec succès!");
                System.out.println("========================================");
            } else {
                System.out.println("✅ Table 'message' existe déjà.");
                // Ajouter les nouvelles colonnes si elles n'existent pas
                try {
                    // Vérifier et ajouter file_url
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN file_url VARCHAR(500)");
                        System.out.println("✅ Colonne 'file_url' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'file_url' existe déjà");
                        }
                    }
                    
                    // Vérifier et ajouter file_name
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN file_name VARCHAR(255)");
                        System.out.println("✅ Colonne 'file_name' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'file_name' existe déjà");
                        }
                    }
                    
                    // Vérifier et ajouter file_type
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN file_type VARCHAR(100)");
                        System.out.println("✅ Colonne 'file_type' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'file_type' existe déjà");
                        }
                    }
                    
                    // Vérifier et ajouter latitude
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN latitude DOUBLE");
                        System.out.println("✅ Colonne 'latitude' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'latitude' existe déjà");
                        }
                    }
                    
                    // Vérifier et ajouter longitude
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN longitude DOUBLE");
                        System.out.println("✅ Colonne 'longitude' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'longitude' existe déjà");
                        }
                    }
                    
                    // Vérifier et ajouter location_name
                    try {
                        jdbcTemplate.execute("ALTER TABLE message ADD COLUMN location_name VARCHAR(500)");
                        System.out.println("✅ Colonne 'location_name' ajoutée");
                    } catch (Exception e) {
                        if (e.getMessage().contains("Duplicate column")) {
                            System.out.println("ℹ️ Colonne 'location_name' existe déjà");
                        }
                    }
                    
                    // Modifier content pour permettre NULL
                    try {
                        jdbcTemplate.execute("ALTER TABLE message MODIFY COLUMN content VARCHAR(2000)");
                        System.out.println("✅ Colonne 'content' modifiée pour permettre NULL");
                    } catch (Exception e) {
                        System.out.println("ℹ️ Impossible de modifier 'content': " + e.getMessage());
                    }
                } catch (Exception e) {
                    System.err.println("⚠️ Erreur lors de l'ajout des colonnes: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation de la table 'message': " + e.getMessage());
            e.printStackTrace();
            // Ne pas bloquer le démarrage de l'application si la table existe déjà
            // ou si c'est une autre erreur non critique
            if (!e.getMessage().contains("already exists") && 
                !e.getMessage().contains("Duplicate")) {
                System.err.println("⚠️  Veuillez créer manuellement la table 'message' en exécutant le script SQL.");
            }
        }
    }
}

