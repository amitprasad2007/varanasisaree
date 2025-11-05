<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PostCategory extends Model
{
    /** @use HasFactory<\Database\Factories\PostCategoryFactory> */
    use HasFactory;
    protected $fillable = ['name', 'slug', 'status'];

    public function posts(): HasMany
    {
        // Explicitly specify the foreign key since the posts table uses `category_id`
        return $this->hasMany(Post::class, 'category_id');
    }
}
