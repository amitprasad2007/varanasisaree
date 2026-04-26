<?php

namespace App\Models;

use Database\Factories\ContactusFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contactus extends Model
{
    /** @use HasFactory<ContactusFactory> */
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
