<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aboutus extends Model
{
    /** @use HasFactory<\Database\Factories\AboutusFactory> */
    use HasFactory;

    protected $table = 'aboutuses';
    protected $fillable = ['page_title', 'description', 'image', 'status'];

    public function sections() {
        return $this->hasMany(AboutUsSection::class, 'aboutus_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
