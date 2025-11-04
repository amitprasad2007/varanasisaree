<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BlogPostController extends Controller
{
    /**
     * Display a listing of blog posts
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        try {
            $query = Post::with(['category', 'customer'])
                ->where('status', 'published');

            // Filter by category
            if ($request->has('category')) {
                $query->whereHas('category', function ($q) use ($request) {
                    $q->where('slug', $request->category);
                });
            }

            // Filter by featured
            if ($request->has('featured')) {
                $query->where('is_featured', true);
            }

            // Search
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('content', 'like', "%{$search}%")
                        ->orWhere('excerpt', 'like', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 12);
            $posts = $query->orderBy('published_at', 'desc')
                ->paginate($perPage);

            // Format response
            $formattedPosts = $posts->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'content' => $post->content,
                    'image' => $post->featured_image,
                    'fallbackImage' => $post->fallback_image,
                    'date' => $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y'),
                    'category' => $post->category ? $post->category->name : null,
                    'author' => $post->author_name ?? ($post->customer ? $post->customer->name : 'Admin'),
                    'views' => $post->views_count,
                    'is_featured' => $post->is_featured,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedPosts,
                'pagination' => [
                    'current_page' => $posts->currentPage(),
                    'last_page' => $posts->lastPage(),
                    'per_page' => $posts->perPage(),
                    'total' => $posts->total(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch blog posts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified blog post by slug
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $slug)
    {
        try {
            $post = Post::with(['category', 'customer', 'comments' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();

            // Increment views count
            $post->increment('views_count');

            // Get related posts
            $relatedPosts = Post::where('category_id', $post->category_id)
                ->where('id', '!=', $post->id)
                ->where('status', 'published')
                ->orderBy('published_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($relatedPost) {
                    return [
                        'id' => $relatedPost->id,
                        'title' => $relatedPost->title,
                        'slug' => $relatedPost->slug,
                        'excerpt' => $relatedPost->excerpt,
                        'image' => $relatedPost->featured_image,
                        'date' => $relatedPost->published_at ? $relatedPost->published_at->format('M d, Y') : $relatedPost->created_at->format('M d, Y'),
                        'category' => $relatedPost->category ? $relatedPost->category->name : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $post->id,
                    'title' => $post->title,
                    'slug' => $post->slug,
                    'excerpt' => $post->excerpt,
                    'content' => $post->content,
                    'image' => $post->featured_image,
                    'fallbackImage' => $post->fallback_image,
                    'date' => $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y'),
                    'category' => $post->category ? [
                        'id' => $post->category->id,
                        'name' => $post->category->name,
                        'slug' => $post->category->slug,
                    ] : null,
                    'author' => $post->author_name ?? ($post->customer ? $post->customer->name : 'Admin'),
                    'views' => $post->views_count,
                    'is_featured' => $post->is_featured,
                    'comments_count' => $post->comments->count(),
                    'related_posts' => $relatedPosts,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Blog post not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Get featured blog posts for homepage
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function featured()
    {
        try {
            $posts = Post::with(['category'])
                ->where('status', 'published')
                ->where('is_featured', true)
                ->orderBy('published_at', 'desc')
                ->limit(3)
                ->get()
                ->map(function ($post) {
                    return [
                        'id' => $post->id,
                        'title' => $post->title,
                        'slug' => $post->slug,
                        'excerpt' => $post->excerpt,
                        'image' => $post->featured_image,
                        'fallbackImage' => $post->fallback_image,
                        'date' => $post->published_at ? $post->published_at->format('M d, Y') : $post->created_at->format('M d, Y'),
                        'category' => $post->category ? $post->category->name : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $posts,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured posts',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get blog categories
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories()
    {
        try {
            $categories = PostCategory::withCount(['posts' => function ($query) {
                $query->where('status', 'published');
            }])
                ->orderBy('name')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'posts_count' => $category->posts_count,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $categories,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch categories',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
