<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductReview extends Model
{
    /** @use HasFactory<\Database\Factories\ProductReviewFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'product_id',
        'product_variant_id',
        'review',
        'rating',
        'status',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the product slug through the product relationship
     */
    public function getProductSlugAttribute(): string
    {
        return $this->product->slug ?? '';
    }

    /**
     * Get the review text (alias for review field)
     */
    public function getReviewTextAttribute(): string
    {
        return $this->review ?? '';
    }

    /**
     * Get the user ID (alias for customer_id field)
     */
    public function getUserIdAttribute(): int
    {
        return $this->customer_id;
    }
}
