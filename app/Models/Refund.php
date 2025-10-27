<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Refund extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id',
        'sale_return_id',
        'credit_note_id',
        'amount',
        'method',
        'status',
        'paid_at',
        'reference',
        'order_id',
        'customer_id',
        'processed_by',
        'refund_type',
        'reason',
        'admin_notes',
        'rejection_reason',
        'refund_details',
        'requested_at',
        'approved_at',
        'processed_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'refund_details' => 'array',
        'paid_at' => 'datetime',
        'requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    // Existing relationships
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function creditNote(): BelongsTo
    {
        return $this->belongsTo(CreditNote::class);
    }

    // New relationships for comprehensive refund system
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function refundItems(): HasMany
    {
        return $this->hasMany(RefundItem::class);
    }

    public function refundTransaction(): HasOne
    {
        return $this->hasOne(RefundTransaction::class);
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
        if ($this->sale) {
            return $this->sale->customer;
        }
        if ($this->order) {
            return $this->order->customer;
        }
        return $this->customer;
    }

    /**
     * Check if refund is eligible for processing
     */
    public function isEligibleForProcessing(): bool
    {
        return in_array($this->status, ['approved', 'processing']) &&
               !$this->isFullyProcessed();
    }

    /**
     * Check if refund is fully processed
     */
    public function isFullyProcessed(): bool
    {
        return $this->status === 'completed' || $this->paid_at !== null;
    }

    /**
     * Get refund type based on method
     */
    public function getRefundTypeAttribute(): string
    {
        if ($this->credit_note_id) {
            return 'credit_note';
        }

        if (in_array($this->method, ['bank_transfer', 'manual'])) {
            return 'money';
        }

        return $this->method ?? 'credit_note';
    }

    /**
     * Scope for pending refunds
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved refunds
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for completed refunds
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for refunds by type
     */
    public function scopeByType($query, $type)
    {
        if ($type === 'credit_note') {
            return $query->whereNotNull('credit_note_id');
        }

        if ($type === 'money') {
            return $query->whereNull('credit_note_id');
        }

        return $query;
    }
}
