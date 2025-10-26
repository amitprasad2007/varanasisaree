<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefundItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'refund_id',
        'sale_return_item_id',
        'order_item_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'unit_price',
        'total_amount',
        'status',
        'reason',
        'qc_status',
        'qc_notes',
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
    ];

    public function refund(): BelongsTo
    {
        return $this->belongsTo(Refund::class);
    }

    public function saleReturnItem(): BelongsTo
    {
        return $this->belongsTo(SaleReturnItem::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productVariant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class);
    }

    /**
     * Get the source item (sale return item or order item)
     */
    public function getSourceItemAttribute()
    {
        return $this->saleReturnItem ?? $this->orderItem;
    }

    /**
     * Scope for pending items
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for approved items
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope for QC passed items
     */
    public function scopeQcPassed($query)
    {
        return $query->where('qc_status', 'passed');
    }

    /**
     * Scope for QC failed items
     */
    public function scopeQcFailed($query)
    {
        return $query->where('qc_status', 'failed');
    }
}
