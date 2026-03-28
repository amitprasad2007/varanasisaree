<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoutingTest extends TestCase
{
    public function test_root_route_works()
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }
}
