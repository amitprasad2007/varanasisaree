<?php

namespace App\Models;

use Database\Factories\ProductRatingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductRating extends Model
{
    /** @use HasFactory<ProductRatingFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'customer_id',
        'rating',
        'review_id',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function review(): BelongsTo
    {
        return $this->belongsTo(ProductReview::class);
    }
}
