<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\PostCategory;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $posts = Post::with('category')->latest()->paginate(15);

        return Inertia::render('Admin/Posts/Index', [
            'posts' => $posts
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = PostCategory::where('status', 'active')->get();

        return Inertia::render('Admin/Posts/Create', [
            'categories' => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePostRequest $request)
    {
        $validated = $request->validated();

        // Generate slug from title if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        } else {
            $validated['slug'] = Str::slug($validated['slug']);
        }

        // Make slug unique
        $originalSlug = $validated['slug'];
        $count = 1;
        while (Post::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $count;
            $count++;
        }

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('posts', 'public');
            $validated['featured_image'] = $path;
        }

        // Handle fallback image upload
        if ($request->hasFile('fallback_image')) {
            $path = $request->file('fallback_image')->store('posts', 'public');
            $validated['fallback_image'] = $path;
        }

        // Set default status if not provided
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['is_featured'] = $validated['is_featured'] ?? false;
        $validated['published_at'] = $validated['status'] === 'published' ? now() : null;

        Post::create($validated);

        return redirect()->route('posts.index')->with('success', 'Blog post created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Post $post)
    {
        $post->load('category');

        return Inertia::render('Admin/Posts/Show', [
            'post' => $post
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Post $post)
    {
        $categories = PostCategory::where('status', 'active')->get();

        return Inertia::render('Admin/Posts/Edit', [
            'post' => $post->load('category'),
            'categories' => $categories
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePostRequest $request, Post $post)
    {
        $validated = $request->validated();

        // Generate slug from title if changed
        if (isset($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['slug']);

            // Make slug unique (excluding current post)
            $originalSlug = $validated['slug'];
            $count = 1;
            while (Post::where('slug', $validated['slug'])->where('id', '!=', $post->id)->exists()) {
                $validated['slug'] = $originalSlug . '-' . $count;
                $count++;
            }
        }

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            if ($post->featured_image) {
                Storage::disk('public')->delete($post->featured_image);
            }
            $path = $request->file('featured_image')->store('posts', 'public');
            $validated['featured_image'] = $path;
        } else {
            unset($validated['featured_image']);
        }

        // Handle fallback image upload
        if ($request->hasFile('fallback_image')) {
            if ($post->fallback_image) {
                Storage::disk('public')->delete($post->fallback_image);
            }
            $path = $request->file('fallback_image')->store('posts', 'public');
            $validated['fallback_image'] = $path;
        } else {
            unset($validated['fallback_image']);
        }

        // Update published_at if status changed to published
        if (isset($validated['status']) && $validated['status'] === 'published' && !$post->published_at) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return redirect()->route('posts.index')->with('success', 'Blog post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        // Delete associated images
        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }
        if ($post->fallback_image) {
            Storage::disk('public')->delete($post->fallback_image);
        }

        $post->delete();

        return redirect()->route('posts.index')->with('success', 'Blog post deleted successfully.');
    }
}
