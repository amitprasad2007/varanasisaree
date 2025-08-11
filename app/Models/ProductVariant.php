<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariant extends Model
{
    /** @use HasFactory<\Database\Factories\ProductVariantFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color_id',
        'size_id',
        'sku',
        'barcode',
        'price',
        'discount',
        'stock_quantity',
        'image_path',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'stock_quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class);
    }

    public function size(): BelongsTo
    {
        return $this->belongsTo(Size::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductVariantImage::class)->orderBy('display_order');
    }

    public function primaryImage()
    {
        return $this->hasMany(ProductVariantImage::class)->where('is_primary', true)->first();
    }


    public function getFinalPriceAttribute()
    {
        return $this->price - ($this->price * $this->discount / 100);
    }
}
