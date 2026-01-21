<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'label',
        'path',
        'icon',
        'section',
        'parent_id',
        'order',
        'is_active',
        'is_logout',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_logout' => 'boolean',
    ];

    public function children()
    {
        return $this->hasMany(VendorMenuItem::class, 'parent_id')->orderBy('order');
    }

    public function parent()
    {
        return $this->belongsTo(VendorMenuItem::class, 'parent_id');
    }
}
