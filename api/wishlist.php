<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/db.php';

$sessionUser = $_SESSION['user'] ?? null;
if (!$sessionUser) {
  respond(['error' => 'Debes iniciar sesión'], 401);
}

$userId = $sessionUser['id'];
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function getWishlistSlugs(PDO $pdo, string $userId): array {
  $stmt = $pdo->prepare('SELECT wishlist FROM users WHERE id = ?');
  $stmt->execute([$userId]);
  $raw = $stmt->fetchColumn();
  $decoded = json_decode((string)$raw, true);
  if (!is_array($decoded)) return [];
  // normalizar strings
  return array_values(array_filter(array_map(function ($v) {
    return is_string($v) ? trim($v) : '';
  }, $decoded)));
}

function saveWishlistSlugs(PDO $pdo, string $userId, array $slugs): void {
  $unique = array_values(array_unique(array_filter($slugs, fn($s) => $s !== '')));
  $json = json_encode($unique, JSON_UNESCAPED_UNICODE);
  $stmt = $pdo->prepare('UPDATE users SET wishlist = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  $stmt->execute([$json, $userId]);
}

function fetchWishlist(PDO $pdo, array $slugs): array {
  if (empty($slugs)) return [];
  // construir placeholders
  $placeholders = implode(',', array_fill(0, count($slugs), '?'));
  $stmt = $pdo->prepare("SELECT id, slug, title, price_cents, main_image FROM products WHERE slug IN ($placeholders)");
  $stmt->execute($slugs);
  $products = [];
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $products[$row['slug']] = $row;
  }

  // mantener el orden tal como está en el array de slugs
  $result = [];
  foreach ($slugs as $slug) {
    $p = $products[$slug] ?? ['slug' => $slug, 'price_cents' => 0, 'main_image' => ''];
    $price = (int)($p['price_cents'] ?? 0);
    $result[] = [
      'slug' => $slug,
      'product_id' => $p['id'] ?? null,
      'title' => $p['title'] ?? $slug,
      'price_cents' => $price,
      'price_formatted' => '$' . number_format($price, 0, ',', '.'),
      'image' => $p['main_image'] ?: 'assets/images/placeholder.png',
    ];
  }
  return $result;
}

try {
  if ($method === 'GET') {
    $slugs = getWishlistSlugs($pdo, $userId);
    respond(['items' => fetchWishlist($pdo, $slugs)]);
  }

  $payload = json_decode(file_get_contents('php://input'), true);
  $productSlug = $payload['product_slug'] ?? ($payload['slug'] ?? null);

  if ($method === 'POST') {
    if (!$productSlug) {
      respond(['error' => 'Falta producto'], 422);
    }
    // No fallar si el producto aún no existe en BD; se guarda el slug igualmente.
    $slugs = getWishlistSlugs($pdo, $userId);
    $slugs[] = $productSlug;
    $unique = array_values(array_unique($slugs));
    saveWishlistSlugs($pdo, $userId, $unique);
    respond(['added' => true, 'items' => fetchWishlist($pdo, $unique) ]);
  }

  if ($method === 'DELETE') {
    if (!$productSlug) {
      respond(['error' => 'Falta producto'], 422);
    }
    $slugs = getWishlistSlugs($pdo, $userId);
    $slugs = array_values(array_filter($slugs, fn($s) => $s !== $productSlug));
    saveWishlistSlugs($pdo, $userId, $slugs);
    respond(['removed' => true, 'items' => fetchWishlist($pdo, $slugs)]);
  }

  respond(['error' => 'Método no permitido'], 405);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}
