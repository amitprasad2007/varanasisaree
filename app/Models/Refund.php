<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class Refund extends Model
{
    use HasFactory;
    protected $fillable = [
        'sale_id', 'sale_return_id', 'credit_note_id', 'amount', 'method', 'status', 'paid_at', 'reference'
    ];
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
}
