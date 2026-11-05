SET @existe := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'plataformas' AND COLUMN_NAME = 'max_pantallas'
);
SET @sql := IF(@existe = 0,
  'ALTER TABLE plataformas ADD COLUMN max_pantallas TINYINT UNSIGNED NOT NULL DEFAULT 4 AFTER logo_url',
  'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE plataformas p
JOIN (SELECT plataforma_id, MAX(total_pantallas) AS pantallas FROM cuentas GROUP BY plataforma_id) c ON c.plataforma_id = p.id
SET p.max_pantallas = c.pantallas
WHERE @existe = 0;
