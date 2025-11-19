<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(['error' => 'Método no permitido'], 405);
}

$sessionUser = $_SESSION['user'] ?? null;
if (!$sessionUser) {
  respond(['error' => 'Debes iniciar sesión'], 401);
}

$payload = json_decode(file_get_contents('php://input'), true);
$items = $payload['items'] ?? [];
$shipping = $payload['shipping'] ?? [];

if (!is_array($items) || count($items) === 0) {
  respond(['error' => 'El carrito está vacío'], 422);
}

$shippingName = trim((string)($shipping['name'] ?? $sessionUser['name'] ?? ''));
$shippingEmail = trim((string)($shipping['email'] ?? $sessionUser['email'] ?? ''));
$shippingPhone = trim((string)($shipping['phone'] ?? ''));
$shippingAddress = trim((string)($shipping['address'] ?? ''));
$shippingCity = trim((string)($shipping['city'] ?? ''));
$shippingState = trim((string)($shipping['state'] ?? ''));
$shippingZip = trim((string)($shipping['zip'] ?? ''));
$shippingNotes = trim((string)($shipping['notes'] ?? ''));
$paymentMethod = trim((string)($payload['payment_method'] ?? 'sin-definir'));
$shippingMethod = trim((string)($payload['shipping_method'] ?? 'standard'));

if ($shippingName === '' || $shippingEmail === '' || $shippingAddress === '' || $shippingCity === '') {
  respond(['error' => 'Faltan datos de envío'], 422);
}

$totalCents = 0;
$normalizedItems = [];
foreach ($items as $item) {
  $title = trim((string)($item['title'] ?? ''));
  $price = (int)($item['price'] ?? 0);
  $qty = max(1, (int)($item['qty'] ?? 1));
  if ($title === '' || $price <= 0) {
    continue;
  }
  $totalCents += $price * $qty;
  $normalizedItems[] = [
    'product_id' => $item['id'] ?? null,
    'product_slug' => $item['slug'] ?? null,
    'title' => $title,
    'price' => $price,
    'qty' => $qty,
    'size' => $item['size'] ?? '',
    'image' => $item['image'] ?? '',
  ];
}

if ($totalCents <= 0 || empty($normalizedItems)) {
  respond(['error' => 'Los productos no son válidos'], 422);
}

$orderId = $pdo->query('SELECT UUID()')->fetchColumn();
$productLookup = $pdo->prepare('SELECT id FROM products WHERE id = ? OR slug = ? LIMIT 1');
$sizeLookup = $pdo->prepare('SELECT id FROM sizes WHERE code = ? LIMIT 1');

try {
  $pdo->beginTransaction();

  $stmt = $pdo->prepare('INSERT INTO orders (id, user_id, status, total_cents, shipping_name, shipping_email, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_notes, payment_method, shipping_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([
    $orderId,
    $sessionUser['id'],
    'pending',
    $totalCents,
    $shippingName,
    $shippingEmail,
    $shippingPhone,
    $shippingAddress,
    $shippingCity,
    $shippingState,
    $shippingZip,
    $shippingNotes,
    $paymentMethod,
    $shippingMethod,
  ]);

  $insertItem = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_slug, size_id, size_label, qty, price_cents, title, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

  foreach ($normalizedItems as $item) {
    $productId = null;
    if (!empty($item['product_id']) || !empty($item['product_slug'])) {
      $productLookup->execute([$item['product_id'] ?? null, $item['product_slug'] ?? $item['product_id'] ?? null]);
      $productId = $productLookup->fetchColumn() ?: null;
    }

    $sizeId = null;
    if (!empty($item['size'])) {
      $sizeLookup->execute([$item['size']]);
      $sizeId = $sizeLookup->fetchColumn() ?: null;
    }

    $insertItem->execute([
      $orderId,
      $productId,
      $item['product_slug'],
      $sizeId,
      $item['size'],
      $item['qty'],
      $item['price'],
      $item['title'],
      $item['image'],
    ]);
  }

  $pdo->commit();

  $orderInfo = [
    'id' => $orderId,
    'status' => 'pending',
    'total_cents' => $totalCents,
    'total_formatted' => '$' . number_format($totalCents, 0, ',', '.'),
    'items_count' => array_sum(array_column($normalizedItems, 'qty')),
    'created_at' => date('c'),
  ];

  respond(['order' => $orderInfo]);
} catch (Throwable $e) {
  $pdo->rollBack();
  respond(['error' => $e->getMessage()], 500);
}
