<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    /** @use HasFactory<\Database\Factories\PaymentFactory> */
    use HasFactory;
    protected $fillable = ['payment_id','amount','status','method','order_id','card_id','email','contact','user_id','payment_details','rzorder_id'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order() {
        return $this->belongsTo(Order::class, 'order_id', 'order_id');
    }
}
