-- StreamStore - esquema MySQL/MariaDB (fuente única: lo usa `npm run db:reset`)
CREATE DATABASE IF NOT EXISTS streamStoreDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE streamStoreDb;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS servicios, compra_items, compras, carrito_items, carritos, pantallas, cuentas, productos, plataformas, usuarios;

CREATE TABLE usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NULL,
  rol ENUM('cliente','admin') NOT NULL DEFAULT 'cliente',
  reset_token_hash CHAR(64) NULL,
  reset_token_expira DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE plataformas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL UNIQUE,
  descripcion VARCHAR(255) NULL,
  logo_url VARCHAR(255) NULL,
  portada_url VARCHAR(500) NULL,
  max_pantallas TINYINT UNSIGNED NOT NULL DEFAULT 4,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- tipo: cuenta_completa (se vende la cuenta entera) | pantalla (se vende un perfil)
CREATE TABLE productos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plataforma_id INT UNSIGNED NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo ENUM('cuenta_completa','pantalla') NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  duracion_dias INT UNSIGNED NOT NULL DEFAULT 30,
  stock_minimo INT UNSIGNED NOT NULL DEFAULT 2,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_producto_plataforma_tipo (plataforma_id, tipo),
  CONSTRAINT fk_productos_plataforma FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
) ENGINE=InnoDB;

-- password_cifrada: AES-256-GCM (iv:tag:data en hex)
-- email/password NULL = cuenta pendiente de asignación: se vende igual y el admin entrega las credenciales después
CREATE TABLE cuentas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  plataforma_id INT UNSIGNED NOT NULL,
  email VARCHAR(150) NULL,
  password_cifrada VARCHAR(512) NULL,
  total_pantallas TINYINT UNSIGNED NOT NULL DEFAULT 4,
  estado ENUM('disponible','vendida_completa','inactiva') NOT NULL DEFAULT 'disponible',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_cuenta (plataforma_id, email),
  CONSTRAINT fk_cuentas_plataforma FOREIGN KEY (plataforma_id) REFERENCES plataformas(id)
) ENGINE=InnoDB;

CREATE TABLE pantallas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cuenta_id INT UNSIGNED NOT NULL,
  numero TINYINT UNSIGNED NOT NULL,
  perfil VARCHAR(60) NOT NULL,
  pin VARCHAR(10) NOT NULL,
  estado ENUM('disponible','vendida') NOT NULL DEFAULT 'disponible',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pantalla (cuenta_id, numero),
  CONSTRAINT fk_pantallas_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carritos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carritos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE carrito_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  carrito_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL DEFAULT 1,
  servicio_id INT UNSIGNED NULL,
  renovacion_key INT UNSIGNED AS (IFNULL(servicio_id, 0)) STORED,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_carrito_producto (carrito_id, producto_id, renovacion_key),
  CONSTRAINT fk_ci_carrito FOREIGN KEY (carrito_id) REFERENCES carritos(id) ON DELETE CASCADE,
  CONSTRAINT fk_ci_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_ci_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
) ENGINE=InnoDB;

CREATE TABLE compras (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente','pagada','cancelada') NOT NULL DEFAULT 'pendiente',
  metodo_pago VARCHAR(30) NOT NULL DEFAULT 'simulado',
  referencia_pago VARCHAR(60) NULL,
  pagada_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_compras_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE TABLE compra_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  compra_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cantidad INT UNSIGNED NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  servicio_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_coi_compra FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  CONSTRAINT fk_coi_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_coi_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
) ENGINE=InnoDB;

-- Un servicio = una cuenta completa o una pantalla entregada al cliente por N días
CREATE TABLE servicios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  compra_id INT UNSIGNED NOT NULL,
  producto_id INT UNSIGNED NOT NULL,
  cuenta_id INT UNSIGNED NOT NULL,
  pantalla_id INT UNSIGNED NULL,
  tipo ENUM('cuenta_completa','pantalla') NOT NULL,
  fecha_inicio DATETIME NOT NULL,
  fecha_vencimiento DATETIME NOT NULL,
  estado ENUM('activo','vencido') NOT NULL DEFAULT 'activo',
  estado_entrega ENUM('entregado','pendiente_asignacion') NOT NULL DEFAULT 'entregado',
  entregado_at DATETIME NULL,
  alerta_3d_enviada TINYINT(1) NOT NULL DEFAULT 0,
  alerta_1d_enviada TINYINT(1) NOT NULL DEFAULT 0,
  alerta_vencido_enviada TINYINT(1) NOT NULL DEFAULT 0,
  renovacion_de_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_servicios_vencimiento (estado, fecha_vencimiento),
  KEY idx_servicios_entrega (estado_entrega),
  UNIQUE KEY uq_servicio_renovacion (renovacion_de_id),
  CONSTRAINT fk_serv_renovacion FOREIGN KEY (renovacion_de_id) REFERENCES servicios(id),
  CONSTRAINT fk_serv_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_serv_compra FOREIGN KEY (compra_id) REFERENCES compras(id),
  CONSTRAINT fk_serv_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
  CONSTRAINT fk_serv_cuenta FOREIGN KEY (cuenta_id) REFERENCES cuentas(id),
  CONSTRAINT fk_serv_pantalla FOREIGN KEY (pantalla_id) REFERENCES pantallas(id)
) ENGINE=InnoDB;

-- Stock (calculado, no almacenado):
--   pantalla        = COUNT(pantallas disponibles de cuentas 'disponible' de la plataforma)
--   cuenta_completa = COUNT(cuentas 'disponible' de la plataforma cuyas pantallas están TODAS disponibles)
CREATE OR REPLACE VIEW v_stock_productos AS
SELECT pr.id AS producto_id, pr.plataforma_id, pr.tipo, pr.stock_minimo,
  CASE pr.tipo
    WHEN 'pantalla' THEN (SELECT COUNT(*) FROM pantallas p JOIN cuentas c ON c.id = p.cuenta_id
                          WHERE c.plataforma_id = pr.plataforma_id AND c.estado = 'disponible' AND p.estado = 'disponible')
    ELSE (SELECT COUNT(*) FROM cuentas c WHERE c.plataforma_id = pr.plataforma_id AND c.estado = 'disponible'
          AND NOT EXISTS (SELECT 1 FROM pantallas p WHERE p.cuenta_id = c.id AND p.estado <> 'disponible'))
  END AS stock
FROM productos pr;

SET FOREIGN_KEY_CHECKS = 1;
