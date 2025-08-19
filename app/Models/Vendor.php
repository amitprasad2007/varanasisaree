<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Vendor extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

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

    protected $casts = [
        'password' => 'hashed',
        'is_verified' => 'boolean',
        'commission_rate' => 'decimal:2',
        'status' => 'string',
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
        return str_replace('://', '://' . $this->subdomain . '.', $baseUrl);
    }

    public function getFullBusinessNameAttribute(): string
    {
        return $this->business_name ?: $this->username;
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_verified;
    }
}
