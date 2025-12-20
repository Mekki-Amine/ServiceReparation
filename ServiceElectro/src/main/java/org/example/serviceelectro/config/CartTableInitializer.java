package org.example.serviceelectro.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class CartTableInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Vérifier et créer la table cart
            String checkCartTableQuery = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = 'cart'";

            Integer cartTableCount = jdbcTemplate.queryForObject(checkCartTableQuery, Integer.class);

            if (cartTableCount == null || cartTableCount == 0) {
                System.out.println("========================================");
                System.out.println("📋 Table 'cart' n'existe pas. Création en cours...");

                String createCartTableSQL = "CREATE TABLE IF NOT EXISTS cart (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "user_id BIGINT NOT NULL, " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE, " +
                        "UNIQUE KEY unique_user_cart (user_id), " +
                        "INDEX idx_user_id (user_id)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

                jdbcTemplate.execute(createCartTableSQL);

                System.out.println("✅ Table 'cart' créée avec succès!");
                System.out.println("========================================");
            } else {
                System.out.println("✅ Table 'cart' existe déjà.");
            }

            // Vérifier et créer la table cart_item
            String checkCartItemTableQuery = "SELECT COUNT(*) FROM information_schema.tables " +
                    "WHERE table_schema = DATABASE() AND table_name = 'cart_item'";

            Integer cartItemTableCount = jdbcTemplate.queryForObject(checkCartItemTableQuery, Integer.class);

            if (cartItemTableCount == null || cartItemTableCount == 0) {
                System.out.println("========================================");
                System.out.println("📋 Table 'cart_item' n'existe pas. Création en cours...");

                String createCartItemTableSQL = "CREATE TABLE IF NOT EXISTS cart_item (" +
                        "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                        "cart_id BIGINT NOT NULL, " +
                        "publication_id BIGINT NOT NULL, " +
                        "quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0), " +
                        "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                        "FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE, " +
                        "FOREIGN KEY (publication_id) REFERENCES publication(id) ON DELETE CASCADE, " +
                        "UNIQUE KEY unique_cart_publication (cart_id, publication_id), " +
                        "INDEX idx_cart_id (cart_id), " +
                        "INDEX idx_publication_id (publication_id)" +
                        ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

                jdbcTemplate.execute(createCartItemTableSQL);

                System.out.println("✅ Table 'cart_item' créée avec succès!");
                System.out.println("========================================");
            } else {
                System.out.println("✅ Table 'cart_item' existe déjà.");
            }
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation des tables 'cart' et 'cart_item': " + e.getMessage());
            e.printStackTrace();
            if (!e.getMessage().contains("already exists") &&
                !e.getMessage().contains("Duplicate")) {
                System.err.println("⚠️  Veuillez créer manuellement les tables en exécutant le script SQL.");
            }
        }
    }
}

