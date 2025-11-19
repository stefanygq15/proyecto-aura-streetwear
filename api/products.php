<?php
// GET /api/products.php?gender=hombres&search=gris
require __DIR__ . '/db.php';

$gender = isset($_GET['gender']) ? trim(strtolower((string)$_GET['gender'])) : '';
$search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
$limit  = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;

try {
  $sql = 'SELECT p.id, p.slug, p.title, p.description, p.price_cents, p.gender,
                 c.name AS category_name,
                 COALESCE(img.url, \'\') AS image_url
          FROM products p
          LEFT JOIN categories c ON c.id = p.category_id
          LEFT JOIN product_images img ON img.product_id = p.id AND img.is_primary = 1
          WHERE 1=1';
  $params = [];
  if ($gender !== '') {
    $sql .= ' AND p.gender = ?';
    $params[] = $gender;
  }
  if ($search !== '') {
    $sql .= ' AND LOWER(p.title) LIKE ?';
    $params[] = '%' . strtolower($search) . '%';
  }
  $sql .= ' ORDER BY p.created_at DESC LIMIT ?';
  $params[] = $limit;

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $normalized = array_map(function ($row) {
    $image = $row['image_url'] ?: ("assets/images/" . ($row['slug'] ?: 'placeholder') . ".png");
    return [
      'id' => $row['id'],
      'slug' => $row['slug'],
      'title' => $row['title'],
      'description' => $row['description'],
      'price' => (int)($row['price_cents'] ?? 0),
      'gender' => $row['gender'],
      'type' => $row['category_name'] ?? '',
      'image' => $image,
    ];
  }, $rows);

  respond($normalized);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}
