<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CreditNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'sale_return_id',
        'amount',
        'reference',
        'status',
        'customer_id',
        'order_id',
        'refund_id',
        'issued_at',
        'expires_at',
        'notes',
        'used_amount',
        'remaining_amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'used_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'issued_at' => 'date',
        'expires_at' => 'date',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Get the source transaction (sale or order)
     */
    public function getSourceTransactionAttribute()
    {
        return $this->sale ?? $this->order;
    }

    /**
     * Get the customer from source transaction
     */
    public function getSourceCustomerAttribute()
    {
        if ($this->customer) {
            return $this->customer;
        }

        if ($this->sale) {
            return $this->sale->customer;
        }

        if ($this->order) {
            return $this->order->customer;
        }

        return null;
    }

    /**
     * Check if credit note is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' &&
               ($this->expires_at === null || $this->expires_at >= now()->toDateString()) &&
               $this->remaining_amount > 0;
    }

    /**
     * Check if credit note is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at < now()->toDateString();
    }

    /**
     * Use credit note amount
     */
    public function useAmount(float $amount): bool
    {
        if ($this->remaining_amount < $amount) {
            return false;
        }

        $this->used_amount += $amount;
        $this->remaining_amount -= $amount;

        if ($this->remaining_amount <= 0) {
            $this->status = 'used';
        }

        return $this->save();
    }

    /**
     * Scope for active credit notes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>=', now()->toDateString());
                    });
    }

    /**
     * Scope for expired credit notes
     */
    public function scopeExpired($query)
    {
        return $query->where('expires_at', '<', now()->toDateString());
    }
}
