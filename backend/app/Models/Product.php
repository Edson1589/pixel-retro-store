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
        'status',
        'is_service'
    ];
    protected $casts = [
        'is_unique' => 'boolean',
        'price' => 'float',
        'is_service' => 'boolean',
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
}
