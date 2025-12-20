<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecentView extends Model
{
    use HasFactory;

    /**
     * Table columns:
     * - customer_id (nullable for guest)
     * - session_token (nullable for authenticated)
     * - product_id
     * - viewed_at
     */
    protected $fillable = [
        'customer_id',
        'session_token',
        'product_id',
        'viewed_at',
    ];

    protected $casts = [
        'customer_id' => 'integer',
        'product_id' => 'integer',
        'viewed_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
