<?php

namespace Database\Seeders;

use App\Models\CollectionType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CollectionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Season', 'Occasion', 'Style', 'Trend',
        ];

        foreach ($types as $index => $name) {
            CollectionType::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => null,
                    'sort_order' => $index,
                    'is_active' => true,
                ]
            );
        }
    }
}
