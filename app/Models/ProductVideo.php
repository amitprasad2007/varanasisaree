<?php

namespace App\Models;

use Database\Factories\ProductVideoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVideo extends Model
{
    /** @use HasFactory<ProductVideoFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'video_provider_id',
        'title',
        'video_id',
        'description',
        'thumbnail',
        'display_order',
        'is_featured',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function videoProvider(): BelongsTo
    {
        return $this->belongsTo(VideoProvider::class);
    }

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered($query): Builder
    {
        return $query->orderBy('display_order', 'asc');
    }
}
