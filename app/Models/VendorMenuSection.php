<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorMenuSection extends Model
{
    
    protected $fillable = [
        'name',
        'slug',
        'is_active',
    ];

    public function vendormenuitems(): HasMany
    {
        return $this->hasMany(VendorMenuItem::class, 'vendor_menu_section_id');
    }

}
