<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

$user = $_SESSION['user'] ?? null;
respond([
  'authenticated' => $user !== null,
  'user' => $user,
]);
