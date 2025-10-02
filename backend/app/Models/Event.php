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

    /**
     * Scope para búsquedas avanzadas en eventos.
     * Soporta múltiples palabras (OR lógico).
     * Ej: "feria retro" -> encuentra eventos con "feria" O "retro"
     */
    public function scopeSearch($query, $term)
    {
        $terms = preg_split('/\s+/', trim($term));

        return $query->where(function ($q) use ($terms) {
            foreach ($terms as $t) {
                $t = strtolower($t);
                $q->orWhere(function ($sub) use ($t) {
                    $sub->whereRaw('LOWER(title) LIKE ?', ["%{$t}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$t}%"])
                        ->orWhereRaw('LOWER(location) LIKE ?', ["%{$t}%"])
                        ->orWhereRaw('LOWER(type) LIKE ?', ["%{$t}%"]);
                });
            }
        });
    }
}
