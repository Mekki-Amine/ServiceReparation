-- Script de migration pour renommer la colonne 'read' en 'is_read'
-- Exécutez ce script dans MySQL si la table message existe déjà avec l'ancienne colonne 'read'

USE serviceelectro;

-- Vérifier si la colonne 'read' existe
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'serviceelectro' 
    AND TABLE_NAME = 'message' 
    AND COLUMN_NAME = 'read'
);

-- Renommer la colonne si elle existe
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE message CHANGE COLUMN `read` is_read BOOLEAN NOT NULL DEFAULT FALSE',
    'SELECT "La colonne read n''existe pas, aucune migration nécessaire" AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migration terminée avec succès!' AS status;

