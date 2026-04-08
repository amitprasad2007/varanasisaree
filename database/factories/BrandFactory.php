<?php

namespace Database\Factories;

use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Brand>
 */
class BrandFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->company();

        return [
            'name' => $name.' '.fake()->unique()->numberBetween(1, 10000),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 10000),
            'status' => 'active',
        ];
    }
}
