<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Contactus extends Model
{
    /** @use HasFactory<\Database\Factories\ContactusFactory> */
    use HasFactory;

    protected $fillable = ['name', 'email', 'phone', 'message', 'status', 'attachment'];

    public function scopeActive($query): Builder
    {
        return $query->where('status', 'pending');
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
}
