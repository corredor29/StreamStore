CREATE DATABASE IF NOT EXISTS streamStoreDb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE streamStoreDb;

-- Esquema pendiente del reto StreamStore
-- users (id, name, email, password, role, created_at, updated_at)
-- categories (id, name)
-- products (id, category_id, name, description, price, stock, created_at, updated_at)
-- carts (id, user_id, status)
-- cart_items (id, cart_id, product_id, quantity, unit_price)
-- orders (id, user_id, total, status, created_at)
-- order_items (id, order_id, product_id, quantity, unit_price)
-- stock_movements (id, product_id, type, quantity, created_at)
