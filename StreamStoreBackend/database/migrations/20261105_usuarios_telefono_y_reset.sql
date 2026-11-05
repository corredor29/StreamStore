SET @db := DATABASE();

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'telefono') = 0,
  'ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL AFTER password',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'usuarios' AND COLUMN_NAME = 'reset_token_hash') = 0,
  'ALTER TABLE usuarios ADD COLUMN reset_token_hash CHAR(64) NULL AFTER rol, ADD COLUMN reset_token_expira DATETIME NULL AFTER reset_token_hash',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
