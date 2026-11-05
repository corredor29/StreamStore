-- Portada de plataformas, cuentas sin credenciales y estado de entrega de servicios. Se puede correr varias veces.
SET @db := DATABASE();

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'plataformas' AND COLUMN_NAME = 'portada_url') = 0,
  'ALTER TABLE plataformas ADD COLUMN portada_url VARCHAR(500) NULL AFTER logo_url',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

ALTER TABLE cuentas MODIFY email VARCHAR(150) NULL, MODIFY password_cifrada VARCHAR(512) NULL;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'servicios' AND COLUMN_NAME = 'estado_entrega') = 0,
  'ALTER TABLE servicios ADD COLUMN estado_entrega ENUM(''entregado'',''pendiente_asignacion'') NOT NULL DEFAULT ''entregado'' AFTER estado, ADD COLUMN entregado_at DATETIME NULL AFTER estado_entrega, ADD KEY idx_servicios_entrega (estado_entrega)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Los servicios que ya existían se entregaron al pagar
UPDATE servicios SET entregado_at = created_at WHERE estado_entrega = 'entregado' AND entregado_at IS NULL;
