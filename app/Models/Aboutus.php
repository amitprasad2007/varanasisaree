<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Aboutus extends Model
{
    /** @use HasFactory<\Database\Factories\AboutusFactory> */
    use HasFactory;

    protected $table = 'aboutuses';
    protected $fillable = ['page_title', 'description', 'image', 'status'];

    public function sections(): HasMany
    {
        return $this->hasMany(AboutUsSection::class, 'aboutus_id');
    }

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }
}
