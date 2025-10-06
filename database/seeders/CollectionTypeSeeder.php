<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\CollectionType;

class CollectionTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            'Season', 'Occasion', 'Style', 'Trend'
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


