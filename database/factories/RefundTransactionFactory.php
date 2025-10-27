<?php

namespace Database\Factories;

use App\Models\Refund;
use Illuminate\Database\Eloquent\Factories\Factory;

class RefundTransactionFactory extends Factory
{
    protected $model = \App\Models\RefundTransaction::class;

    public function definition()
    {
        return [
            'refund_id' => Refund::factory(),
            'transaction_id' => 'TXN-' . $this->faker->date('YmdHis') . '-' . strtoupper($this->faker->lexify('????')),
            'gateway' => $this->faker->randomElement(['razorpay', 'stripe', 'paytm', 'manual', 'bank_transfer']),
            'status' => $this->faker->randomElement(['processing', 'completed', 'failed', 'pending']),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'gateway_transaction_id' => $this->faker->optional(0.8)->lexify('gateway_????????'),
            'gateway_refund_id' => $this->faker->optional(0.8)->lexify('refund_????????'),
            'gateway_response' => $this->faker->optional(0.7)->randomElement([
                json_encode(['status' => 'success', 'transaction_id' => 'txn_123']),
                json_encode(['status' => 'failed', 'error' => 'Insufficient funds']),
                null
            ]),
            'processed_at' => $this->faker->dateTimeBetween('-15 days', 'now'),
            'completed_at' => $this->faker->optional(0.7)->dateTimeBetween('-10 days', 'now'),
        ];
    }

    public function processing()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'processing',
                'completed_at' => null,
            ];
        });
    }

    public function completed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'completed',
                'gateway_transaction_id' => 'gateway_' . $this->faker->lexify('????????'),
                'gateway_refund_id' => 'refund_' . $this->faker->lexify('????????'),
                'completed_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            ];
        });
    }

    public function failed()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'failed',
                'gateway_response' => json_encode(['error' => 'Payment failed']),
                'completed_at' => $this->faker->dateTimeBetween('-10 days', 'now'),
            ];
        });
    }

    public function razorpay()
    {
        return $this->state(function (array $attributes) {
            return [
                'gateway' => 'razorpay',
                'gateway_transaction_id' => 'rzp_' . $this->faker->lexify('????????'),
                'gateway_refund_id' => 'ref_' . $this->faker->lexify('????????'),
            ];
        });
    }
}
