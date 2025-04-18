<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVideo extends Model
{
    /** @use HasFactory<\Database\Factories\ProductVideoFactory> */
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

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function videoProvider(): BelongsTo
    {
        return $this->belongsTo(VideoProvider::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc');
    }
}
