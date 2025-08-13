<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Customer extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name', 'phone', 'email', 'address', 'gstin', 'password', 'status'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'pending');
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ProductRating::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(PostComment::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
    public function addresses(): HasMany
    {
        return $this->hasMany(AddressUser::class);
    }
    public function cartItems(): HasMany
    {
        return $this->hasMany(Cart::class)->whereNull('order_id');
    }
}


