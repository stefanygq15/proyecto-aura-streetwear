<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

$sessionUser = $_SESSION['user'] ?? null;
if (!$sessionUser) {
  respond(['error' => 'Debes iniciar sesión'], 401);
}

$ordersStmt = $pdo->prepare('SELECT id, status, total_cents, items_count, items, shipping_city, shipping_state, payment_method, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$ordersStmt->execute([$sessionUser['id']]);
$orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

$result = [];
foreach ($orders as $order) {
  $itemsDecoded = [];
  if (!empty($order['items'])) {
    $parsed = json_decode($order['items'], true);
    $itemsDecoded = is_array($parsed) ? $parsed : [];
  }

  $items = array_map(function($item){
    $price = (int)($item['price'] ?? 0);
    return [
      'title' => $item['title'] ?? '',
      'size' => $item['size'] ?? ($item['size_label'] ?? ''),
      'qty' => (int)($item['qty'] ?? 0),
      'price_cents' => $price,
      'price_formatted' => '$' . number_format($price, 0, ',', '.'),
      'image' => $item['image'] ?? ($item['image_url'] ?? ''),
    ];
  }, $itemsDecoded);

  $result[] = [
    'id' => $order['id'],
    'status' => $order['status'],
    'total_cents' => (int)$order['total_cents'],
    'total_formatted' => '$' . number_format((int)$order['total_cents'], 0, ',', '.'),
    'created_at' => $order['created_at'],
    'city' => $order['shipping_city'],
    'state' => $order['shipping_state'],
    'payment_method' => $order['payment_method'],
    'items_count' => (int)($order['items_count'] ?? count($items)),
    'items' => $items,
  ];
}

respond(['orders' => $result]);
