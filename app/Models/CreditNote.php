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
        'refund_id',
        'order_id',
        'customer_id',
        'vendor_id',
        'credit_note_number',
        'amount',
        'used_amount',
        'remaining_amount',
        'reference',
        'status',
        'issued_at',
        'expires_at',
        'expiry_date',
        'notes',
    ];

    protected $casts = [
        'issued_at' => 'date',
        'expires_at' => 'date',
        'expiry_date' => 'date',
    ];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Check if credit note is valid for use
     */
    public function isValidForUse(): bool
    {
        return $this->status === 'active' &&
               $this->remaining_amount > 0 &&
               (!$this->expires_at || $this->expires_at->isFuture());
    }

    /**
     * Check if credit note belongs to vendor
     */
    public function belongsToVendor($vendorId): bool
    {
        return $this->vendor_id === $vendorId;
    }

    /**
     * Apply credit note to a payment
     */
    public function applyCredit(float $amount): float
    {
        $appliedAmount = min($this->remaining_amount, $amount);
        
        $this->used_amount = ($this->used_amount ?? 0) + $appliedAmount;
        $this->remaining_amount -= $appliedAmount;
        
        if ($this->remaining_amount <= 0.001) {
            $this->status = 'used';
            $this->remaining_amount = 0;
        }
        
        $this->save();
        
        return $appliedAmount;
    }

    /**
     * Scope for active credit notes
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope for vendor-specific credit notes
     */
    public function scopeByVendor($query, $vendorId)
    {
        return $query->where('vendor_id', $vendorId);
    }

    /**
     * Scope for customer-specific credit notes
     */
    public function scopeByCustomer($query, $customerId)
    {
        return $query->where('customer_id', $customerId);
    }

    /**
     * Scope for usable credit notes
     */
    public function scopeUsable($query)
    {
        return $query->where('status', 'active')
                    ->where('remaining_amount', '>', 0)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }
}
