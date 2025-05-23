<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    /** @use HasFactory<\Database\Factories\BrandFactory> */
    use HasFactory;

    protected $fillable = ['name', 'slug', 'logo','images', 'description', 'status'];

 
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
