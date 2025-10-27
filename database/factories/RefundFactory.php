<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

class RefundFactory extends Factory
{
    protected $model = \App\Models\Refund::class;

    public function definition()
    {
        return [
            'customer_id' => Customer::factory(),
            'order_id' => Order::factory(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'method' => $this->faker->randomElement(['razorpay', 'credit_note', 'bank_transfer', 'manual']),
            'status' => $this->faker->randomElement(['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled']),
            'reason' => $this->faker->sentence(),
            'reference' => 'REF-' . $this->faker->date('Ymd') . '-' . strtoupper($this->faker->lexify('??????')),
            'requested_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'approved_at' => $this->faker->optional(0.7)->dateTimeBetween('-20 days', 'now'),
            'processed_at' => $this->faker->optional(0.5)->dateTimeBetween('-15 days', 'now'),
            'completed_at' => $this->faker->optional(0.3)->dateTimeBetween('-10 days', 'now'),
            'paid_at' => $this->faker->optional(0.3)->dateTimeBetween('-10 days', 'now'),
        ];
    }

    public function pending()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'pending',
                'approved_at' => null,
                'processed_at' => null,
                'completed_at' => null,
                'paid_at' => null,
            ];
        });
    }

    public function approved()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'approved',
                'approved_at' => $this->faker->dateTimeBetween('-20 days', 'now'),
                'processed_at' => null,
                'completed_at' => null,
                'paid_at' => null,
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'approved_at' => $this->faker->dateTimeBetween('-20 days', '-10 days'),
                'processed_at' => $this->faker->dateTimeBetween('-15 days', '-5 days'),
                'completed_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
                'paid_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            ];
        });
    }

    public function razorpay()
    {
        return $this->state(function (array $attributes) {
            return [
                'method' => 'razorpay',
            ];
        });
    }

    public function creditNote()
    {
        return $this->state(function (array $attributes) {
            return [
                'method' => 'credit_note',
            ];
        });
    }
}
