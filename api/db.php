<?php
// Simple DB layer using SQLite for local PHP backend
// DB file: assets/db/aura.sqlite

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dbPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'db';
if (!is_dir($dbPath)) {
  @mkdir($dbPath, 0777, true);
}
$dbFile = $dbPath . DIRECTORY_SEPARATOR . 'aura.sqlite';

try {
  $pdo = new PDO('sqlite:' . $dbFile);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $pdo->exec('PRAGMA foreign_keys = ON');
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed', 'detail' => $e->getMessage()]);
  exit;
}

function respond($data, int $code = 200): void {
  http_response_code($code);
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

