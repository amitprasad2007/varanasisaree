<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id', 'vendor_id', 'invoice_number', 'status', 'subtotal', 'discount_type', 'discount_value', 'tax_percent', 'tax_amount', 'total', 'paid_total', 'payment_status', 'payment_method', 'payment_details', 'payment_date', 'payment_amount', 'refunded_amount', 'refund_status', 'last_refund_at'
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(SalePayment::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(SaleReturn::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function creditNotes(): HasMany
    {
        return $this->hasMany(CreditNote::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    /**
     * Check if sale is eligible for refunds
     */
    public function isEligibleForRefund(): bool
    {
        return $this->status === 'completed' && 
               $this->refund_status !== 'full' &&
               $this->refunded_amount < $this->total;
    }

    /**
     * Get maximum refundable amount
     */
    public function getMaxRefundableAmount(): float
    {
        return max(0, $this->total - $this->refunded_amount);
    }

    /**
     * Scope for sales with no refunds
     */
    public function scopeNoRefunds($query)
    {
        return $query->where('refund_status', 'none');
    }

    /**
     * Scope for partially refunded sales
     */
    public function scopePartiallyRefunded($query)
    {
        return $query->where('refund_status', 'partial');
    }

    /**
     * Scope for fully refunded sales
     */
    public function scopeFullyRefunded($query)
    {
        return $query->where('refund_status', 'full');
    }

    /**
     * Scope by vendor
     */
    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }
}


