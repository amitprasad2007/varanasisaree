<?php

namespace Database\Seeders;

use App\Models\Aboutus;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AboutusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $aboutus = Aboutus::create([
            'page_title' => 'About Siyabling',
            'description' => 'Welcome to our story...',
            'image' => 'aboutus.jpg',
            'status' => 'active'
        ]);

        AboutUsSection::insert([
            ['aboutus_id' => $aboutus->id, 'section_title' => 'Brief Story', 'section_content' => 'Our journey started...', 'order' => 1, 'status' => 'active'],
            ['aboutus_id' => $aboutus->id, 'section_title' => 'Mission & Values', 'section_content' => 'We believe in...', 'order' => 2, 'status' => 'active'],
            ['aboutus_id' => $aboutus->id, 'section_title' => 'Skills & Craftsmanship', 'section_content' => 'Our expertise lies in...', 'order' => 3, 'status' => 'active'],
            ['aboutus_id' => $aboutus->id, 'section_title' => 'Leadership', 'section_content' => 'Meet our leadership team...', 'image' => 'leadership.jpg', 'order' => 4, 'status' => 'active'],
        ]);
    }
}
