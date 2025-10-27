<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected $usesTransactions = false;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure we're using in-memory database
        if (config('database.default') !== 'sqlite') {
            config(['database.default' => 'sqlite']);
            config(['database.connections.sqlite.database' => ':memory:']);
        }
    }
}
