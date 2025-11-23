<?php
// Simple DB layer using MySQL so it matches phpMyAdmin
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$dbConfig = [
  'host' => getenv('DB_HOST') ?: '127.0.0.1',
  'port' => getenv('DB_PORT') ?: '3306',
  'name' => getenv('DB_NAME') ?: 'aura',
  'user' => getenv('DB_USER') ?: 'if0_40478502',
  'pass' => getenv('DB_PASS') ?: '',
  'charset' => 'utf8mb4',
];

$dsn = sprintf(
  'mysql:host=%s;port=%s;dbname=%s;charset=%s',
  $dbConfig['host'],
  $dbConfig['port'],
  $dbConfig['name'],
  $dbConfig['charset']
);

try {
  $pdo = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    // Permitir placeholders en LIMIT/OFFSET en MySQL al preparar consultas
    PDO::ATTR_EMULATE_PREPARES => true,
  ]);
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
