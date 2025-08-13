<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'barcode',
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
        return $this->hasMany(ImageProduct::class);
    }

    public function specifications(): HasMany
    {
        return $this->hasMany(ProductSpecification::class);
    }

    public function videos(): HasMany
    {
        return $this->hasMany(ProductVideo::class)->orderBy('display_order');
    }

    public function primaryImage(): HasMany
    {
        return $this->hasMany(ImageProduct::class)->where('is_primary', true);
    }

    public function featuredVideo(): HasMany
    {
        return $this->hasMany(ProductVideo::class)->where('is_featured', true);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }
    public function colors(): HasMany
    {
        return $this->hasMany(Color::class);
    }
    public function sizes(): HasMany
    {
        return $this->hasMany(Size::class);
    }

    /**
     * Resolve image paths for API consumers with fallback order:
     * 1) Product imageproducts
     * 2) Product variants' image_path
     * 3) Product variant images' image_path
     */
    public function resolveImagePaths(): Collection
    {
        $productImages = $this->imageproducts ?? collect();
        if ($productImages->isNotEmpty()) {
            return $productImages->pluck('image_path')->filter()->values();
        }

        $variants = $this->variants ?? collect();

        $variantImagePaths = $variants->pluck('image_path')->filter()->values();
        if ($variantImagePaths->isNotEmpty()) {
            return $variantImagePaths;
        }

        $variantImages = $variants->flatMap(function ($variant) {
            return ($variant->images ?? collect());
        });

        return $variantImages->pluck('image_path')->filter()->unique()->values();
    }
}
