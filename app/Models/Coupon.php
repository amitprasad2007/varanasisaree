<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    /** @use HasFactory<\Database\Factories\CouponFactory> */
    use HasFactory;
    protected $fillable = ['code', 'type', 'value', 'min_spend', 'max_discount', 'usage_limit', 'used_count', 'expires_at', 'status'];

    protected $casts = [
        'expires_at' => 'datetime',
    ];
}
