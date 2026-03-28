<?php

use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);

file_put_contents('the_exact_error.txt', '');
try {
    $kernel->call('migrate:fresh', ['--env' => 'testing', '--database' => 'sqlite']);
} catch (Throwable $e) {
    file_put_contents('the_exact_error.txt', $e->getMessage());
}
