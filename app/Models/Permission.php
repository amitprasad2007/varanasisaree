<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Builder;

class Permission extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'status'];

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }
}
