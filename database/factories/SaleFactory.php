<?php

namespace Database\Factories;

use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sale>
 */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        $subtotal = $this->faker->numberBetween(1000, 10000);
        $taxPercent = $this->faker->numberBetween(0, 18);
        $taxAmount = ($subtotal * $taxPercent) / 100;
        $total = $subtotal + $taxAmount;

        return [
            'customer_id' => null,
            'invoice_number' => 'INV-' . str_pad((string) $this->faker->unique()->numberBetween(1, 999999), 6, '0', STR_PAD_LEFT),
            'status' => 'completed',
            'subtotal' => $subtotal,
            'discount_type' => null,
            'discount_value' => 0,
            'tax_percent' => $taxPercent,
            'tax_amount' => $taxAmount,
            'total' => $total,
            'paid_total' => $total,
        ];
    }
}

