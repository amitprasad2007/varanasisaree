<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_name',
        'gst_number',
        'address',
        'city',
        'state',
        'country',
        'postal_code',
        'phone',
        'email',
        'support_email',
        'facebook_url',
        'instagram_url',
        'youtube_url',
        'twitter_url',
        'linkedin_url',
        'whatsapp_number',
        'about_text',
        'founded_year',
        'business_hours',
        'logo_url',
        'additional_data',
    ];

    protected $casts = [
        'additional_data' => 'array',
    ];
}
