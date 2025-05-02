<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

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
        'user_id',
        'address_id',
        'sub_total',
        'quantity',
        'total_amount',
        'coupon',
        'payment_method',
        'payment_status',
        'status',
    ];

    /**
     * Get the user that owns the order.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the address associated with the order.
     */
    public function address()
    {
        return $this->belongsTo(AddressUser::class, 'address_id');
    }

    /**
     * Get the cart items for the order.
     */
    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function orderItems() {
        return $this->hasMany(OrderItem::class);
    }

    public function vendor() {
        return $this->belongsTo(Vendor::class);
    }

    public function warehouse() {
        return $this->belongsTo(Warehouse::class);
    }
}
