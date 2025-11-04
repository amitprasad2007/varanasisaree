<?php

namespace Database\Seeders;

use App\Models\PostCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PostCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Heritage',
            'Fashion',
            'Craftsmanship',
            'Culture',
            'Trends',
        ];

        foreach ($categories as $category) {
            PostCategory::create([
                'name' => $category,
                'slug' => Str::slug($category),
            ]);
        }
    }
}
