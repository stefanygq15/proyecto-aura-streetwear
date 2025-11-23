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
$fullName = trim((string)($payload['name'] ?? ''));
$phone = trim((string)($payload['phone'] ?? ''));
$email = filter_var((string)($payload['email'] ?? ''), FILTER_VALIDATE_EMAIL);

if ($fullName === '' || !$email) {
  respond(['error' => 'Nombre y email son obligatorios'], 422);
}

try {
  // Validar email duplicado
  $exists = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1');
  $exists->execute([$email, $sessionUser['id']]);
  if ($exists->fetchColumn()) {
    respond(['error' => 'Ese email ya está en uso'], 409);
  }

  $stmt = $pdo->prepare('UPDATE users SET full_name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
  $stmt->execute([$fullName, $email, $phone, $sessionUser['id']]);

  $_SESSION['user']['name'] = $fullName;
  $_SESSION['user']['email'] = $email;
  $_SESSION['user']['phone'] = $phone;

  respond([
    'updated' => true,
    'user' => [
      'id' => $sessionUser['id'],
      'name' => $fullName,
      'email' => $email,
      'phone' => $phone,
      'role' => $sessionUser['role'] ?? 'customer',
      'since' => $sessionUser['since'] ?? null,
    ]
  ]);
} catch (Throwable $e) {
  respond(['error' => $e->getMessage()], 500);
}
