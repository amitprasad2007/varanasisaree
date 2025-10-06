<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Collection;
use App\Models\CollectionType;

class CollectionSeeder extends Seeder
{
    public function run(): void
    {
        $map = [
            'Season' => [
                'Summer Collection', 'Monsoon Collection', 'Winter Collection', 'Spring Collection',
            ],
            'Occasion' => [
                'Wedding Collection', 'Festive Collection', 'Party Wear',
            ],
            'Style' => [
                'Ethnic Wear', 'Contemporary Classics', 'Heritage Weaves',
            ],
            'Trend' => [
                'Pastel Perfection', 'Royal Banarasi', 'Festival Edit',
            ],
        ];

        foreach ($map as $typeName => $collections) {
            $type = CollectionType::where('name', $typeName)->first();
            if (!$type) continue;

            foreach ($collections as $index => $name) {
                Collection::updateOrCreate(
                    ['slug' => Str::slug($name)],
                    [
                        'collection_type_id' => $type->id,
                        'name' => $name,
                        'description' => null,
                        'sort_order' => $index,
                        'is_active' => true,
                    ]
                );
            }
        }
    }
}


