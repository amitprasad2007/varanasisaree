<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;
    protected $fillable = ['title', 'slug', 'content', 'user_id', 'category_id', 'status'];

    public function category() {
        return $this->belongsTo(PostCategory::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function comments() {
        return $this->hasMany(PostComment::class);
    }

    public function tags() {
        return $this->belongsToMany(PostTag::class, 'post_tag');
    }
}
