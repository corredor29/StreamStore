SET @db := DATABASE();

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'servicios' AND COLUMN_NAME = 'renovacion_de_id') = 0,
  'ALTER TABLE servicios ADD COLUMN renovacion_de_id INT UNSIGNED NULL AFTER alerta_vencido_enviada, ADD UNIQUE KEY uq_servicio_renovacion (renovacion_de_id), ADD CONSTRAINT fk_serv_renovacion FOREIGN KEY (renovacion_de_id) REFERENCES servicios(id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'compra_items' AND COLUMN_NAME = 'servicio_id') = 0,
  'ALTER TABLE compra_items ADD COLUMN servicio_id INT UNSIGNED NULL AFTER subtotal, ADD CONSTRAINT fk_coi_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'carrito_items' AND COLUMN_NAME = 'servicio_id') = 0,
  'ALTER TABLE carrito_items ADD COLUMN servicio_id INT UNSIGNED NULL AFTER cantidad, ADD COLUMN renovacion_key INT UNSIGNED AS (IFNULL(servicio_id, 0)) STORED AFTER servicio_id, ADD CONSTRAINT fk_ci_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF((SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = @db AND TABLE_NAME = 'carrito_items' AND INDEX_NAME = 'uq_carrito_producto' AND COLUMN_NAME = 'renovacion_key') = 0,
  'ALTER TABLE carrito_items DROP INDEX uq_carrito_producto, ADD UNIQUE KEY uq_carrito_producto (carrito_id, producto_id, renovacion_key)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
