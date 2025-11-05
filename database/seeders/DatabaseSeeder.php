<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\CollectionTypeSeeder;
use Database\Seeders\CollectionSeeder;
use Database\Seeders\CompanyInfoSeeder;
use Database\Seeders\FAQSeeder;
use Database\Seeders\AboutusSeeder;
use Database\Seeders\PageSeeder;
use Database\Seeders\PostCategorySeeder;
use Database\Seeders\PostSeeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            // CollectionTypeSeeder::class,
            // CollectionSeeder::class,
            // CompanyInfoSeeder::class,
            //FAQSeeder::class,
            //AboutusSeeder::class,
           // PageSeeder::class,
             // PostCategorySeeder::class,
           // PostSeeder::class,

        ]);
    }
}
