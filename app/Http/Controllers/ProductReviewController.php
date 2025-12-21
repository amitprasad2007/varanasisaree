<?php

namespace App\Http\Controllers;

use App\Models\ProductReview;
use App\Http\Requests\StoreProductReviewRequest;
use App\Http\Requests\UpdateProductReviewRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = ProductReview::with(['customer', 'product'])->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reviews = $query->paginate(10);

        return Inertia::render('Admin/ProductReviews/Index', [
            'reviews' => $reviews
        ]);
    }

    public function approve($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->status = 'approved';
        $review->save();

        return redirect()->back()->with('success', 'Review approved successfully');
    }

    public function reject($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->status = 'rejected';
        $review->save();

        return redirect()->back()->with('success', 'Review rejected successfully');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductReviewRequest $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductReview $productReview)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductReview $productReview)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductReviewRequest $request, ProductReview $productReview)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $review = ProductReview::findOrFail($id);
        $review->delete();

        return redirect()->back()->with('success', 'Review deleted successfully');
    }
}
