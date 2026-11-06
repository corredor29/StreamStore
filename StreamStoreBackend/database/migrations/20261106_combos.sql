-- Combos promocionales multi-plataforma. Se puede correr varias veces.
CREATE TABLE IF NOT EXISTS combos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  precio_promo DECIMAL(12,2) NOT NULL,
  precio_regular DECIMAL(12,2) NOT NULL,
  pantallas_por_plataforma TINYINT UNSIGNED NOT NULL DEFAULT 1,
  duracion_dias SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  etiqueta_promo VARCHAR(40) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_combos_activo (activo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS combo_plataformas (
  combo_id INT UNSIGNED NOT NULL,
  plataforma_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (combo_id, plataforma_id),
  CONSTRAINT fk_combo_plat_combo FOREIGN KEY (combo_id) REFERENCES combos(id) ON DELETE CASCADE,
  CONSTRAINT fk_combo_plat_plataforma FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
) ENGINE=InnoDB;
