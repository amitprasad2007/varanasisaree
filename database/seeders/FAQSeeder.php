<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class FAQSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Do you ship internationally?',
                'answer' => 'Yes, we ship worldwide! International shipping costs and delivery times vary by location. Please contact us at samar@samarsilkpalace.com for a customized shipping quote.',
                'order' => 1,
                'status' => 'active',
            ],
            [
                'question' => 'Can I request a custom saree design?',
                'answer' => 'Absolutely! We specialize in custom orders. Share your requirements, and our artisans will create a unique piece tailored to your preferences. Custom orders typically take 4-6 weeks to complete.',
                'order' => 2,
                'status' => 'active',
            ],
            [
                'question' => 'What is your return policy?',
                'answer' => 'We offer a 30-day return policy for unused products with original tags. Items must be in their original condition. Custom-made products are not eligible for returns unless there is a manufacturing defect.',
                'order' => 3,
                'status' => 'active',
            ],
            [
                'question' => 'How do I care for my Banarasi saree?',
                'answer' => 'Dry clean only for best results. Store in a cool, dry place away from direct sunlight. For lighter cleaning, you can gently hand wash with mild detergent in cold water. Avoid wringing or twisting the fabric.',
                'order' => 4,
                'status' => 'active',
            ],
            [
                'question' => 'Do you offer virtual consultations?',
                'answer' => 'Yes! Schedule a video call with our team to view products in detail, get styling advice, and discuss custom orders. Contact us at +91 93056 26874 to book an appointment.',
                'order' => 5,
                'status' => 'active',
            ],
            [
                'question' => 'How long does it take to complete a custom order?',
                'answer' => 'Custom orders typically take 4-6 weeks from design approval to completion. The timeframe may vary depending on the complexity of the design and current workload. We\'ll keep you updated throughout the process.',
                'order' => 6,
                'status' => 'active',
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::create($faq);
        }
    }
}
