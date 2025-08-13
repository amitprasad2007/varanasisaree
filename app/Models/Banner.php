<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Banner extends Model
{
    /** @use HasFactory<\Database\Factories\BannerFactory> */
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'description',
        'link',
        'status',
        'order'
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
