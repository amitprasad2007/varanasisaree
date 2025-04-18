<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'category_id',
        'subcategory_id',
        'brand_id',
        'description',
        'price',
        'discount',
        'stock_quantity',
        'fabric',
        'color',
        'size',
        'work_type',
        'occasion',
        'weight',
        'is_bestseller',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'stock_quantity' => 'integer',
        'weight' => 'decimal:2',
        'is_bestseller' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function imageproducts(): HasMany
    {
        return $this->hasMany(ImageProduct::class,'product_id');
    }
    
    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(ProductVideo::class)->orderBy('display_order');
    }

    public function primaryImage()
    {
        return $this->hasMany(ImageProduct::class)->where('is_primary', true)->first();
    }

    public function featuredVideo()
    {
        return $this->hasMany(ProductVideo::class)->where('is_featured', true)->first();
    }
}
