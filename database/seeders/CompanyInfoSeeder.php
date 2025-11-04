<?php

namespace Database\Seeders;

use App\Models\CompanyInfo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CompanyInfoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CompanyInfo::create([
            'company_name' => 'Samar Silk Palace',
            'gst_number' => '09AEWPF0981M1ZR',
            'address' => 'N 12/381 - C BAJARDIHA DEV-POKHRI',
            'city' => 'Varanasi',
            'state' => 'Uttar Pradesh',
            'country' => 'India',
            'postal_code' => '221109',
            'phone' => '+91 93056 26874',
            'email' => 'samar@samarsilkpalace.com',
            'support_email' => 'samar@samarsilkpalace.com',
            'facebook_url' => 'https://www.facebook.com/samarsilkpalace',
            'instagram_url' => 'https://www.instagram.com/samarsilkpalace',
            'youtube_url' => 'https://www.youtube.com/@samarsilkpalace',
            'twitter_url' => null,
            'linkedin_url' => null,
            'whatsapp_number' => '+919305626874',
            'about_text' => 'Since 1985, we have been crafting exquisite Banarasi sarees and textiles that blend traditional artistry with contemporary elegance. Each piece represents the dedication of over 200+ artisan families who pour their skill and passion into every thread.',
            'founded_year' => '1985',
            'business_hours' => 'Monday - Saturday: 10:00 AM - 6:00 PM IST',
            'logo_url' => null,
            'additional_data' => [
                'artisan_families' => '200+',
                'specialty' => 'Handcrafted Banarasi Sarees and Textiles',
                'established' => '1985',
            ],
        ]);
    }
}
