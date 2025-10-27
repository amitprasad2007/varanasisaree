<?php

namespace Database\Factories;

use App\Models\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SaleItem>
 */
class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    public function definition(): array
    {
        $quantity = $this->faker->numberBetween(1, 5);
        $price = $this->faker->numberBetween(100, 2000);
        $lineTotal = $quantity * $price;

        return [
            'sale_id' => null,
            'product_id' => null,
            'product_variant_id' => null,
            'name' => $this->faker->words(3, true),
            'sku' => 'SKU-' . strtoupper($this->faker->bothify('??##??')),
            'quantity' => $quantity,
            'price' => $price,
            'line_total' => $lineTotal,
        ];
    }
}

