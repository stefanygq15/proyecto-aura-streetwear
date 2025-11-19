-- Aura Streetwear - Esquema MySQL
-- Importar desde phpMyAdmin apuntando a la base `aura`

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Catálogos
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  slug VARCHAR(120) UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_cents INT UNSIGNED NOT NULL,
  gender ENUM('hombres','mujeres') NOT NULL,
  category_id INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id CHAR(36),
  url VARCHAR(255) NOT NULL,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_product_image (product_id, url),
  CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sizes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id CHAR(36),
  size_id INT,
  stock INT NOT NULL DEFAULT 10,
  PRIMARY KEY (product_id, size_id),
  CONSTRAINT fk_product_sizes_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_product_sizes_size FOREIGN KEY (size_id) REFERENCES sizes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pedidos
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer','admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  total_cents INT UNSIGNED NOT NULL DEFAULT 0,
  shipping_name VARCHAR(255),
  shipping_email VARCHAR(255),
  shipping_phone VARCHAR(50),
  shipping_address VARCHAR(255),
  shipping_city VARCHAR(120),
  shipping_state VARCHAR(120),
  shipping_zip VARCHAR(20),
  shipping_notes TEXT,
  payment_method VARCHAR(50),
  shipping_method VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id CHAR(36),
  product_id CHAR(36),
  product_slug VARCHAR(120),
  size_id INT,
  size_label VARCHAR(20),
  qty INT NOT NULL DEFAULT 1,
  price_cents INT UNSIGNED NOT NULL DEFAULT 0,
  title VARCHAR(255),
  image_url VARCHAR(255),
  CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_order_items_size FOREIGN KEY (size_id) REFERENCES sizes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos base
INSERT IGNORE INTO categories (name) VALUES ('Camisetas');

INSERT IGNORE INTO sizes (code) VALUES ('S'), ('M'), ('L'), ('XL');

INSERT INTO products (slug, title, description, price_cents, gender, category_id)
VALUES
  ('cam1-h','Camiseta Básica Negra','Algodón suave, corte regular.',59000,'hombres',1),
  ('cam2-h','Camiseta Básica Azul','Algodón suave, corte regular.',59000,'hombres',1),
  ('cam3-h','Camiseta Básica Gris','Algodón suave, corte regular.',59000,'hombres',1),
  ('pan1-h','Pantalón Deportivo Negro','Tela cómoda y resistente.',99000,'hombres',1),
  ('pan2-h','Sudadera Ajustada Negra','Cálida, ideal para clima frío.',65000,'hombres',1),
  ('pan3-h','Camiseta Deportiva Gris','Secado rápido.',62000,'hombres',1),
  ('cam1-m','Camiseta Oversize Gris','Corte amplio y cómodo.',59000,'mujeres',1),
  ('cam2-m','Camiseta Básica Rosa','Algodón suave.',59000,'mujeres',1),
  ('cam3-m','Camiseta Básica Verde','Algodón suave.',59000,'mujeres',1),
  ('cam4-m','Camiseta Básica Blanca','Clásica y ligera.',59000,'mujeres',1),
  ('pan1-m','Vestido Verde','Ligero y con caída natural.',120000,'mujeres',1),
  ('pan2-m','Sudadera Oversize Negra','Gran comodidad.',85000,'mujeres',1),
  ('pan3-m','Jean Ancho Azul','Corte amplio.',72000,'mujeres',1)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description),
  price_cents = VALUES(price_cents),
  gender = VALUES(gender),
  category_id = VALUES(category_id);

INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam1-h.png', 1 FROM products WHERE slug = 'cam1-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam2-h.png', 1 FROM products WHERE slug = 'cam2-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam3-h.png', 1 FROM products WHERE slug = 'cam3-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan1-h.png', 1 FROM products WHERE slug = 'pan1-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan2-h.png', 1 FROM products WHERE slug = 'pan2-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan3-h.png', 1 FROM products WHERE slug = 'pan3-h'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam1-m.png', 1 FROM products WHERE slug = 'cam1-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam2-m.png', 1 FROM products WHERE slug = 'cam2-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam3-m.png', 1 FROM products WHERE slug = 'cam3-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/cam4-m.png', 1 FROM products WHERE slug = 'cam4-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan1-m.png', 1 FROM products WHERE slug = 'pan1-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan2-m.png', 1 FROM products WHERE slug = 'pan2-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);
INSERT INTO product_images (product_id, url, is_primary)
SELECT id, 'assets/images/pan3-m.png', 1 FROM products WHERE slug = 'pan3-m'
ON DUPLICATE KEY UPDATE url = VALUES(url);

COMMIT;
