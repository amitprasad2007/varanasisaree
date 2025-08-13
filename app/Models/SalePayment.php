<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'sale_id', 'method', 'amount', 'reference', 'status', 'payment_date', 'payment_details'];

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
}


