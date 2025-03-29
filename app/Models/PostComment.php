<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostComment extends Model
{
    /** @use HasFactory<\Database\Factories\PostCommentFactory> */
    use HasFactory;
    protected $fillable = ['post_id', 'user_id', 'content', 'parent_id', 'status'];

    public function post() {
        return $this->belongsTo(Post::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function replies() {
        return $this->hasMany(PostComment::class, 'parent_id');
    }
}
