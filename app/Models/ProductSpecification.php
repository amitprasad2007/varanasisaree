<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSpecification extends Model
{
    /** @use HasFactory<\Database\Factories\ProductSpecificationFactory> */

    use HasFactory;

    protected $fillable = [
        'product_id',
        'name',
        'value',
    ];


    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
