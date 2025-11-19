<?php
declare(strict_types=1);

session_start();
require __DIR__ . '/../db.php';

$_SESSION = [];
if (session_id() !== '') {
  session_destroy();
}

respond(['ok' => true]);
