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
        'vendor_menu_section_id',
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

    public function vendorMenuSection()
    {
        return $this->belongsTo(VendorMenuSection::class, 'vendor_menu_section_id');
    }

    public function vendors()
    {
        return $this->belongsToMany(Vendor::class, 'vendor_menu_item_vendor');
    }
}
