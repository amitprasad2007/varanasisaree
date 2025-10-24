<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class CreditNote extends Model
{
    use HasFactory;
    protected $fillable = [
        'sale_id', 'sale_return_id', 'amount', 'reference', 'status'
    ];
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }
    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }
}
