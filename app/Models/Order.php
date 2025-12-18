<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'order_id',
        'customer_id',
        'address_id',
        'sub_total',
        'vendor_id',
        'quantity',
        'total_amount',
        'coupon',
        'payment_method',
        'payment_status',
        'payment_details',
        'status',
        'awb_number',
        'tracking_number',
        'shipped_at',
        'delivered_at',
        'shipping_notes',
        'tracking_events',
        'order_priority',
        'assigned_to',
        'tax',
        'discount',
        'shipping_cost'
    ];

    /**
     * Get the user that owns the order.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the address associated with the order.
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(AddressUser::class, 'address_id');
    }

    /**
     * Get the cart items for the order.
     */
    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    /**
     * Get the product items for the order.
     */
    public function productItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    // public function warehouse(): BelongsTo
    // {
    //     return $this->belongsTo(Warehouse::class);
    // }

    public function payment(): HasOne
    {
        // Link payments.order_id (business order identifier) to orders.order_id
        return $this->hasOne(Payment::class, 'order_id', 'order_id');
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class, 'order_id','order_id');
    }

    protected $casts = [
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
        'tracking_events' => 'array',
    ];

    /**
     * Update order status and log the change
     */
    public function updateStatus(string $newStatus, ?string $notes = null, ?int $changedBy = null): void
    {
        $oldStatus = $this->status;

        $this->update(['status' => $newStatus]);

        // Log the status change
        $this->statusLogs()->create([
            'status_from' => $oldStatus,
            'status_to' => $newStatus,
            'notes' => $notes,
            'changed_by' => $changedBy,
            'changed_at' => now(),
        ]);

        // Update timestamps based on status
        if ($newStatus === 'shipped' && !$this->shipped_at) {
            $this->update(['shipped_at' => now()]);
        } elseif ($newStatus === 'delivered' && !$this->delivered_at) {
            $this->update(['delivered_at' => now()]);
        }
    }

    /**
     * Generate AWB number
     */
    public function generateAwbNumber(): string
    {
        $prefix = 'AWB';
        $timestamp = now()->format('Ymd');
        $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        return $prefix . $timestamp . $random;
    }

    /**
     * Assign AWB number to order
     */
    public function assignAwbNumber(): string
    {
        $awbNumber = $this->generateAwbNumber();
        $this->update(['awb_number' => $awbNumber]);
        return $awbNumber;
    }
}
