<?php

namespace App\Models;

use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'value',
        'min_spend',
        'max_discount',
        'usage_limit',
        'used_count',
        'expires_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'min_spend' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'value' => 'decimal:2',
            'status' => 'boolean',
            'expires_at' => 'datetime',
        ];
    }

    public function scopeActive($query): Builder
    {
        return $query->where('status', true);
    }

    public function isExpired(): bool
    {
        if (! $this->expires_at) {
            return false;
        }

        return now()->gt($this->expires_at);
    }

    public function isUsageLimitReached(): bool
    {
        if (! $this->usage_limit) {
            return false;
        }

        return $this->used_count >= $this->usage_limit;
    }

    public function isValid(): bool
    {
        return $this->status && ! $this->isExpired() && ! $this->isUsageLimitReached();
    }
}
