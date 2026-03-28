<?php

namespace Tests\Feature;

use App\Models\Vendor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VendorFactoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_vendor_factory_creates_vendor(): void
    {
        $vendor = Vendor::factory()->create([
            'business_name' => 'Test Store',
            'status' => 'active',
            'is_verified' => true,
        ]);

        $this->assertNotNull($vendor);
        $this->assertEquals('active', $vendor->status);
        $this->assertEquals('Test Store', $vendor->business_name);
    }
}
