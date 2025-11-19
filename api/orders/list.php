<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

$sessionUser = $_SESSION['user'] ?? null;
if (!$sessionUser) {
  respond(['error' => 'Debes iniciar sesión'], 401);
}

$ordersStmt = $pdo->prepare('SELECT id, status, total_cents, shipping_city, shipping_state, payment_method, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC');
$ordersStmt->execute([$sessionUser['id']]);
$orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];

$itemsStmt = $pdo->prepare('SELECT title, size_label, qty, price_cents, image_url FROM order_items WHERE order_id = ? ORDER BY id ASC');

$result = [];
foreach ($orders as $order) {
  $itemsStmt->execute([$order['id']]);
  $itemsRaw = $itemsStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
  $items = array_map(function($item){
    return [
      'title' => $item['title'],
      'size' => $item['size_label'],
      'qty' => (int)$item['qty'],
      'price_cents' => (int)$item['price_cents'],
      'price_formatted' => '$' . number_format((int)$item['price_cents'], 0, ',', '.'),
      'image' => $item['image_url'],
    ];
  }, $itemsRaw);

  $result[] = [
    'id' => $order['id'],
    'status' => $order['status'],
    'total_cents' => (int)$order['total_cents'],
    'total_formatted' => '$' . number_format((int)$order['total_cents'], 0, ',', '.'),
    'created_at' => $order['created_at'],
    'city' => $order['shipping_city'],
    'state' => $order['shipping_state'],
    'payment_method' => $order['payment_method'],
    'items' => $items,
  ];
}

respond(['orders' => $result]);
