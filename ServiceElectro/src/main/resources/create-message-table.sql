-- Script SQL pour créer la table message
-- Exécutez ce script dans votre base de données MySQL si la table n'existe pas
-- Ce script sera également exécuté automatiquement au démarrage de l'application

USE serviceelectro;

CREATE TABLE IF NOT EXISTS message (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(2000),
    sender_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    location_name VARCHAR(500),
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (sender_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    INDEX idx_sender (sender_id),
    INDEX idx_receiver (receiver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vérifier que la table a été créée
SELECT 'Table message créée avec succès!' AS status;

