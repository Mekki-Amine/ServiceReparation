-- Add auditing columns to `utilisateur` table
-- For MySQL: created_at and updated_at with proper defaults
-- Run this against your `serviceelectro` database (mysql -u root -p -D serviceelectro -e "SOURCE db/001_add_audit_columns_utilisateur.sql")

ALTER TABLE utilisateur
  ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- If you want nullable columns (no default), use:
-- ALTER TABLE utilisateur
--   ADD COLUMN created_at DATETIME NULL,
--   ADD COLUMN updated_at DATETIME NULL;

-- Note: adjust column types to TIMESTAMP or DATETIME depending on your needs and MySQL version.
