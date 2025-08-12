<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutUsSection extends Model
{
    protected $table = 'aboutus_sections';
    protected $fillable = ['aboutus_id', 'section_title', 'section_content', 'image', 'order', 'status'];

    protected $casts = [
        'section_content' => 'array',
        'order' => 'integer',
    ];

    public function aboutus() {
        return $this->belongsTo(Aboutus::class, 'aboutus_id');
    }
}
