<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'sku',
        'description',
        'price',
        'stock',
        'condition',
        'is_unique',
        'image_url',
        'status'
    ];

    protected $casts = [
        'is_unique' => 'boolean',
        'price' => 'float',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getImageUrlAttribute($value)
    {
        if (!$value) return null;

        if (Str::startsWith($value, ['http://', 'https://'])) {
            return $value;
        }

        if (Str::startsWith($value, ['/'])) {
            return asset(ltrim($value, '/'));
        }

        return asset(Storage::url($value));
    }

    /**
     * Scope para búsquedas avanzadas.
     * Ahora soporta múltiples palabras con lógica OR:
     * "Cartucho Control" -> devuelve productos que tengan
     * cartucho O control en name, description o sku.
     */
    public function scopeSearch($query, $term)
    {
        $terms = preg_split('/\s+/', trim($term)); // separar por espacios

        return $query->where(function ($q) use ($terms) {
            foreach ($terms as $t) {
                $t = strtolower($t);
                $q->orWhere(function ($sub) use ($t) {
                    $sub->whereRaw('LOWER(name) LIKE ?', ["%{$t}%"])
                        ->orWhereRaw('LOWER(description) LIKE ?', ["%{$t}%"])
                        ->orWhereRaw('LOWER(sku) LIKE ?', ["%{$t}%"]);
                });
            }
        });
    }
}

