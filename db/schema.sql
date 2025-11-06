-- Aura Streetwear - Esquema PostgreSQL
-- Ejecuta con: psql -U postgres -f db/schema.sql

CREATE SCHEMA IF NOT EXISTS aura;
SET search_path TO aura;

-- Catálogos
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  gender TEXT NOT NULL CHECK (gender IN ('hombres','mujeres')), 
  category_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id SERIAL PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS sizes (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE -- S, M, L, XL
);

CREATE TABLE IF NOT EXISTS product_sizes (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  size_id INTEGER REFERENCES sizes(id),
  stock INTEGER NOT NULL DEFAULT 10,
  PRIMARY KEY (product_id, size_id)
);

-- Pedidos (mínimo viable)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  total_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  size_id INTEGER REFERENCES sizes(id),
  qty INTEGER NOT NULL DEFAULT 1,
  price_cents INTEGER NOT NULL DEFAULT 0
);

-- Datos base
INSERT INTO categories (name) VALUES
  ('Camisetas') ON CONFLICT DO NOTHING;

INSERT INTO sizes (code) VALUES ('S'),('M'),('L'),('XL')
ON CONFLICT DO NOTHING;

-- Productos de ejemplo (coinciden con assets/images)
-- Requiere extensión pgcrypto para gen_random_uuid(); en Postgres 13+: CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH p AS (
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
  ON CONFLICT DO NOTHING
  RETURNING id, slug
)
INSERT INTO product_images (product_id, url, is_primary)
SELECT p.id, CASE p.slug
  WHEN 'cam1-h' THEN 'assets/images/cam1-h.png'
  WHEN 'cam2-h' THEN 'assets/images/cam2-h.png'
  WHEN 'cam3-h' THEN 'assets/images/cam3-h.png'
  WHEN 'pan1-h' THEN 'assets/images/pan1-h.png'
  WHEN 'pan2-h' THEN 'assets/images/pan2-h.png'
  WHEN 'pan3-h' THEN 'assets/images/pan3-h.png'
  WHEN 'cam1-m' THEN 'assets/images/cam1-m.png'
  WHEN 'cam2-m' THEN 'assets/images/cam2-m.png'
  WHEN 'cam3-m' THEN 'assets/images/cam3-m.png'
  WHEN 'cam4-m' THEN 'assets/images/cam4-m.png'
  WHEN 'pan1-m' THEN 'assets/images/pan1-m.png'
  WHEN 'pan2-m' THEN 'assets/images/pan2-m.png'
  WHEN 'pan3-m' THEN 'assets/images/pan3-m.png'
  END, true
FROM p;

