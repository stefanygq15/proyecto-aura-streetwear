<?php
// Initialize SQLite DB and seed products from assets/data/products.json
require __DIR__ . '/db.php';

try {
  $pdo->exec('CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT,
    title TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    gender TEXT NOT NULL,
    type TEXT,
    image TEXT
  )');

  // Check if any products exist
  $count = (int)$pdo->query('SELECT COUNT(*) FROM products')->fetchColumn();
  if ($count === 0) {
    $jsonFile = dirname(__DIR__) . '/assets/data/products.json';
    if (!file_exists($jsonFile)) {
      respond(['error' => 'products.json not found'], 500);
    }
    $items = json_decode(file_get_contents($jsonFile), true);
    if (!is_array($items)) {
      respond(['error' => 'Invalid products.json'], 500);
    }
    $stmt = $pdo->prepare('INSERT INTO products(slug,title,price,gender,type,image) VALUES(?,?,?,?,?,?)');
    foreach ($items as $p) {
      $stmt->execute([
        $p['id'] ?? null,
        $p['title'] ?? '',
        (int)($p['price'] ?? 0),
        $p['gender'] ?? 'hombres',
        $p['type'] ?? null,
        $p['image'] ?? null,
      ]);
    }
  }

  respond(['ok' => true, 'seeded' => $count === 0]);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}

