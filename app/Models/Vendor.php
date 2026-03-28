<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Vendor extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username',
        'business_name',
        'email',
        'phone',
        'password',
        'status',
        'is_verified',
        'subdomain',
        'logo',
        'description',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'gstin',
        'pan',
        'bank_name',
        'account_number',
        'ifsc_code',
        'commission_rate',
        'payment_terms',
        'contact_person',
        'contact_email',
        'contact_phone',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_verified' => 'boolean',
            'commission_rate' => 'decimal:2',
        ];
    }

    protected $appends = [
        'subdomain_url',
        'full_business_name',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeVerified(Builder $query): Builder
    {
        return $query->where('is_verified', true);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    public function brands(): HasMany
    {
        return $this->hasMany(Brand::class);
    }

    public function getSubdomainUrlAttribute(): string
    {
        $baseUrl = config('app.url');

        return str_replace('://', '://'.$this->subdomain.'.', $baseUrl);
    }

    public function getFullBusinessNameAttribute(): string
    {
        return $this->business_name ?: $this->username;
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_verified;
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function creditNotes(): HasMany
    {
        return $this->hasMany(CreditNote::class);
    }

    /**
     * Get pending refunds for this vendor
     */
    public function pendingRefunds(): HasMany
    {
        return $this->refunds()->where('refund_status', 'pending');
    }

    /**
     * Get refund statistics for this vendor
     */
    public function getRefundStatistics(): array
    {
        return [
            'total_refunds' => $this->refunds()->count(),
            'pending_refunds' => $this->refunds()->where('refund_status', 'pending')->count(),
            'completed_refunds' => $this->refunds()->where('refund_status', 'completed')->count(),
            'total_refunded_amount' => $this->refunds()->where('refund_status', 'completed')->sum('amount') ?? 0,
            'credit_note_refunds' => $this->refunds()->whereNotNull('credit_note_id')->count(),
            'money_refunds' => $this->refunds()->whereNull('credit_note_id')->count(),
        ];
    }

    /**
     * Check if vendor can process refunds
     */
    public function canProcessRefunds(): bool
    {
        return $this->isActive() && $this->is_verified;
    }

    public function accessibleMenuItems()
    {
        return $this->belongsToMany(VendorMenuItem::class, 'vendor_menu_item_vendor');
    }
}
