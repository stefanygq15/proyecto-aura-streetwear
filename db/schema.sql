-- Aura Streetwear - esquema limpio y escalable para MySQL
SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tablas antiguas que referencian products/users de esquemas previos
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS product_sizes;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sizes;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(160) NOT NULL UNIQUE,
  full_name VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40),
  wishlist LONGTEXT NOT NULL DEFAULT '[]',
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE products (
  id CHAR(36) PRIMARY KEY,
  slug VARCHAR(140) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  price_cents INT UNSIGNED NOT NULL,
  stock INT UNSIGNED NOT NULL DEFAULT 0,
  gender ENUM('hombres','mujeres','unisex') NOT NULL DEFAULT 'unisex',
  category VARCHAR(80),
  main_image VARCHAR(255),
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'published',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catalogo de assets (imagenes, banners, sliders)
CREATE TABLE assets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  kind ENUM('image','video','other') NOT NULL DEFAULT 'image',
  path VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  tags VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_assets_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE orders (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36),
  status ENUM('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  total_cents INT UNSIGNED NOT NULL DEFAULT 0,
  items_count INT UNSIGNED NOT NULL DEFAULT 0,
  items LONGTEXT NOT NULL,
  shipping_name VARCHAR(160),
  shipping_email VARCHAR(160),
  shipping_phone VARCHAR(40),
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(120),
  shipping_state VARCHAR(120),
  shipping_zip VARCHAR(24),
  shipping_notes TEXT,
  payment_method VARCHAR(50),
  shipping_method VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_orders_user (user_id, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO products (id, slug, title, description, price_cents, stock, gender, category, main_image) VALUES
  (UUID(), 'cam1-h', 'Camiseta basica negra', 'Algodon suave, corte regular.', 59000, 50, 'hombres', 'camisetas', 'assets/images/cam1-h.png'),
  (UUID(), 'cam2-h', 'Camiseta basica azul', 'Algodon suave, corte regular.', 59000, 50, 'hombres', 'camisetas', 'assets/images/cam2-h.png'),
  (UUID(), 'pan1-h', 'Pantalon deportivo negro', 'Tela comoda y resistente.', 99000, 40, 'hombres', 'pantalones', 'assets/images/pan1-h.png'),
  (UUID(), 'cam1-m', 'Camiseta oversize gris', 'Corte amplio y comodo.', 59000, 60, 'mujeres', 'camisetas', 'assets/images/cam1-m.png'),
  (UUID(), 'pan1-m', 'Vestido verde', 'Ligero y con caida natural.', 120000, 30, 'mujeres', 'vestidos', 'assets/images/pan1-m.png'),
  (UUID(), 'pan2-m', 'Sudadera oversize negra', 'Suave y abrigada.', 85000, 35, 'mujeres', 'sudaderas', 'assets/images/pan2-m.png')
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  stock = VALUES(stock),
  gender = VALUES(gender),
  category = VALUES(category),
  main_image = VALUES(main_image);

INSERT INTO assets (name, kind, path, alt_text, tags) VALUES
  ('Slider 1', 'image', 'assets/slider/1.png', 'Slider 1', 'slider,home'),
  ('Slider 2', 'image', 'assets/slider/2.png', 'Slider 2', 'slider,home'),
  ('Slider 3', 'image', 'assets/slider/3.png', 'Slider 3', 'slider,home'),
  ('Slider 4', 'image', 'assets/slider/4.png', 'Slider 4', 'slider,home'),
  ('Slider 5', 'image', 'assets/slider/5.png', 'Slider 5', 'slider,home')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  alt_text = VALUES(alt_text),
  tags = VALUES(tags);

COMMIT;
