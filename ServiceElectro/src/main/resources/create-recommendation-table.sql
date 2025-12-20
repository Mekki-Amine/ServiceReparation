CREATE TABLE IF NOT EXISTS recommendation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES utilisateur(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recommendation (user_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

