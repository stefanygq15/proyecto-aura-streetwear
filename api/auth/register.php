<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  respond(['error' => 'Método no permitido'], 405);
}

$payload = json_decode(file_get_contents('php://input'), true);

$name = trim((string)($payload['name'] ?? ''));
$email = filter_var((string)($payload['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = (string)($payload['password'] ?? '');

if ($name === '' || !$email || strlen($password) < 6) {
  respond(['error' => 'Datos inválidos.'], 422);
}

try {
  $exists = $pdo->prepare('SELECT 1 FROM users WHERE email = ? LIMIT 1');
  $exists->execute([$email]);
  if ($exists->fetchColumn()) {
    respond(['error' => 'Ya existe una cuenta con ese email.'], 409);
  }

  $hash = password_hash($password, PASSWORD_DEFAULT);
  $userId = $pdo->query('SELECT UUID()')->fetchColumn();

  $stmt = $pdo->prepare('INSERT INTO users (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, ?)');
  $stmt->execute([$userId, $email, $name, $hash, 'customer']);

  $fresh = $pdo->prepare('SELECT id, email, full_name AS name, phone, role, created_at FROM users WHERE id = ?');
  $fresh->execute([$userId]);
  $user = $fresh->fetch(PDO::FETCH_ASSOC);

  $_SESSION['user'] = [
    'id' => $user['id'],
    'email' => $user['email'],
    'name' => $user['name'],
    'phone' => $user['phone'] ?? '',
    'role' => $user['role'],
    'since' => $user['created_at'],
  ];

  respond(['registered' => true, 'user' => $_SESSION['user']]);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}
