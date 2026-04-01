<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShipmentStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'shipment_id',
        'status_from',
        'status_to',
        'notes',
        'changed_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    /**
     * Get the shipment that owns the status log
     */
    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }
}
