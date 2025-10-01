<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Event extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'type',
        'description',
        'location',
        'start_at',
        'end_at',
        'capacity',
        'status',
        'banner_url',
        'registration_open_at',
        'registration_close_at'
    ];
    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'registration_open_at' => 'datetime',
        'registration_close_at' => 'datetime',
        'capacity' => 'integer',
    ];

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function getBannerUrlAttribute($value)
    {
        if (!$value) return null;

        if (Str::startsWith($value, 'public/')) {
            $value = substr($value, 7);
        }

        if (Str::startsWith($value, ['http://', 'https://'])) {
            return $value;
        }

        if (Str::startsWith($value, '/')) {
            return asset(ltrim($value, '/'));
        }

        return asset(Storage::url($value));
    }
}
