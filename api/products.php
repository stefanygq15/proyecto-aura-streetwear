<?php
// GET /api/products.php?gender=hombres&search=gris
require __DIR__ . '/db.php';

$gender = isset($_GET['gender']) ? trim(strtolower((string)$_GET['gender'])) : '';
$search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
$limit  = isset($_GET['limit']) ? max(1, (int)$_GET['limit']) : 100;

try {
  $sql = 'SELECT id, title, price as price, gender, type, image FROM products WHERE 1=1';
  $params = [];
  if ($gender !== '') {
    $sql .= ' AND gender = ?';
    $params[] = $gender;
  }
  if ($search !== '') {
    $sql .= ' AND lower(title) LIKE ?';
    $params[] = '%' . strtolower($search) . '%';
  }
  $sql .= ' ORDER BY id DESC LIMIT ?';
  $params[] = $limit;

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  // Ensure numeric price
  foreach ($rows as &$r) { $r['price'] = (int)$r['price']; }
  respond($rows);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}

