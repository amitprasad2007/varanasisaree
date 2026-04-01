<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Vendor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => 'ORD-'.$this->faker->unique()->numberBetween(10000, 99999),
            'customer_id' => Customer::factory(),
            'vendor_id' => Vendor::factory(),
            'sub_total' => $this->faker->randomFloat(2, 100, 5000),
            'quantity' => $this->faker->numberBetween(1, 5),
            'total_amount' => function (array $attributes) {
                return $attributes['sub_total'];
            },
            'payment_method' => 'razorpay',
            'payment_status' => 'paid',
            'status' => 'delivered',
        ];
    }
}
