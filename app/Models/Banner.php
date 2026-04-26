<?php

namespace App\Models;

use Database\Factories\BannerFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    /** @use HasFactory<BannerFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'description',
        'link',
        'status',
        'order',
    ];

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered($query): Builder
    {
        return $query->orderBy('order', 'asc');
    }
}
