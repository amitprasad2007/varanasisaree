<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\PostCategory;
use App\Models\Customer;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PostSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a customer for blog posts (using first customer or system)
        $customer = Customer::first();
        $customerId = $customer ? $customer->id : null;

        // Get categories
        $heritageCategory = PostCategory::where('slug', 'heritage')->first();
        $fashionCategory = PostCategory::where('slug', 'fashion')->first();
        $craftsmanshipCategory = PostCategory::where('slug', 'craftsmanship')->first();

        $posts = [
            [
                'title' => 'The Art of Banarasi Silk Weaving',
                'slug' => 'art-of-banarasi-silk-weaving',
                'excerpt' => 'Discover the intricate craftsmanship and rich history behind Varanasi\'s legendary silk weaving tradition.',
                'content' => '<p>The art of Banarasi silk weaving is a centuries-old tradition that has been passed down through generations of skilled artisans in Varanasi. This ancient craft combines intricate patterns, vibrant colors, and exquisite techniques to create some of the most beautiful textiles in the world.</p>

<p>Each Banarasi saree is a masterpiece that takes weeks or even months to complete. The weavers use traditional handlooms and follow time-honored techniques that have remained largely unchanged for hundreds of years. The result is a fabric that is not just clothing, but a work of art that tells a story of heritage, culture, and unparalleled craftsmanship.</p>

<p>The distinctive feature of Banarasi silk is its rich gold and silver brocade work, known as "zari." This metallic thread is woven into intricate patterns inspired by Mughal art, creating designs that shimmer and shine with every movement. From delicate floral motifs to elaborate paisley patterns, each design carries its own significance and beauty.</p>

<p>Today, Banarasi silk remains one of India\'s most treasured textile traditions, worn during weddings, festivals, and special occasions. By choosing a Banarasi saree, you\'re not just wearing a garment – you\'re wearing history, art, and the dreams of the artisans who created it.</p>',
                'featured_image' => 'https://images.pexels.com/photos/6192554/pexels-photo-6192554.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'fallback_image' => 'https://images.pexels.com/photos/7522701/pexels-photo-7522701.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'customer_id' => $customerId,
                'author_name' => 'Samar Silk Palace Team',
                'category_id' => $heritageCategory ? $heritageCategory->id : null,
                'status' => 'published',
                'published_at' => Carbon::parse('2023-05-15'),
                'is_featured' => true,
                'views_count' => 156,
            ],
            [
                'title' => 'How to Style a Banarasi Saree for Modern Occasions',
                'slug' => 'how-to-style-banarasi-saree-modern-occasions',
                'excerpt' => 'Learn contemporary styling tips to make your traditional Banarasi saree perfect for any modern event.',
                'content' => '<p>Banarasi sarees are timeless classics, but that doesn\'t mean they can\'t be styled for modern occasions. Whether you\'re attending a wedding, a festive celebration, or a formal event, here are some tips to style your Banarasi saree with contemporary flair.</p>

<h3>1. Play with Draping Styles</h3>
<p>Try modern draping styles like the butterfly drape, dhoti style, or the contemporary pant saree look. These innovative draping techniques give traditional sarees a fresh, modern twist while maintaining their elegance.</p>

<h3>2. Mix Traditional and Contemporary Blouses</h3>
<p>Pair your Banarasi saree with a contrasting contemporary blouse. Consider trendy designs like off-shoulder, cape sleeves, or halter necks. A well-chosen blouse can completely transform the look of your saree.</p>

<h3>3. Accessorize Wisely</h3>
<p>While traditional jewelry is beautiful, don\'t be afraid to mix in modern accessories. Statement earrings, minimalist necklaces, or contemporary clutches can add a modern edge to your traditional attire.</p>

<h3>4. Experiment with Makeup and Hairstyle</h3>
<p>Balance the richness of your Banarasi saree with contemporary makeup and hairstyles. A sleek bun, loose waves, or a modern updo can complement the traditional saree beautifully.</p>

<p>Remember, the key to styling a Banarasi saree for modern occasions is to find the perfect balance between tradition and contemporary fashion. Be confident, be creative, and most importantly, be yourself!</p>',
                'featured_image' => 'https://images.pexels.com/photos/8442949/pexels-photo-8442949.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'fallback_image' => 'https://images.pexels.com/photos/7869083/pexels-photo-7869083.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'customer_id' => $customerId,
                'author_name' => 'Priya Sharma',
                'category_id' => $fashionCategory ? $fashionCategory->id : null,
                'status' => 'published',
                'published_at' => Carbon::parse('2023-06-20'),
                'is_featured' => true,
                'views_count' => 234,
            ],
            [
                'title' => 'Preserving Tradition: The Lives of Banarasi Weavers',
                'slug' => 'preserving-tradition-lives-of-banarasi-weavers',
                'excerpt' => 'Meet the master artisans keeping the ancient art of Banarasi weaving alive through their dedication and skill.',
                'content' => '<p>Behind every exquisite Banarasi saree lies the story of skilled artisans who dedicate their lives to preserving this ancient craft. In the narrow lanes of Varanasi, generations of weaver families continue to practice the art of Banarasi silk weaving, keeping alive a tradition that spans centuries.</p>

<p>These master weavers begin learning their craft at a young age, often starting as apprentices in their family workshops. It takes years of practice to master the intricate techniques required to create the complex patterns and designs that make Banarasi silk so distinctive.</p>

<h3>The Weaving Process</h3>
<p>Creating a Banarasi saree is a labor-intensive process that requires immense skill and patience. The weaver must first prepare the loom, setting up thousands of threads in precise patterns. Each thread must be carefully positioned to ensure the final design emerges correctly.</p>

<p>The actual weaving can take anywhere from 15 days to 6 months, depending on the complexity of the design. Throughout this time, the weaver works with unwavering focus and dedication, creating each intricate pattern thread by thread.</p>

<h3>Challenges and Hope</h3>
<p>Despite the beauty of their craft, Banarasi weavers face numerous challenges in the modern era. Competition from power looms and changing market demands have put pressure on traditional handloom weavers. However, there is hope.</p>

<p>Organizations and conscious consumers are increasingly recognizing the value of authentic, handwoven Banarasi silk. By choosing handloom products, we not only get superior quality textiles but also support these artisan families and help preserve an invaluable cultural heritage.</p>

<p>When you wear a Banarasi saree, you\'re not just wearing a beautiful garment – you\'re wearing the dreams, skills, and heritage of these dedicated artisans. You\'re helping to ensure that this magnificent tradition continues for generations to come.</p>',
                'featured_image' => 'https://images.pexels.com/photos/5699821/pexels-photo-5699821.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'fallback_image' => 'https://images.pexels.com/photos/6567607/pexels-photo-6567607.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
                'customer_id' => $customerId,
                'author_name' => 'Raj Malhotra',
                'category_id' => $craftsmanshipCategory ? $craftsmanshipCategory->id : null,
                'status' => 'published',
                'published_at' => Carbon::parse('2023-07-10'),
                'is_featured' => true,
                'views_count' => 189,
            ],
        ];

        foreach ($posts as $post) {
            Post::create($post);
        }
    }
}
