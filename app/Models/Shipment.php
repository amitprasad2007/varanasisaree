<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'address_id',
        'awb_number',
        'tracking_number',
        'carrier',
        'service_type',
        'status',
        'picked_up_at',
        'in_transit_at',
        'out_for_delivery_at',
        'delivered_at',
        'failed_at',
        'returned_at',
        'shipping_notes',
        'tracking_events',
        'weight',
        'dimensions_length',
        'dimensions_width',
        'dimensions_height',
        'shipping_cost',
        'delivery_attempts',
        'delivery_notes',
        'signature_required',
        'signature_name',
        'metadata',
    ];

    protected $casts = [
        'picked_up_at' => 'datetime',
        'in_transit_at' => 'datetime',
        'out_for_delivery_at' => 'datetime',
        'delivered_at' => 'datetime',
        'failed_at' => 'datetime',
        'returned_at' => 'datetime',
        'tracking_events' => 'array',
        'metadata' => 'array',
        'signature_required' => 'boolean',
        'weight' => 'decimal:2',
        'dimensions_length' => 'decimal:2',
        'dimensions_width' => 'decimal:2',
        'dimensions_height' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'delivery_attempts' => 'integer',
    ];

    /**
     * Get the order that owns the shipment
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the shipping address
     */
    public function address(): BelongsTo
    {
        return $this->belongsTo(AddressUser::class, 'address_id');
    }

    /**
     * Get shipment status logs
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(ShipmentStatusLog::class);
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
     * Update shipment status
     */
    public function updateStatus(string $newStatus, ?string $notes = null): void
    {
        $oldStatus = $this->status;
        
        $this->update(['status' => $newStatus]);
        
        // Update timestamp based on status
        $timestampField = match($newStatus) {
            'picked_up' => 'picked_up_at',
            'in_transit' => 'in_transit_at',
            'out_for_delivery' => 'out_for_delivery_at',
            'delivered' => 'delivered_at',
            'failed' => 'failed_at',
            'returned' => 'returned_at',
            default => null
        };

        if ($timestampField && !$this->$timestampField) {
            $this->update([$timestampField => now()]);
        }

        // Log the status change
        $this->statusLogs()->create([
            'status_from' => $oldStatus,
            'status_to' => $newStatus,
            'notes' => $notes,
            'changed_at' => now(),
        ]);
    }

    /**
     * Get shipment tracking URL
     */
    public function getTrackingUrl(): ?string
    {
        if (!$this->tracking_number || !$this->carrier) {
            return null;
        }

        return match($this->carrier) {
            'Blue Dart' => "https://www.bluedart.com/track/{$this->tracking_number}",
            'FedEx' => "https://www.fedex.com/fedextrack/?trknbr={$this->tracking_number}",
            'DHL' => "https://www.dhl.com/track/{$this->tracking_number}",
            default => null
        };
    }

    /**
     * Scope for active shipments
     */
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['pending', 'picked_up', 'in_transit', 'out_for_delivery']);
    }

    /**
     * Scope for delivered shipments
     */
    public function scopeDelivered($query)
    {
        return $query->where('status', 'delivered');
    }

    /**
     * Scope for failed shipments
     */
    public function scopeFailed($query)
    {
        return $query->whereIn('status', ['failed', 'returned']);
    }
}
