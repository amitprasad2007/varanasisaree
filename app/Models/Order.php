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
        return $this->hasOne(Payment::class,'order_id','order_number');
    }
}
