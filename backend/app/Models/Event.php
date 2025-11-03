<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Carbon;

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

    protected $appends = ['registration_open', 'remaining_capacity'];

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function getRegistrationOpenAttribute(): bool
    {
        if ($this->status !== 'published') return false;
        $now = Carbon::now();
        if ($this->registration_open_at && $now->lt($this->registration_open_at)) return false;
        if ($this->registration_close_at && $now->gt($this->registration_close_at)) return false;
        return true;
    }

    public function getRemainingCapacityAttribute(): ?int
    {
        if (!$this->capacity) return null;
        $taken = $this->registrations()
            ->where('status', '!=', 'cancelled')
            ->count();
        return max(0, $this->capacity - $taken);
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
