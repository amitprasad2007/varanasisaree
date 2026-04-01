<?php

namespace App\Models;

use Database\Factories\AddressUserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AddressUser extends Model
{
    /** @use HasFactory<AddressUserFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'full_name',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'country',
        'postal_code',
        'address_type',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    /**
     * Get the user that owns the address.
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
