<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Refund;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = \App\Models\Payment::class;

    public function definition()
    {
        return [
            'customer_id' => Customer::factory(),
            'payment_id' => 'pay_' . $this->faker->lexify('????????????????'),
            'amount' => $this->faker->numberBetween(10000, 500000), // Amount in paise
            'status' => $this->faker->randomElement(['captured', 'authorized', 'failed']),
            'method' => $this->faker->randomElement(['card', 'netbanking', 'wallet', 'upi']),
            'order_id' => 'ORD' . $this->faker->lexify('????????'),
            'rzorder_id' => 'rzp_order_' . $this->faker->lexify('????????'),
            'card_id' => $this->faker->optional(0.7)->lexify('card_????????'),
            'email' => $this->faker->email(),
            'contact' => $this->faker->numerify('##########'),
            'refunded_amount' => $this->faker->optional(0.3)->randomFloat(2, 0, 1000),
            'refund_status' => $this->faker->optional(0.3)->randomElement(['not_refunded', 'partially_refunded', 'fully_refunded']),
            'payment_details' => json_encode([
                'status' => 'captured',
                'method' => 'card',
                'card' => [
                    'last4' => $this->faker->numerify('####'),
                    'network' => 'Visa'
                ]
            ]),
        ];
    }

    public function captured()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'captured',
            ];
        });
    }

    public function authorized()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'authorized',
            ];
        });
    }

    public function failed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'failed',
            ];
        });
    }

    public function partiallyRefunded()
    {
        return $this->state(function (array $attributes) {
            return [
                'refunded_amount' => $this->faker->randomFloat(2, 100, $attributes['amount'] / 100 - 100),
                'refund_status' => 'partially_refunded',
            ];
        });
    }

    public function fullyRefunded()
    {
        return $this->state(function (array $attributes) {
            return [
                'refunded_amount' => $attributes['amount'] / 100, // Convert from paise to rupees
                'refund_status' => 'fully_refunded',
            ];
        });
    }
}