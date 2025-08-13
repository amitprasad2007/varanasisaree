<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Faq extends Model
{
    use HasFactory;

    protected $table = 'faqs';
    protected $fillable = ['question', 'answer', 'order', 'status'];

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeOrdered($query): Builder
    {
        return $query->orderBy('order', 'asc');
    }

    public function scopePending($query): Builder
    {
        return $query->where('status', 'pending');
    }

    public function scopeResolved($query): Builder
    {
        return $query->where('status', 'resolved');
    }

    public function scopeRejected($query): Builder
    {
        return $query->where('status', 'rejected');
    }

    public function scopeApproved($query): Builder
    {
        return $query->where('status', 'approved');
    }



}
