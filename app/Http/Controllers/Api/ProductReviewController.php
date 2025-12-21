<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductReview;
use App\Models\ProductRatings;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ProductReviewController extends Controller
{
    /**
     * Get product reviews by product slug
     */
    public function getProductReviews(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'productSlug' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product = Product::where('slug', $request->productSlug)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $reviews = ProductReview::with(['customer:id,name,email'])
                ->where('product_id', $product->id)
                ->where('status', 'approved')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'product_slug' => $review->product->slug,
                        'user_id' => $review->customer_id,
                        'rating' => $review->rating,
                        'review_text' => $review->review,
                        'created_at' => $review->created_at->toISOString(),
                        'updated_at' => $review->updated_at->toISOString(),
                        'customer_name' => $review->customer->name ?? 'Anonymous'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new product review
     */
    public function storeReview(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'productSlug' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
            'reviewText' => 'required|string|max:1000',
            'userId' => 'required|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find product by slug
            $product = Product::where('slug', $request->productSlug)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 200);
            }

            // Verify customer exists
            $customer = Customer::find($request->userId);

            if (!$customer) {
                return response()->json([
                    'success' => false,
                    'message' => 'Customer not found'
                ], 200);
            }

            // Check if customer already reviewed this product
            $existingReview = ProductReview::where('product_id', $product->id)
                ->where('customer_id', $request->userId)
                ->first();

            if ($existingReview) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product'
                ], 200);
            }

            // Create new review
            $review = ProductReview::create([
                'product_id' => $product->id,
                'customer_id' => $request->userId,
                'rating' => $request->rating,
                'review' => $request->reviewText,
                'status' => 'pending' // Reviews need approval
            ]);

            if($review){
                $rating = ProductRatings::create([
                    'product_id' => $product->id,
                    'customer_id' => $request->userId,
                    'rating' => $request->rating,
                    'review_id' => $review->id  
                ]);
            }



            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully and is pending approval',
                'data' => [
                    'id' => $review->id,
                    'product_slug' => $product->slug,
                    'user_id' => $review->customer_id,
                    'rating' => $review->rating,
                    'review_text' => $review->review,
                    'created_at' => $review->created_at->toISOString(),
                    'updated_at' => $review->updated_at->toISOString()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get review statistics for a product
     */
    public function getReviewStats(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'productSlug' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product = Product::where('slug', $request->productSlug)->first();

            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found'
                ], 404);
            }

            $approvedReviews = ProductReview::where('product_id', $product->id)
                ->where('status', 'approved');

            $totalReviews = $approvedReviews->count();
            $averageRating = $totalReviews > 0 ? $approvedReviews->avg('rating') : 0;
            $ratingDistribution = $approvedReviews->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_reviews' => $totalReviews,
                    'average_rating' => round($averageRating, 1),
                    'rating_distribution' => $ratingDistribution
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch review statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
