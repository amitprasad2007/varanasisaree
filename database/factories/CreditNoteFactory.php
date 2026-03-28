<?php

namespace Database\Factories;

use App\Models\CreditNote;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CreditNote>
 */
class CreditNoteFactory extends Factory
{
    protected $model = CreditNote::class;

    public function definition(): array
    {
        $amount = $this->faker->numberBetween(100, 5000);

        return [
            'credit_note_number' => 'CN-'.strtoupper($this->faker->unique()->bothify('??????')),
            'customer_id' => null,
            'amount' => $amount,
            'remaining_amount' => $amount,
            'reference' => 'CN-'.now()->format('Ymd').'-'.strtoupper($this->faker->bothify('??##')),
            'status' => 'active',
            'issued_at' => now(),
            'expires_at' => now()->addYear(),
        ];
    }
}
