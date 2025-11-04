<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'type',
        'content',
        'metadata',
        'is_active',
        'last_updated_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'is_active' => 'boolean',
        'last_updated_at' => 'datetime',
    ];

    /**
     * Scope for active pages
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for policy type pages
     */
    public function scopePolicies($query)
    {
        return $query->where('type', 'policy');
    }

    /**
     * Scope for settings type pages
     */
    public function scopeSettings($query)
    {
        return $query->where('type', 'settings');
    }
}
