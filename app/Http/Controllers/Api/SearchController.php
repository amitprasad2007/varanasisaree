<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\Post;
use App\Models\Aboutus;

class SearchController extends Controller
{
	public function suggestions(Request $request ){
		$query = trim((string) $request->get('q'));
		$limitPerType = (int) ($request->get('limit') ?? 5);
		$limitPerType = max(1, min($limitPerType, 10));

		if ($query === '') {
			return response()->json([]);
		}

		// Products
		$products = Product::query()
			->where('status', 'active')
			->where('name', 'like', "%{$query}%")
			->select(['id', 'name as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'product',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Top-level categories
		$categories = Category::query()
			->where('status', 'active')
			->whereNull('parent_id')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'category',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Collections (treat subcategories as collections)
		$collections = Category::query()
			->where('status', 'active')
			->whereNotNull('parent_id')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'collection',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});

		// Pages (About us + Blog posts titles)
		$pages = collect();
		$aboutPages = Aboutus::query()
			->where('status', 'active')
			->where('page_title', 'like', "%{$query}%")
			->select(['id', 'page_title'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'page',
					'label' => (string) $row->page_title,
					'slug' => 'about-us',
				];
			});
		$pages = $pages->concat($aboutPages);

		$postPages = Post::query()
			->where('status', 'published')
			->where('title', 'like', "%{$query}%")
			->select(['id', 'title as label', 'slug'])
			->limit($limitPerType)
			->get()
			->map(function ($row) {
				return [
					'id' => $row->id,
					'type' => 'page',
					'label' => (string) $row->label,
					'slug' => (string) $row->slug,
				];
			});
		$pages = $pages->concat($postPages)->take($limitPerType);

		$suggestions = $products
			->concat($categories)
			->concat($collections)
			->concat($pages)
			->values();

		return response()->json($suggestions);
	}
}
