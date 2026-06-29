<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftItem extends Model
{
    protected $fillable = [
        'product_variant_id',
        'product_id',
        'product_type',
        'offer_type',
        'offered_price',
        'status',
        'start_date',
        'end_date',
        'min_spend',
        'min_quantity',
        'eligibility_text',
    ];

    protected function casts(): array
    {
        return [
            'offered_price' => 'decimal:2',
            'min_spend' => 'decimal:2',
            'min_quantity' => 'integer',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
        ];
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    public function giftProduct(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function giftVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_id');
    }

    /**
     * Get resolved name for the gift.
     */
    public function getGiftNameAttribute(): string
    {
        if ($this->product_type === 'variant') {
            $variant = $this->giftVariant()->with(['product', 'color', 'size'])->first();
            if ($variant) {
                $name = $variant->product?->name;
                $color = $variant->color?->name;
                $size = $variant->size?->name;
                $parts = array_filter([$color, $size]);

                return $name.($parts ? ' ('.implode(' / ', $parts).')' : '');
            }
        } else {
            $product = $this->giftProduct()->first();
            if ($product) {
                return $product->name;
            }
        }

        return 'Unknown Gift';
    }

    /**
     * Get resolved image path for the gift.
     */
    public function getGiftImageAttribute(): ?string
    {
        if ($this->product_type === 'variant') {
            $variant = $this->giftVariant()->first();
            if ($variant) {
                if ($variant->image_path) {
                    return asset('storage/'.$variant->image_path);
                }
                // fallback to product primary image
                $product = $variant->product()->with('imageproducts')->first();
                if ($product) {
                    $primary = $product->imageproducts()->where('is_primary', true)->first();
                    if ($primary) {
                        return asset('storage/'.$primary->image_path);
                    }
                }
            }
        } else {
            $product = $this->giftProduct()->with('imageproducts')->first();
            if ($product) {
                $primary = $product->imageproducts()->where('is_primary', true)->first();
                if ($primary) {
                    return asset('storage/'.$primary->image_path);
                }
                // or first image
                $first = $product->imageproducts()->first();
                if ($first) {
                    return asset('storage/'.$first->image_path);
                }
            }
        }

        return null;
    }

    /**
     * Get original price of the gift product or variant.
     */
    public function getGiftOriginalPriceAttribute(): float
    {
        if ($this->product_type === 'variant') {
            $variant = $this->giftVariant()->first();
            if ($variant) {
                return (float) $variant->price;
            }
        } else {
            $product = $this->giftProduct()->first();
            if ($product) {
                return (float) $product->price;
            }
        }

        return 0.00;
    }

    /**
     * Get slug of the gift product.
     */
    public function getGiftSlugAttribute(): ?string
    {
        if ($this->product_type === 'variant') {
            $variant = $this->giftVariant()->with('product')->first();
            if ($variant && $variant->product) {
                return $variant->product->slug;
            }
        } else {
            $product = $this->giftProduct()->first();
            if ($product) {
                return $product->slug;
            }
        }

        return null;
    }
}
