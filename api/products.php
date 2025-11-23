<?php
// GET /api/products.php?gender=hombres&search=gris
require __DIR__ . '/db.php';

$gender = isset($_GET['gender']) ? trim(strtolower((string)$_GET['gender'])) : '';
$search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
$limit  = isset($_GET['limit']) ? max(1, min(200, (int)$_GET['limit'])) : 100;

try {
  $sql = 'SELECT p.id, p.slug, p.title, p.description, p.price_cents, p.gender, p.category, p.main_image
          FROM products p
          WHERE p.status = "published"';
  $params = [];
  if ($gender !== '') {
    $sql .= ' AND p.gender = ?';
    $params[] = $gender;
  }
  if ($search !== '') {
    $sql .= ' AND (LOWER(p.title) LIKE ? OR LOWER(p.category) LIKE ?)';
    $like = '%' . strtolower($search) . '%';
    $params[] = $like;
    $params[] = $like;
  }
  $sql .= ' ORDER BY p.created_at DESC LIMIT ' . $limit;

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

  $normalized = array_map(function ($row) {
    $image = $row['main_image'] ?: ("assets/images/" . ($row['slug'] ?: 'placeholder') . ".png");
    return [
      'id' => $row['id'],
      'slug' => $row['slug'],
      'title' => $row['title'],
      'description' => $row['description'],
      'price' => (int)($row['price_cents'] ?? 0),
      'gender' => $row['gender'],
      'type' => $row['category'] ?? '',
      'image' => $image,
    ];
  }, $rows);

  respond($normalized);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}
