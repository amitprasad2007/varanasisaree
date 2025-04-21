<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VideoProvider extends Model
{
    /** @use HasFactory<\Database\Factories\VideoProviderFactory> */
    use HasFactory;
    protected $fillable = [
        'name',
        'base_url',
        'logo',
        'status',
    ];

    public function videos(): HasMany
    {
        return $this->hasMany(ProductVideo::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
