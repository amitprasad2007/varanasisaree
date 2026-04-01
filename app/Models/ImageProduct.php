<?php

namespace App\Models;

use Database\Factories\ImageProductFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImageProduct extends Model
{
    /** @use HasFactory<ImageProductFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'image_variant_id',
        'image_path',
        'alt_text',
        'is_primary',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function imageVariant(): BelongsTo
    {
        return $this->belongsTo(ImageVariant::class);
    }
}
