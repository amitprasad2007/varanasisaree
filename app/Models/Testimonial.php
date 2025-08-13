<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Testimonial extends Model
{
    /** @use HasFactory<\Database\Factories\TestimonialFactory> */
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'name',
        'email',
        'photo',
        'testimonial',
        'testimonial_hi',
        'rating',
        'designation',
        'company',
        'status',
        'approval_status',
    ];

    protected $casts = [
        'status' => 'string',
        'approval_status' => 'string',
        'rating' => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    public function getTestimonialInLanguage($language = 'en')
    {
        if ($language === 'hi' && !empty($this->content_hi)) {
            return $this->content_hi;
        }

        return $this->content;
    }

    public function isActive()
    {
        return $this->status === 'active';
    }

    public function isApproved()
    {
        return $this->approval_status === 'approved';
    }

    public function isPending()
    {
        return $this->approval_status === 'pending';
    }

    public function isRejected()
    {
        return $this->approval_status === 'rejected';
    }
}
